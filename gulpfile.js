let gulp = require('gulp'),
    iconv = require('gulp-iconv'),
    clean = require('gulp-clean'),
    copy = require('gulp-copy'),
    git = require('gulp-git'),
    path = require('path'),
    rename = require('gulp-rename'),
    replace = require('gulp-replace'),
    zip = require('gulp-zip'),
    file = require('gulp-file'),
    os = require('os'),
    fs = require('fs'),
    moment = require('moment'),
    sequence = require('run-sequence');

const modulName = 'project.ajax';
const buildFolder = 'build';
const distrFolder = 'dist';
const tools = {
    'project.tools': {
        search: 'Project\\Tools'
    }
};

let lastVersion = null;
let previousVersion = null;
let itemName = null;
let souseName = null;

/**
 * Проверка на число
 * @param n
 * @returns {boolean}
 */
const isNumeric = n => {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

/**
 * Принимает строку или массив. Превращает в массив, и дополняет его glob шаблонами для исключения лишних файлов сборки
 * @param glob
 * @returns {Array}
 */
const extendGlob = glob => {
    let globs = [];
    if (typeof glob === 'string') {
        globs.push(glob);
    } else {
        globs = glob;
    }

    globs.push('!{node_modules,node_modules/**}');
    globs.push('!{build,build/**}');
    globs.push('!{dist,dist/**}');
    globs.push('!*.js');
    globs.push('!*.json');
    return globs;
};

/**
 * Возвращает промис, в котором можно получить доступ к выводу команды git tag
 */
const getTags = () => {
    return new Promise(resolve => {
        git.exec({args: 'tag --sort=-creatordate --format=\'%(creatordate:rfc)%09%(refname)\''}, (error, output) => {
            if (error) {
                throw error;
            }

            resolve(output);
        });
    });
};

/**
 * Парсит вывод от команды git tag
 * @param log
 */
const parseVersions = log => {

    let tags = log.trim().split(os.EOL);

    if (tags.length <= 1) {
        // Если версий нет, то подменим вывод
        tags.push(moment().format() + '\trefs/tags/0.0.1');
    }

    return tags.map((tag) => {
        let match = tag.split('\t');

        if (match.length > 1) {
            let date = moment(match[0].trim()).format('YYYY-MM-DD HH:mm:ss');
            let version = match[1].replace('refs/tags/', '');

            // Самый ад тут. Используем только теги формата:
            // 1.0
            // 1.0.0
            // ради этого подключать semver нет смысла
            const versionArray = version.split('.');
            if (versionArray.length < 2 || versionArray.length > 3) {
                return null;
            }

            if (versionArray.length === 2) {
                versionArray[2] = 0;
            }

            if (!isNumeric(versionArray[0]) || !isNumeric(versionArray[1]) || !isNumeric(versionArray[2])) {
                return null;
            }

            version = versionArray.join('.');

            return {
                version: version,
                date: date
            };
        }
    }).filter(tag => {
        return tag !== null;
    });
};

/**
 * Возвращает название для архива сборки в зависимости от ОС
 * @returns {string}
 */
const getVersionArchiveName = () => {
    if(itemName) {
        return itemName;
    }
    if (lastVersion.version === previousVersion.version) {
        if (os.platform() === 'darwin') {
            return '.last_version'
        }

        return '.last_version';
    }

    return lastVersion.version;
};

/**
 * Возвращает название директории сборки в зависимости от ОС
 * @returns {string}
 */
const getVersionFolderName = () => {
    const folderName = getVersionArchiveName();
    if (lastVersion.version === previousVersion.version && os.platform() === 'darwin') {
        return '.' + folderName;
    }

    return folderName;
};

/**
 * Создает содержимое для файла версии
 *
 * @param version
 * @param date
 * @returns {string}
 */
const createVersionFileContent = (version, date) => {
    return `<?
$arModuleVersion = array(
\t"VERSION" => "${ version }",
\t"VERSION_DATE" => "${ date }"
);
?>`;
};

// Очистка директории со сборкой
gulp.task('clean', () => {
    return gulp.src(buildFolder).pipe(clean());
});

// Копирование всех файлов модуля в директорию сборки
gulp.task('move', () => {
    const version = getVersionFolderName();
    return gulp.src(extendGlob('./**'), {base: './'})
        .pipe(gulp.dest(path.join(buildFolder, version)));
});

// Кодирование в 1251
gulp.task('encode', () => {
    const version = getVersionFolderName();
    return gulp.src([
        path.join(buildFolder, version, '**/*.php'),
        path.join(buildFolder, version, '**/*.js')
    ], {dot: true})
        .pipe(iconv({encoding: 'win1251'}))
        .pipe(gulp.dest(path.join(buildFolder, version)));
});

// Архивирует в zip
gulp.task('archive', () => {
    const version = getVersionArchiveName();
    return gulp.src(path.join(buildFolder, '**/*'), {dot: true})
        .pipe(zip(version + '.zip', {compress: true}))
        .pipe(gulp.dest(buildFolder));
});

// Переносит в директорию с дистрибутивом
gulp.task('dist', () => {
    return gulp.src([
        //path.join(buildFolder, '*.tar.gz'),
        path.join(buildFolder, '*.zip')
    ])
    .pipe(gulp.dest(distrFolder));
});

// Переносит в директорию с дистрибутивом
gulp.task('dist_last', () => {
    return gulp.src([
        //path.join(buildFolder, '*.tar.gz'),
        path.join(buildFolder, '\.*.zip')
    ])
    .pipe(gulp.dest(distrFolder));
});

// Заменяет файл с версией модуля
gulp.task('version', () => {

    const version = getVersionFolderName();
    const fileContent = createVersionFileContent(lastVersion.version, lastVersion.date);

    return gulp.src(path.join(buildFolder, version, 'install', 'version.php'))
        .pipe(file('version.php', fileContent))
        .pipe(gulp.dest(path.join('install')))
        .pipe(gulp.dest(path.join(buildFolder, version, 'install')));
});

// Заменяем подмодули
gulp.task('tools', () => {
    const version = getVersionFolderName();
    for(let index in tools) {
        console.log(index, tools[index].search);
        git.exec({args: 'submodule status '+ index}, function (err, stdout) {
            if (err) throw err;
            stdout = stdout.split(' ');
            let rev = stdout[1];
            gulp.src(path.join(buildFolder, version, '**/*.php'))
                .pipe(replace(tools[index].search, function() {
                    return 'Project\\Ver'+ rev +'\\Tools';
                }))
                .pipe(gulp.dest(path.join(buildFolder, version)));
        });

    }
//    tools.each(function(k, v) {
//    });
});

// Перенос последней версии модуля в директорию сборки
gulp.task('diff', (callback) => {
    git.exec({args: `diff ${previousVersion.version} --name-only`}, (error, output) => {
        if (error) {
            callback(error);
        }

        const globs = extendGlob(output.split(os.EOL));

        gulp.src(globs, {base: './'})
            .pipe(gulp.dest(path.join(buildFolder, getVersionFolderName())))
            .on('end', callback);
    });
});

// копирует файл
gulp.task('rename', () => {
    return gulp.src(path.join(buildFolder, itemName + '.zip'))
        .pipe(rename(function (path) {
            path.basename = souseName;
        }))
        .pipe(gulp.dest(distrFolder));
});

// Сборка текущей версии модуля cp1251
gulp.task('build_cp1251', (callback) => {
    getTags().then(function(output) {
        const versions = parseVersions(output);
        lastVersion = previousVersion = versions[0];
        itemName = modulName;
        souseName = 'cp1251';
        sequence('clean', 'move', 'tools', 'version', 'encode', 'archive', 'rename', 'clean', callback);
    }).catch((error) => {
        console.log(error);
    });
});

// Сборка текущей версии модуля utf-8
gulp.task('build_utf8', (callback) => {
    getTags().then(function(output) {
        const versions = parseVersions(output);
        lastVersion = previousVersion = versions[0];
        itemName = modulName;
        souseName = 'utf8';
        sequence('clean', 'move', 'tools', 'version', 'archive', 'rename', 'clean', callback);
    }).catch((error) => {
        console.log(error);
    });
});

// Сборка текущей версии модуля
gulp.task('build_last_version', (callback) => {
    getTags().then(function(output) {
        const versions = parseVersions(output);
        lastVersion = previousVersion = versions[0];
        sequence('clean', 'move', 'tools', 'version', 'encode', 'archive', 'dist_last', 'clean', callback);
    }).catch((error) => {
        console.log(error);
    });
});

// Сборка обновления модуля (разница между последней и предпоследней версией по тегам git)
gulp.task('build_update', (callback) => {
    getTags().then(function(output) {
        const versions = parseVersions(output);
        lastVersion = versions[0];
        previousVersion = versions[1];
        sequence('clean', 'diff', 'tools', 'version', 'encode', 'archive', 'dist', callback);
    }).catch((error) => {
        console.log(error);
    });
});

// Дефолтная задача. Собирает все по очереди
gulp.task('default', (callback) => {
    sequence('build_last_version', 'build_update', 'build_utf8', 'build_cp1251', callback);
});
// Дефолтная задача. Собирает все по очереди