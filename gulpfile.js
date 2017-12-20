
/*
 npm install gulp gulp-load-plugins
 npm install gulp-convert-encoding gulp-clean gulp-file gulp-git gulp-rename gulp-batch-replace gulp-tar gulp-gzip moment run-sequence
 */

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
            sourse: config.name
        };
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

// Ревизии
gulp.task('version-tools', getTask('version-tools'));

// Очистка директории со сборкой
gulp.task('clean', getTask('clean'));

// Очистка директории со сборкой
gulp.task('clean_sourse', getTask('clean_sourse'));

// Копирование всех файлов модуля в директорию сборки
gulp.task('move', ['version'], getTask('move'));

// Перенос последней версии модуля в директорию сборки
gulp.task('diff', ['version'], getTask('diff'));

// Кодирование в 1251
gulp.task('encode', getTask('encode'));

// Архивирует в zip
gulp.task('archive', getTask('archive'));

// Заменяем подмодули
gulp.task('tools', getTask('tools'));

// Сборка текущей версии модуля
gulp.task('build', getTask('build'));

// Сборка текущей версии модуля
gulp.task('build_last_version', getTask('build_last_version'));

// Сборка обновления модуля (разница между последней и предпоследней версией по тегам git)
gulp.task('build_update', getTask('build_update'));

// Дефолтная задача. Собирает все по очереди
gulp.task('default', (callback) => {
    plugins.sequence('build_last_version', 'build_update', callback);
});
// Дефолтная задача. Собирает все по очереди