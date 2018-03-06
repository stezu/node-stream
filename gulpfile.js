var gulp = require('gulp');
var packageJson = require('./package.json');

var majorVersion = process.version.slice(1).split('.')[0];

var source = {
  js: ['*.js', 'lib/**/*.js', 'test/**/*.js'],
  lib: ['lib/**/*.js'],
  test: ['test/**/*.test.js']
};
var dest = {
  docs: './docs'
};

gulp.task('docs', function () {
  var documentation;

  if (majorVersion < 4) {
    // eslint-disable-next-line no-console
    return console.log('Documentationjs cannot run on Node', process.version);
  }

  // require documentation once we've determined we can
  // eslint-disable-next-line global-require
  documentation = require('gulp-documentation');

  return gulp.src(source.lib, { read: false })
    .pipe(documentation('html', {
      sortOrder: 'alpha',
      github: true
    }, {
      name: packageJson.name,
      version: packageJson.version
    }))
    .pipe(gulp.dest(dest.docs));
});
