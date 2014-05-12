/* jslint node: true */
"use strict";

var spawn = require('child_process').spawn;
var platform = require('os').platform();
var cmd = /^win/.test(platform) ? 'bin\\examples.bat' : 'bin/examples.sh';
spawn(cmd, [], { stdio: 'inherit' }).on('exit', function(code) {
    process.exit(code);
});
