const gulp = require('gulp');
const rename = require('gulp-rename');
const less = require('gulp-less');

const paths = {
    INDEX_HTML: 'src/index.html',
    DIST: 'dist',
    LESS: 'src/assets/style/main.less',
    LESS_ALL: 'src/**/*.less',
};

gulp.task('html', () => {
    gulp.src(paths.INDEX_HTML)
        .pipe(rename({
            dirname: ''
        }))
        .pipe(gulp.dest(paths.DIST));
});

gulp.task('html:watch', () => {
    gulp.watch(paths.INDEX_HTML, ['html']);
});

gulp.task('less', function() {
    return gulp.src(paths.LESS)
        .pipe(less())
        .pipe(gulp.dest(paths.DIST));
});

gulp.task('less:watch', () => {
    gulp.watch(paths.LESS_ALL, ['less']);
});

gulp.task('static', ['html', 'less']);
gulp.task('static-dev', ['html:watch', 'less:watch']);
