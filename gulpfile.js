var gulp = require('gulp');
var gulpif = require('gulp-if');
var eslint = require('gulp-eslint');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var sequence = require('gulp-sequence');
var beeper = require('beeper');
var docs = require('./build/docs.js');

var source = {
  js: ['*.js', 'build/**/*.js', 'lib/**/*.js', 'test/**/*.js'],
  lib: ['lib/**/*.js'],
  test: ['test/**/*.test.js']
};

gulp.task('lint', function () {
  return gulp.src(source.js)
    .pipe(eslint())
    .pipe(eslint.results(function (results) {
      if (results.warningCount || results.errorCount) {
        beeper();
      }
    }))
    .pipe(eslint.format())
    .pipe(gulpif(gulp.seq.indexOf('watch') < 0, eslint.failAfterError()));
});

gulp.task('test', function () {
  return gulp.src(source.test)
    .pipe(mocha());
});

gulp.task('coverage-instrument', function () {
  return gulp.src(source.lib)
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
});

gulp.task('coverage-report', function () {
  return gulp.src(source.test)
    .pipe(istanbul.writeReports())
    .pipe(istanbul.enforceThresholds({
      thresholds: {
        global: 98,
        each: 90
      }
    }));
});

gulp.task('coverage', sequence('coverage-instrument', 'test', 'coverage-report'));

gulp.task('docs', function () {
  return gulp.src(source.lib.concat('README.md'), { read: false })
    .pipe(docs());
});

gulp.task('watch:run', function (done) {
  sequence('lint', 'test')(done);
});

gulp.task('watch', ['watch:run'], function () {
  gulp.watch(source.js, ['watch:run']);
});

gulp.task('build', sequence('lint', 'coverage', 'docs'));

gulp.task('default', sequence('lint', 'test', 'docs'));
