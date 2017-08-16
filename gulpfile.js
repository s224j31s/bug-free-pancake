var pug = require("gulp-pug");
var less = require("gulp-less");
var watch = require("gulp-watch");
var minify = require("gulp-minify");
var prettify = require("gulp-prettify");
var gulp = require("gulp");
var browsersync = require('browser-sync');
var runsequence = require('run-sequence');

gulp.task('pug',function(){
    return gulp.src('templates/*.pug')
    .pipe(pug())
    .pipe(prettify())
    .pipe(gulp.dest('build'))
    .pipe(browsersync.reload({
        stream: true
    }))
});

gulp.task('less', function(){
   return gulp.src('less/*.less')
   .pipe(less())
   .pipe(minify())
   .pipe(gulp.dest('build'))
   .pipe(browsersync.reload({
        stream: true
    }))
});

gulp.task('js', function(){
   return gulp.src('scripts/*.js')
   .pipe(minify())
   .pipe(gulp.dest('build'))
   .pipe(browsersync.reload({
        stream: true
    }))
});

gulp.task('browsersync', function(){
   browsersync.init({server :{baseDir: 'build'},
       port:'8082'
   }); 
});

gulp.task('watch', function(){
    runsequence('pug', 'less', 'js','browsersync', function(e){
        
    });
    
    gulp.watch('templates/*.pug',['pug']);
    gulp.watch('less/*.less', ['less']);
    gulp.watch('scripts/*.js', ['js']);
});