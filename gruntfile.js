module.exports = function(grunt) {
    var files = [
        'gruntfile.js',
        'lib/*.js',
        'tasks/*.js',
        'test/**/*.js'
    ];

    grunt.initConfig({
        pkgFile: 'package.json',
        clean: ['build'],
        babel: {
            options: {
                sourceMap: false
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: './lib',
                    src: ['**/*'],
                    dest: 'build',
                    ext: '.js'
                }]
            }
        },
        eslint: {
            options: {
                parser: 'babel-eslint'
            },
            target: ['lib/adapter.js']
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
    grunt.registerTask('default', ['build']);
    grunt.registerTask('build', 'Build wdio-mocha', function() {
        grunt.task.run([
            'eslint',
            'clean',
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