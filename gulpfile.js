var stylish = require('jshint-stylish'),
    jshint = require('gulp-jshint'),
    gutil = require('gulp-util'),
    replace = require('gulp-replace'),
    uglify = require('gulp-uglify'),
    harp = require('harp'),
    fs = require('fs-extra'),
    path = require('path'),
    del = require('del'),
    git = require('gulp-git'),
    gulp = require('gulp'),
    size = require('gulp-size'),
    glob = require('glob'),
    buffer = require('vinyl-buffer'),
    source = require('vinyl-source-stream'),
    browserify = require('browserify'),
    paths = require('./paths');

gulp.task('harp_compile', ['compile_vendor_js'], function (done) {

    del.sync(paths.PUBLIC);

    //fs.copySync(paths.HARP_JS, paths.SRC_CONFIG_JSON);

    harp.compile(paths.SRC, paths.PUBLIC, function (errors) {
        if (errors) {
            console.log(JSON.stringify(errors, null, 2));
        } else {
            gutil.log('Harp compilation complete!');
            done();
        }
    });
});

gulp.task('lint', ['harp_compile'], function () {
    return gulp.src([path.join(paths.SRC, 'app/*/*.js')])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter(stylish));
});

gulp.task('compile_js', ['lint'], function () {

    return browserify({debug: false})
        .add('./src/app/app.js')
        .external('jquery')
        .external('lodash')
        .external('underscore')
        .external('backbone')
        .external('backbone.marionette')
        .external('backbone.radio')
        .external('bowser')
        .bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .on('error', gutil.beep)
        .pipe(source('./public/javascript/app.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('./'));
});

gulp.task('copy_sass_compiled_files', ['compile_js'], function () {
    fs.copySync('./public/scss/stylesheet.css', './public/css/stylesheet.css');
});

gulp.task('replace_info', ['copy_sass_compiled_files'], function (done) {

    git.exec({args: 'rev-parse HEAD'}, function (err, stdout) {

        gulp.src([paths.PUBLIC + '/*/index.html'])
            .pipe(replace(/PROJECT_PUBLISH_DATE/g, '\r' + new Date().toString()))
            .pipe(replace(/PROJECT_COMMIT/g, stdout.replace(/\r/, '')))
            .pipe(gulp.dest('./public'));

        done();
    });
});

gulp.task('remove_unnecessary_public_files', ['replace_info'], function (done) {

    del.sync(paths.PUBLIC + '/app');
    del.sync(paths.PUBLIC + '/scss');

    done();

});

gulp.task('compile', ['remove_unnecessary_public_files'], function () {
    return gulp.src([paths.PUBLIC + '/*/*.*'])
        .pipe(size());
});

gulp.task('compile_vendor_js', function () {

    return browserify({debug: false})
        .require("lodash", {expose: 'lodash'})
        .require("jquery", {expose: 'jquery'})
        .require("underscore", {expose: 'underscore'})
        .require("backbone", {expose: 'backbone'})
        .require("backbone.marionette", {expose: 'backbone.marionette'})
        .require("backbone.radio", {expose: 'backbone.radio'})
        .require("bowser", {expose: 'bowser'})
        .bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .on('error', gutil.beep)
        .pipe(source('./src/javascript/vendor.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('./'));
});

gulp.task('docs', function () {

    del.sync(paths.DOCS);

    var jsdoc = require("gulp-jsdoc");
    gulp.src(glob.sync(paths.SRC_JS + "/**/*.js", {ignore: paths.SRC_JS + "/framework/**"}))
        .pipe(jsdoc(paths.DOCS))

});

gulp.task('default', function () {

});

gulp.task('status', function () {
    git.exec({args: 'rev-parse HEAD'}, function (err, stdout) {
        gutil.log(stdout);
    });
});