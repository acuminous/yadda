var Yadda = require('yadda')
var converters = require('../converters')

module.exports = new Yadda.Dictionary()
    .define('count', /(\d+)/, Yadda.converters.integer)
    .define('filters', /(.*)/, converters.filter)