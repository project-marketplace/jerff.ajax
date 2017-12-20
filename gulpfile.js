
let gulp = require('gulp'),
        plugins = require('gulp-load-plugins')(),
        config = {
            name: 'project.ajax',
            task: './project.tools/gulp/task/',
            build: 'build',
            dist: 'dist',
            tools: {
                'project.tools': ['Project', 'Tools']
            },
            path: [
                '!{node_modules,node_modules/**}',
                '!{build,build/**}',
                '!{dist,dist/**}',
                '!*.js',
                '!*.json'
            ]
        },
        setting = {
            sourse: config.name,
            tools: []
        };
plugins.replace = require('gulp-batch-replace');
plugins.path = require('path');
plugins.os = require('os');
plugins.moment = require('moment');
plugins.sequence = require('run-sequence');

function getTask(task) {
    return require(config.task + task)(gulp, plugins, config, setting);
}

// Инициализация версии
gulp.task('version', ['version-tags', 'version-tools'], getTask('version'));

// Теги
gulp.task('version-tags', getTask('version-tags'));

// ревизии
gulp.task('version-tools', getTask('version-tools'));

// Очистка директории со сборкой
gulp.task('clean', getTask('clean'));

// Копирование всех файлов модуля в директорию сборки
gulp.task('move', ['version'], getTask('move'));

// Кодирование в 1251
gulp.task('encode', getTask('encode'));

// Архивирует в zip
gulp.task('archive', ['tools'], getTask('archive'));

// Заменяем подмодули
gulp.task('tools', getTask('tools'));

// Сборка текущей версии модуля cp1251
gulp.task('build', (callback) => {
//    plugins.sequence('clean', callback);
    plugins.sequence('clean', 'move', 'encode', 'archive', callback);
});

// Сборка текущей версии модуля cp1251
gulp.task('build_cp1251', (callback) => {
    setting.file = 'cp1251';
    plugins.sequence('clean', 'move', 'encode', 'archive', 'clean', callback);
});

// Сборка текущей версии модуля utf-8
gulp.task('build_utf8', (callback) => {
    setting.file = 'utf8';
    plugins.sequence('clean', 'move', 'archive', 'clean', callback);
});

// Сборка текущей версии модуля
gulp.task('build_last_version', (callback) => {
    setting.file = setting.sourse = '.last_version';
    plugins.sequence('clean', 'move', 'encode', 'archive', 'clean', callback);
});

// Сборка обновления модуля (разница между последней и предпоследней версией по тегам git)
gulp.task('build_update', (callback) => {
    plugins.sequence('clean', 'version', function () {
        setting.file = setting.sourse = setting.version;
        plugins.sequence('diff', 'encode', 'archive', 'clean', callback);
    });
});

// Перенос последней версии модуля в директорию сборки
gulp.task('diff', (callback) => {
    git.exec({args: `diff ${setting.version} --name-only`}, (error, output) => {
        if (error) {
            callback(error);
        }
        const globs = extendGlob(output.split(plugins.os.EOL));
        gulp.src(globs, {base: './'})
                .pipe(gulp.dest(plugins.path.join(config.build, setting.version)))
                .on('end', callback);
    });
});



// Дефолтная задача. Собирает все по очереди
gulp.task('default', (callback) => {
    sequence('build_last_version', 'build_update', 'build_utf8', 'build_cp1251', callback);
});
// Дефолтная задача. Собирает все по очереди