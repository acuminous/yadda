/* jslint node: true */
"use strict";

var spawn = require('child_process').spawn;
var platform = require('os').platform();
var cmd = /^win/.test(platform) ? 'bin\\driver.bat' : 'bin/driver.sh';
spawn(cmd, [], { stdio: 'inherit' }).on('exit', function(code) {
  process.exit(code);
});
