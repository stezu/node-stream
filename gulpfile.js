var gulp = require('gulp');
var eslint = require('gulp-eslint');
var mocha = require('gulp-mocha');
var sequence = require('gulp-sequence');

var source = {
  js: ['*.js', 'lib/**/*.js', 'performance/**/*.js', 'test/**/*.js'],
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

gulp.task('coverage', function() {
  return gulp.src(source.test)
    .pipe(mocha({
      istanbul: true
    }));
});

gulp.task('watch', ['default'], function() {
  gulp.watch(source.js, sequence('lint', 'test'));
});

gulp.task('default', sequence('lint', 'test'));
