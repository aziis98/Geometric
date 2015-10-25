var gulp = require('gulp')
var coffee = require('gulp-coffee')
var less = require('gulp-less')

gulp.task('compileCoffee', function() {
    return gulp.src('src/scripts/**/*.coffee')
        .pipe(coffee({bare: true}))
        .pipe(gulp.dest('public/scripts'))
})

gulp.task('compileLess', function() {
    return gulp.src('src/**/*.less')
        .pipe(less())
        .pipe(gulp.dest('public'))
})

gulp.task('default', function() {
    return gulp.watch('src/**/*.{coffee, less}', ['compileCoffee', 'compileLess'])
})
