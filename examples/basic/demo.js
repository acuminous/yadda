/* jslint node: true */
"use strict";

var Yadda = require('yadda');
var library = require('./lib/bottles-library');

new Yadda.Yadda(library).yadda([
    'Given 100 green bottles are standing on the wall',
    'when 1 green bottle accidentally falls',
    'then there are 99 green bottles standing on the wall'
]);