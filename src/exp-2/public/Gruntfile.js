/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),

    compass: {
      
    },

    watch: {

      compass: {
        files: 'scss/**/*.scss',
        tasks: ['compass']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib');

  // Default task.
  grunt.registerTask('default', ['watch']);

};
