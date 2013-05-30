// var Yadda = requre('yadda').Yadda;
var Yadda = require('../../lib/index').Yadda;
// var feature = ('yadda').plugins.MochaPlugin().feature;
var feature = require('../../lib/index').plugins.MochaPlugin().feature;
var library = require('./bottles-library');
var yadda = new Yadda(library);

feature(yadda, 'Bottles', './spec/bottles-spec.txt');
