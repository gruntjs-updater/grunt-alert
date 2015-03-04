/*
 * grunt-alert
 * https://github.com/mmarcon/grunt-alert
 *
 * Copyright (c) 2015 Massimiliano Marcon
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        jshint: {
            all: [
                'Gruntfile.js',
                'lib/*.js',
                'tasks/*.js',
                'tests/*.js'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        // Example configuration
        alert: {
            // slack: {
            //     type: 'slack',
            //     webhookUrl: '',
            //     channel: '#grunt',
            //     username: 'Grunt Alert',
            //     iconUrl: '',
            //     iconEmoji: ':ghost:',
            //     message: 'Ya\'ll suck. The build just failed with this error: %s'
            // },
            // hipchat: {
            //     room: 'grunt',
            //     token: '',
            //     messageFormat: 'text',
            //     message: 'Ya\'ll suck. The build just failed with this error: %s',
            //     notify: true,
            //     color: 'red'
            // },
            twilio: {
                to: '',
                from: '',
                message: 'Ya\'ll suck. The build just failed with this error: %s',
                account: '',
                token: ''
            }
        },

        test: {
            alert: ['./tests/*_test.js']
        }

    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerMultiTask('test', 'runs tests with tape', function(){
        var done = this.async();
        var runner = grunt.util.spawn({
            cmd: './node_modules/.bin/tape',
            args: this.filesSrc
        }, function(error, result, code){
            done(code === 0);
        });

        runner.stderr.pipe(process.stderr, { end: false });
        runner.stdout.pipe(require('faucet')()).pipe(process.stdout, { end: false });
    });

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'test']);

    grunt.registerTask('warn', 'tests warn failure', function(){
        grunt.warn('this task has failed with a warning. i guess you\'ll survive');
    });

    grunt.registerTask('fatal', 'tests fatal failure', function(){
        grunt.fatal('this task has failed with a fatal error. you will all die.');
    });

    grunt.registerTask('catchwarn', ['alert.hook', 'warn']);
    grunt.registerTask('catchfatal', ['alert.hook', 'fatal']);
};