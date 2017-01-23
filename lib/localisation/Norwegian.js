"use strict";

var Language = require('./Language');

module.exports = (function() {

    var vocabulary = {
        feature: '[Ee]genskap',
        scenario: '[Ss]cenario',
        examples: '[Ee]ksempler',
        pending: '[Aa]vventer',
        only: '[Bb]are',
        background: '[Bb]akgrunn',
        given: '(?:[Gg]itt|[Mm]ed|[Oo]g|[Mm]en|[Uu]nntatt)',
        when: '(?:[Nn]år|[Oo]g|[Mm]en)',
        then: '(?:[Ss]å|[Ff]forvent|[Oo]g|[Mm]en)',
        _steps: ['given', 'when', 'then', 'gitt', 'når', 'så'],
        // Also aliasing Norwegian verbs for given-when-then for signature-lookup
        get gitt() { return this.given; },
        get når() { return this.when; },
        get så() { return this.then; }
    };

    return new Language('Norwegian', vocabulary);
})();
