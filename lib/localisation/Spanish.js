/* -*- coding: utf-8 -*-
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
        feature: '(?:[Ff]uncionalidad|[Cc]aracterística)',
        scenario: '(?:[Ee]scenario|[Cc]aso)',
        examples: '(?:[Ee]jemplos|[Ee]jemplo)',
        pending: '[Pp]endiente',
        only: '[S]ólo',
        background: '[Ff]ondo',
        given: '(?:[Ss]ea|[Ss]ean|[Dd]ado|[Dd]ada|[Dd]ados|[Dd]adas)',
        when: '(?:[Cc]uando|[Ss]i|[Qq]ue)',
        then: '(?:[Ee]ntonces)',

        _steps: [
            'given', 'when', 'then',
            'sea', 'sean', 'dado', 'dada','dados', 'dadas',
            'cuando', 'si',
            'entonces'
        ],

        get sea() { return this.given; },
        get sean() { return this.given; },
        get dado() { return this.given; },
        get dada() { return this.given; },
        get dados() { return this.given; },
        get dadas() { return this.given; },
        get cuando() { return this.when; },
        get si() { return this.when; },
        get entonces() { return this.then; }
    };

    return new Language('Spanish', vocabulary);
})();
