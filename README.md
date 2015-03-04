# grunt-alert

> Sends alerts about failing builds using different channels

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-alert --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-alert');
```

## The "alert.hook" task

Can be used as a dependency for other tasks. The `alert.hook` task patches the `grunt.warn` and `grunt.fatal` functions to trigger a child process that takes care of notifying about errors using the alert tasks.

The child process is spawned as a detached process and therefore runs asynchronously and most likely will finish after the main `grunt` process ends.

### Example

```js
//A task that just fails
grunt.registerTask('fatal', 'tests fatal failure', function(){
    grunt.fatal('this task has failed with a fatal error. you will all die.');
});

//When this task runs, before the fatal task is triggered grunt.fatal
//is patched so errors are captured and alerts are triggered.
grunt.registerTask('catchfatal', ['alert.hook', 'fatal']);
```

## The "alert" task

Triggers an alert using the configured platforms.

### General rules on platform configurations

#### Types

If `type` is set, it will be used that as the alerting platform name. If not the plugin will try to use the target name as the platform name.

This basically means that

```js
alert: {
   foo: { type: 'slack' }
}
```

is equivalent to

```js
alert: {
   slack: {}
}
```

#### Message and placeholders

Every platform type supports a `message` property that can include a string placeholder `%s`. That placeholder will be replaced, in order of priority, with:

 1. whatever is passed as command-line argument with `--arg=<string>` when the task is invoked directly
 2. or the error message that is generated by a failing task when the alert task is automatically triggered by the alert hook on task fail (warn or fatal) events.

### Supported platform types

#### Slack

![slack notification](https://raw.githubusercontent.com/mmarcon/grunt-alert/master/screenshots/slack.png)

```js
alert: {
    slack: {
        type: 'slack',
        webhookUrl: '',
        channel: '#grunt', //optional
        username: 'Grunt Alert', //optional
        iconUrl: '', //optional
        iconEmoji: ':ghost:', //optional
        message: 'Ya\'ll suck. The build just failed with this error: %s'
    }
}
```

#### Hipchat

![hipchat notification](https://raw.githubusercontent.com/mmarcon/grunt-alert/master/screenshots/hipchat.png)

```js
alert: {
    hipchat: {
        room: 'grunt',
        token: '', //A token with send_notification scope for the room
        messageFormat: 'text', //Default is html as per API spec
        message: 'Ya\'ll suck. The build just failed with this error: %s',
        notify: true, //Default is false as per API spec
        color: 'red' //Default is yellow as per API spec. Valid values are yellow, green, red, purple, gray, random.
    }
}
```
