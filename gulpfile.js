'use strict';

const dir = {
    src: './src/',
    build: './build/',
};

const flatten = require('gulp-flatten');

const {series, parallel, src, dest, watch} = require('gulp');
const plumber = require('gulp-plumber');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync').create();
const del = require('del');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const pug = require('gulp-pug');
const prettyHtml = require('gulp-pretty-html');
const replace = require('gulp-replace');
const cssmin = require('gulp-cssmin');
const rename = require('gulp-rename');

function compilePug() {
    return src([
        dir.src + 'pages/**/*.pug',
        dir.src + 'pages/*.pug',
    ])
        .pipe(flatten())
        .pipe(plumber({
            errorHandler: function (err) {
                console.log(err.message);
                this.emit('end');
            }
        }))
        .pipe(pug())
        .pipe(prettyHtml({
            indent_size: 2,
            indent_char: ' ',
            unformatted: ['code', 'em', 'strong', 'span', 'i', 'b', 'br',],
            content_unformatted: [],
        }))
        .pipe(replace(/^(\s*)(<button.+?>)(.*)(<\/button>)/gm, '$1$2\n$1  $3\n$1$4'))
        .pipe(replace(/^( *)(<.+?>)(<script>)([\s\S]*)(<\/script>)/gm, '$1$2\n$1$3\n$4\n$1$5\n'))
        .pipe(replace(/^( *)(<.+?>)(<script\s+src.+>)(?:[\s\S]*)(<\/script>)/gm, '$1$2\n$1$3$4'))
        .pipe(dest(dir.build));
}

exports.compilePug = compilePug;

function compileStyles() {
    return src(dir.src + 'scss/style.scss')
        .pipe(plumber({
            errorHandler: function (err) {
                console.log(err.message);
                this.emit('end');
            }
        }))
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(postcss([
            autoprefixer({overrideBrowserslist: ['last 5 version']}),
        ]))
        .pipe(sourcemaps.write('/'))
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(dest(dir.build + 'css/'))
        .pipe(browserSync.stream());
}

exports.compileStyles = compileStyles;

function processJs() {
    return src([
        dir.src + 'js/script.js',
    ])
        .pipe(plumber({
            errorHandler: function (err) {
                console.log(err.message);
                this.emit('end');
            }
        }))
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(uglify())
        .pipe(concat('script.min.js'))
        .pipe(dest(dir.src + 'js/'))
}

exports.processJs = processJs;

function processLibsJs() {
    return src([
        dir.src + 'js/script.min.js',
    ])
        .pipe(concat('script.min.js'))
        .pipe(dest(dir.build + 'js/'))
}

exports.processLibsJs = processLibsJs;

function copyImages() {
    return src([
        dir.src + 'img/*.{jpg,jpeg,png,svg,webp,gif,ico,mp4}',
        dir.src + 'img/**/*.{jpg,jpeg,png,svg,webp,gif,ico,mp4}',
        dir.src + 'blocks/**/img/*.{jpg,jpeg,png,svg,webp,gif,mp4}',
        dir.src + 'blocks/**/**/img/*.{jpg,jpeg,png,svg,webp,gif,mp4}',
        dir.src + 'pages/**/img/*.{jpg,jpeg,png,svg,webp,gif,mp4}',
    ])
        .pipe(flatten())
        .pipe(dest(dir.build + 'img/'));
}

exports.copyImages = copyImages;

function copyFonts() {
    return src(dir.src + 'fonts/**/*.{ttf,eot,svg,woff,woff2}')
        .pipe(dest(dir.build + 'fonts/'));
}

exports.copyFonts = copyFonts;

function clean() {
    return del(dir.build)
}

exports.clean = clean;

function serve() {
    browserSync.init({
        server: dir.build,
        startPath: 'index.html',
        open: false,
        port: 8080,
    });
    watch([
        dir.src + 'scss/*.scss',
        dir.src + 'blocks/*.scss',
        dir.src + 'blocks/**/*.scss',
        dir.src + 'blocks/**/**/*.scss',
        dir.src + 'pages/**/*.scss',
    ], compileStyles);
    watch([
        dir.src + 'pug/*.pug',
        dir.src + 'blocks/**/*.pug',
        dir.src + 'blocks/**/**/*.pug',
        dir.src + 'pages/**/*.pug',
    ], compilePug);
    watch(dir.src + 'js/script.js', processJs);
    watch(dir.src + 'js/script.min.js', processLibsJs);
    watch([
        dir.src + 'img/*.{jpg,jpeg,png,svg,webp,gif,ico}',
        dir.src + 'img/**/*.{jpg,jpeg,png,svg,webp,gif,ico}',
        dir.src + 'blocks/**/img/*.{jpg,jpeg,png,svg,webp,gif}',
        dir.src + 'blocks/**/**/img/*.{jpg,jpeg,png,svg,webp,gif}',
        dir.src + 'pages/**/img/*.{jpg,jpeg,png,svg,webp,gif}',
    ], copyImages);
    watch([
        dir.build + '*.html',
        dir.build + 'js/*.js',
        dir.build + 'img/*.{jpg,jpeg,png,svg,webp,gif}',
    ]).on('change', browserSync.reload);
}

exports.default = series(
    clean,
    parallel(compileStyles, compilePug, processJs, copyImages, copyFonts),
    processLibsJs,
    serve
);

exports.build = series(
    clean,
    parallel(compileStyles, compilePug, processJs, copyImages, copyFonts),
    processLibsJs
);