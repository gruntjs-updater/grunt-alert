/*
 * grunt-alert
 * https://github.com/mmarcon/grunt-alert
 *
 * Copyright (c) 2015 Massimiliano Marcon
 * Licensed under the MIT license.
 */

'use strict';

var request = require('request'),
    util = require('util'),
    alertSlack = require('../lib/alertslack')(request);

var supportedTypes = /slack/;

function spawnConfig(fail, error, errorcode) {
    return {
        grunt: true,
        args: [
            'alert',
            util.format('--fail=%s', fail),
            util.format('--error=%s', error),
            util.format('--errorcode=%d', errorcode)
        ],
        fallback: 0,
        opts: {
            detached: true,
            stdio: ['ignore', 'ignore', 'ignore']
        }
    };
}

function injectAlertHook(grunt) {
    var fatal = grunt.fail.fatal,
        warn = grunt.fail.warn;

    grunt.log.writeln('injecting hooks');

    grunt.fail.fatal = grunt.fatal = function(error, errorcode){
        var ctx = this, child;

        child = grunt.util.spawn(spawnConfig('fatal', error, errorcode || 1));
        child.unref();

        fatal.call(ctx, error, errorcode);
    };

    grunt.fail.warn = grunt.warn = function(error, errorcode){
        var ctx = this, child;

        child = grunt.util.spawn(spawnConfig('warn', error, errorcode));
        child.unref();

        warn.call(ctx, error, errorcode);
    };
}

module.exports = function(grunt) {

    grunt.registerTask('alert.hook', function(){
        injectAlertHook(grunt);
        return;
    });

    grunt.registerMultiTask('alert', 'Sends alerts about failing builds using different channels', function() {
        // Merge task-specific and/or target-specific options with these defaults.
        var config = this.data,
            target = this.target,
            done = this.async();

        // If type is set, we'll use that as the alerting
        // platform name. If not, we'll try to use the target
        // name as the platform name.
        // This basically means that
        // alert: {
        //    foo: { type: 'slack' }
        // }
        // is equivalent to
        // alert: {
        //    slack: {}
        // }
        config.type = config.type || target;

        //Normalize message so we use the same for every platform
        config.message = grunt.option('message') || config.message || 'Alert %s';
        config.message = util.format(config.message, grunt.option('arg') || grunt.option('error') || '');

        //Now, let's check if we support that platform
        if(!supportedTypes.test(config.type)) {
            grunt.log.error('The platform ' + config.type + ' is not supported');
            return done();
        }

        switch(config.type) {
            case 'slack':
                return alertSlack(config, grunt, done);
        }
    });

};