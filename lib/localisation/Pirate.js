/*
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* jslint node: true */
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
