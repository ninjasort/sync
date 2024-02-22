module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        globals: {
          jQuery: true,
        },
      },
    },

    connect: {
      server: {
        options: {
          port: 9001,
          base: 'src/exp-1',
        },
      },
    },

    watch: {
      compass: {
        options: {
          livereload: true,
        },
        files: ['scss/**/*.scss'],
        tasks: ['compass', 'sass'],
      },
    },

    concat: {
      options: {
        // define a string to put between each file in the concatenated output
        separator: ';',
      },
      dist: {
        // the files to concatenate
        src: ['src/**/*.js'],
        // the location of the resulting JS file
        dest: 'dist/<%= pkg.name %>.js',
      },
    },

    uglify: {
      options: {
        // the banner is inserted at the top of the output
        banner:
          '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>'],
        },
      },
    },
  })

  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-compass')
  grunt.loadNpmTasks('grunt-contrib-sass')
  grunt.loadNpmTasks('grunt-contrib-connect')
  grunt.loadNpmTasks('grunt-contrib-watch')

  grunt.registerTask('default', ['connect', 'watch'])

  grunt.registerTask('dist', 'Distribute the app', function () {
    grunt.log.writeln('Distribute the app')
    grunt.file.delete('./dist')
    // grunt.task.run(['concat:dist', 'uglify:dist'])
  })
}
