module.exports = function(grunt) {

  grunt.initConfig({
    concat: {
      css: {
        src: [
          'css/style.css'    
        ],
        dest: 'build/css/app.css'
      },
      js : {
        src : [
            'js/core.js',
            'js/Utils.js',
            'js/Entity.js',
            'js/Player.js',
            'js/Bot.js',
            'js/Bonus.js',
            'js/Tile.js',
            'js/Fire.js',
            'js/Bomb.js',
            'js/Menu.js',
            'js/InputEngine.js',
            'js/GameEngine.js'
          
        ],
        dest : 'build/js/app.js'
      }
    },

    cssmin : {
        css:{
            src: 'build/css/app.css',
            dest: 'deploy/css/app.min.css'
        }
    },

    uglify: {
        
			options : {
                compress : true,
				report : true,
				banner : '/*  Matouš Skála.\n License: The game soundtrack (composed by me) and the source code is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License\n publish in <%= grunt.template.date() %>*/\n'
			},
        
        js: {
            files: {
                'deploy/js/app.min.js': ['build/js/app.js']
            }
        }
    },

    processhtml : {
      dist: {
        files : {
          'build/index.html' : 'index.html'
        }
      }
    },
    copy: {
  main: {
    files: [
     
      {
//          expand: true,
          src: ['assets/**'],
          
          dest: 'deploy/',

      },

    ],
  },
},
htmlmin: {                                     
    dist: {                                     
      options: {                                
        removeComments: true,
        collapseWhitespace: true
      },
      files: {                                   
        'deploy/index.html': 'build/index.html'    
        
      }
    },
    dev: {                                       
      files: {
        'deploy/index.html': 'deploy/index.html'
      }
    }
  }
  }); 
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.registerTask('default', ['concat:css','concat:js','cssmin','uglify','processhtml', 'copy', 'htmlmin']);

};

