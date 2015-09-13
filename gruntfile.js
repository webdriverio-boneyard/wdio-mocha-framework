module.exports = function(grunt) {
    var files = [
        'gruntfile.js',
        'lib/*.js',
        'tasks/*.js',
        'test/**/*.js'
    ];

    grunt.initConfig({
        pkgFile: 'package.json',
        babel: {
            options: {
                sourceMap: false
            },
            dist: {
                files: {
                    "build/index.js": "lib/adapter.js"
                }
            }
        },
        eslint: {
            target: files
        },
        jshint: {
            src: files
        },
        contributors: {
            options: {
                commitMessage: 'update contributors'
            }
        },
        bump: {
            options: {
                commitMessage: 'v%VERSION%',
                pushTo: 'upstream'
            }
        }
    });

    require('load-grunt-tasks')(grunt);
    grunt.loadTasks('tasks');
    grunt.registerTask('default', ['build', 'eslint', 'test']);
    grunt.registerTask('build', 'Build wdio-mocha', function() {
        grunt.task.run([
            'jshint',
            'eslint',
            'babel'
        ]);
    });
    grunt.registerTask('release', 'Bump and tag version', function(type) {
        grunt.task.run([
            'build',
            'contributors',
            'bump:' + (type || 'patch')
        ]);
    });
};
