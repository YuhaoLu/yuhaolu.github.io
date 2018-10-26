/* eslint-env node */
const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const eslint = require('gulp-eslint');
const browserSync = require('browser-sync').create();
const jasmineBrowser = require('gulp-jasmine-browser');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');

// default task - realtime development
gulp.task('default', ['copy-html', 'copy-images', 'styles', 'lint'],
    function() {
      // if any .scss file got changed, invoke the 'styles' task
      gulp.watch('sass/**/*.scss', ['styles']);
      gulp.watch('js/**/*.js', ['lint']);
      gulp.watch('index.html', ['copy-html']);
      gulp.watch('index.html').on('change', browserSync.reload);

      browserSync.init({
        server: './',
      });
    }
);

// production task - delivery
gulp.task('dist', [
  'copy-html',
  'copy-images',
  'styles',
  'lint',
  'scripts-dist',
]);

gulp.task('copy-html', function() {
  gulp.src('./index.html')
      .pipe(gulp.dest('./dist'));
});

gulp.task('copy-images', function() {
  return gulp.src('img/*')
      .pipe(imagemin({
        progressive: true,
        use: [pngquant()],
      }))
      .pipe(gulp.dest('dist/img'));
});

gulp.task('scripts-dist', function() {
  gulp.src('js/**/*.js')
      .pipe(sourcemaps.init())
      .pipe(babel())
      .pipe(concat('all.js'))
      .pipe(uglify())
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('dist/js'));
});

gulp.task('styles', function() {
  gulp.src('sass/**/*.scss')
      .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
      .pipe(
          autoprefixer({
            browsers: ['last 2 versions'],
          })
      )
      .pipe(gulp.dest('dist/css'))
      .pipe(browserSync.stream());
});

gulp.task('lint', function() {
  return (
    gulp.src(['js/**/*.js'])
        // eslint() attaches the lint output to the eslint property
        // of the file object so it can be used by other modules.
        .pipe(eslint())
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failOnError last.
        .pipe(eslint.failOnError())
  );
});

gulp.task('tests', function() {
  return gulp
      .src('tests/spec/extraSpec.js')
      .pipe(jasmineBrowser.specRunner({console: true}))
      .pipe(jasmineBrowser.headless({driver: 'chrome'}));
});

// Run Tests in the Browser
gulp.task('tests-browser', function() {
  gulp.src('tests/spec/extraSpec.js')
      .pipe(jasmineBrowser.specRunner())
      .pipe(jasmineBrowser.server({port: 3001}));
});
