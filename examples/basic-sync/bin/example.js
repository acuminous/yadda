const spawn = require('child_process').spawn;
const platform = require('os').platform();
const cmd = /^win/.test(platform) ? 'bin\\example.bat' : 'bin/example.sh';
spawn(cmd, [], { stdio: 'inherit' }).on('exit', function (code) {
  process.exit(code);
});
