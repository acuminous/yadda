"use strict";

var Language = require('./Language');

module.exports = (function() {

    var vocabulary = {
        feature: '(?:[Tt]ale|[Yy]arn)',
        scenario: '(?:[Aa]dventure|[Ss]ortie)',
        examples: '[Ww]herest',
        pending: '[Bb]rig',
        only: '[Bb]lack [Ss]pot',
        background: '[Aa]ftground',
        given: '(?:[Gg]iveth|[Ww]ith|[Aa]nd|[Bb]ut|[Ee]xcept)',
        when: '(?:[Ww]hence|[Ii]f|[Aa]nd|[Bb]ut)',
        then: '(?:[Tt]hence|[Ee]xpect|[Aa]nd|[Bb]ut)',
        _steps: ['given', 'when', 'then', 'giveth', 'whence', 'thence'],
        // Also aliasing Pirate verbs for given-when-then for signature-lookup
        get giveth() { return this.given; },
        get whence() { return this.when; },
        get thence() { return this.then; }

    };

    return new Language('Pirate', vocabulary);
})();
