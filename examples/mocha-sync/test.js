// var Yadda = requre('yadda').Yadda;
var Yadda = require('../../lib/index').Yadda;
// var MochaPlugin = ('yadda').plugins.MochaPlugin;
var MochaPlugin = require('../../lib/index').plugins.MochaPlugin;
var library = require('./bottles-library');
var yadda = new Yadda(library);

new MochaPlugin({mode: 'sync'}).upgrade(Yadda);
yadda.mocha('Bottles', './spec/bottles-spec.txt');
