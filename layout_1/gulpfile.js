"use strict";
/// <binding AfterBuild='default' Clean='clean' />
// Load plugins
const autoprefixer = require("gulp-autoprefixer");
const browsersync = require("browser-sync").create();
const cleanCSS = require("gulp-clean-css");
const del = require("del");
const gulp = require("gulp");
const header = require("gulp-header");
const merge = require("merge-stream");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const uglify = require("gulp-uglify");
var concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
// Load package.json for banner
const pkg = require('./package.json');

// Set the banner content
const banner = ['/*!\n',
  ' * TanTrinh - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2018-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> (https://github.com/thanhtantrinh/<%= pkg.name %>/blob/master/LICENSE)\n',
  ' */\n',
  '\n'
].join('');

// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "./"
    },
      port: 64821
  });
  done();
}

// BrowserSync reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Clean vendor
function clean() {
    return del(["./vendor/"]);
}

// Bring third party dependencies from node_modules into vendor directory
function modules() {
  // Bootstrap JS
  var bootstrapJS = gulp.src('./node_modules/bootstrap/dist/js/*')
        .pipe(gulp.dest('./vendor/bootstrap/js'));

  // Bootstrap SCSS
  var bootstrapSCSS = gulp.src('./node_modules/bootstrap/scss/**/*')
        .pipe(gulp.dest('./vendor/bootstrap/scss'));

    return merge(bootstrapJS, bootstrapSCSS );
}

// CSS task
function css() {
    return gulp
        .src("./scss/**/*.scss")
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(sass({
            outputStyle: "expanded",
            includePaths: "./node_modules",
        }))
        .on("error", sass.logError)
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(header(banner, {
            pkg: pkg
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("./css"))
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(cleanCSS())
        .pipe(gulp.dest("./css"));
    //.pipe(browsersync.stream());
}

// Watch files
function watchFiles() {
  gulp.watch("./scss/**/*", css);
}

const vendor = gulp.series(clean, modules);
const build = gulp.series(vendor, gulp.parallel(css));

// Define complex tasks
const watch = gulp.series(build, gulp.parallel(watchFiles, browserSync));
exports.watch = watch;
exports.vendor = vendor;
exports.build = build;
