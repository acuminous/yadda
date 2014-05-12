/* jslint node: true */
"use strict";

var browserify = require('browserify');
var path = require('path');
var fs = require('fs');
var rootpath = process.cwd();
var pkg = require(path.join(rootpath, 'package.json'));
var web_bundle = fs.createWriteStream(path.join(rootpath, 'dist', 'yadda-' + pkg.version + '.js'));
var umd_bundle = fs.createWriteStream(path.join(rootpath, 'dist', 'yadda-umd-' + pkg.version + '.js'));

var b = browserify();
b.add('./lib/index.js');

b.require('./lib/index.js', { expose: 'yadda' });
b.ignore('casper');

b.bundle().pipe(web_bundle);
b.bundle({standalone: 'yadda_umd'}).pipe(umd_bundle);
