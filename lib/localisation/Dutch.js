"use strict";

var Language = require('./Language');

module.exports = (function() {

    var vocabulary = {
        feature: '(?:[Ff]eature|[Ff]unctionaliteit|[Ee]igenschap)',
        scenario: '(?:[Ss]cenario|[Gg|eval)',
        examples: '(?:[Vv]oorbeelden?)',
        pending: '(?:[Tt]odo|[Mm]oet nog)',
        only: '(?:[Aa]lleen)',
        background: '(?:[Aa]chtergrond)',
        given: '(?:[Ss]tel|[Gg]egeven(?:\\sdat)?|[Ee]n|[Mm]aar)',
        when: '(?:[Aa]ls|[Ww]anneer|[Ee]n|[Mm]aar)',
        then: '(?:[Dd]an|[Vv]ervolgens|[Ee]n|[Mm]aar)',
        _steps: ['given', 'when', 'then']
    };

    return new Language('Dutch', vocabulary);
})();
