"use strict";

var Language = require('./Language');

module.exports = (function() {

    var vocabulary = {
        feature: '(?:[Ff]unktionalität|[Ff]eature|[Aa]spekt|[Uu]secase|[Aa]nwendungsfall)',
        scenario: '(?:[Ss]zenario|[Ss]zenario( g|G)rundriss|[Gg]eschehnis)',
        examples: '(?:[Bb]eispiele?)',
        pending: '(?:[Tt]odo|[Oo]ffen)',
        only: '(?:[Nn]ur|[Ee]inzig)',
        background: '(?:[Gg]rundlage|[Hh]intergrund|[Ss]etup|[Vv]orausgesetzt)',
        given: '(?:[Aa]ngenommen|[Gg]egeben( sei(en)?)?|[Mm]it|[Uu]nd|[Aa]ber|[Aa]ußer)',
        when: '(?:[Ww]enn|[Ff]alls|[Uu]nd|[Aa]ber)',
        then: '(?:[Dd]ann|[Ff]olglich|[Aa]ußer|[Uu]nd|[Aa]ber)',
        _steps: ['given', 'when', 'then']
    };

    return new Language('German', vocabulary);
})();
