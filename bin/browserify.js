var browserify = require('browserify');
var path = require('path');
var fs = require('fs');
var rootpath = process.cwd();
var pkg = require(path.join(rootpath, 'package.json'));
var web_bundle = fs.createWriteStream(path.join(rootpath, 'dist', 'yadda-' + pkg.version + '.js'));
var umd_bundle = fs.createWriteStream(path.join(rootpath, 'dist', 'yadda-umd-' + pkg.version + '.js'));

var modules = {
    Yadda: './lib/Yadda.js',
    Interpreter: './lib/Interpreter.js',
    Library: './lib/Library.js',
    Dictionary: './lib/Dictionary.js',
    localisation: './lib/localisation/index.js',
    parsers: './lib/parsers/index.js',
    plugins: './lib/plugins/index.js'
};

var b = browserify();
b.add('./lib/index.js');

for (name in modules) {
    b.require(modules[name], { expose: name });
};

b.ignore('casper');

b.bundle().pipe(web_bundle);
b.bundle({standalone: 'yadda_umd'}).pipe(umd_bundle);

