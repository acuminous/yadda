// var Yadda = requre('yadda').Yadda;
var Yadda = require('../../lib/index').Yadda;
// require('yadda').plugins.mocha();
require('../../lib/index').plugins.mocha();
var library = require('./bottles-library');
var yadda = new Yadda(library);

yadda.mocha('Bottles', './spec/bottles-spec.txt');
