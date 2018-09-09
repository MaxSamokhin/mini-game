'use strict';

const gulp = require('gulp');
const concat = require('gulp-concat');
const webserver = require('gulp-webserver');
const svgstore = require('gulp-svgstore');
const inject = require('gulp-inject');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const eslint = require('gulp-eslint');
const less = require('gulp-less');

const paths = {
    IMAGES: ['src/**/*.png', 'src/**/*.img', 'src/**/*.gif'],
    SVG: 'src/**/*.svg',
    JS: 'src/**/*.js',
    DIST: 'public/dist',
    PUBLIC: 'public',
    INDEX_HTML: 'public/*.html',
    INDEXES: 'src/*.html',
    DIST_IMAGE: 'public/images',
    LESS: 'src/assets/style/main.less',
    LESS_ALL: 'src/**/*.less',
};

gulp.task('less', function() {
    return gulp.src(paths.LESS)
        .pipe(less())
        .pipe(gulp.dest(paths.DIST));
});

gulp.task('less:watch', () => {
    gulp.watch(paths.LESS_ALL, ['less']);
});

gulp.task('svgstore', () => {
    const svgs = gulp
        .src(paths.SVG)
        .pipe(svgstore({inlineSvg: true}));

    function fileContents(filePath, file) {
        return file.contents.toString();
    }

    return gulp
        .src(paths.INDEX_HTML)
        .pipe(inject(svgs, {transform: fileContents}))
        .pipe(gulp.dest(paths.PUBLIC));
});

gulp.task('img', () => {
    gulp.src(paths.IMAGES)
        .pipe(rename({
            dirname: ''
        }))
        .pipe(gulp.dest(paths.DIST_IMAGE));
});

gulp.task('index-file', () => {
    gulp.src(paths.INDEXES)
        .pipe(rename({
            dirname: ''
        }))
        .pipe(gulp.dest(paths.PUBLIC));
});

gulp.task('index:watch', () => {
    gulp.watch(paths.INDEXES, ['index-file', 'svgstore']);
});

gulp.task('server', () => {
    gulp.src(paths.PUBLIC)
        .pipe(webserver({
            livereload: true,
            open: true,
            port: '7001',
        }));
});

gulp.task('babel:build', () => {
    return gulp.src(paths.JS)
        .pipe(babel())
        .pipe(concat('main.js'))
        .pipe(gulp.dest(paths.DIST));
});

gulp.task('js:watch', () => {
    gulp.watch(paths.JS, ['babel:build']);
});

gulp.task('static', ['index-file', 'svgstore', 'img', 'less', 'babel:build']);
gulp.task('static-watch', ['index:watch', 'svgstore', 'img', 'less:watch', 'js:watch']);

gulp.task('eslint', () => {
    return gulp.src(paths.JS)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});