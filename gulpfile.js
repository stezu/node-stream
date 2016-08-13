var gulp = require('gulp');
var eslint = require('gulp-eslint');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var sequence = require('gulp-sequence');

var source = {
  js: ['*.js', 'lib/**/*.js', 'performance/**/*.js', 'test/**/*.js'],
  lib: ['lib/**/*.js'],
  test: ['test/**/*.js']
};

gulp.task('lint', function() {
  return gulp.src(source.js)
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('test', function() {
  return gulp.src(source.test)
    .pipe(mocha());
});

gulp.task('pre-coverage', function() {
  return gulp.src(source.lib)
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
});

gulp.task('coverage', ['pre-coverage'], function() {
  return gulp.src(source.test)
    .pipe(mocha())
    .pipe(istanbul.writeReports())
    .pipe(istanbul.enforceThresholds({
      thresholds: {
        global: 98,
        each: 90
      }
    }));
});

gulp.task('watch', ['default'], function() {
  gulp.watch(source.js, sequence('lint', 'test'));
});

gulp.task('default', sequence('lint', 'test'));
