
/*
 npm install gulp gulp-load-plugins
 npm install gulp-convert-encoding gulp-clean gulp-file gulp-git gulp-rename gulp-batch-replace gulp-tar gulp-gzip moment run-sequence
 */

const config = {
    name: 'project.ajax',
    task: './project.tools/gulp/',
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
};
let gulp = require('gulp'),
        plugins = require('gulp-load-plugins')(),
        setting = {
            sourse: config.name
        };
require(config.task + 'load')(gulp, plugins, config, setting);

// Дефолтная задача. Собирает все по очереди
gulp.task('default', (callback) => {
//    plugins.sequence('tools', callback);
    plugins.sequence('build_last_version', 'build_update', callback);
});
// Дефолтная задача. Собирает все по очереди