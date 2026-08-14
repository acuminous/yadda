var spawn = require('node:child_process').spawn;
var platform = require('node:os').platform();
var cmd = /^win/.test(platform) ? 'bin\\examples.bat' : 'bin/examples.sh';
spawn(cmd, [], { stdio: 'inherit' }).on('exit', (code) => {
  process.exit(code);
});
