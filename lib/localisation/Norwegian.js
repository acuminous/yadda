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

var Language = require('./Language');

module.exports = (function() {

    var vocabulary = {
        feature: '(?:[Ee]genskap)',
        scenario: '(?:[Ss]cenario)',
        pending: 'Avventer',
        given: '(?:[Gg]itt|[Mm]ed|[Oo]g|[Mm]en|[Uu]nntatt)',
        when: '(?:[Nn]år|[Oo]g|[Mm]en)',
        then: '(?:[Ss]å|[Ff]forvent|[Oo]g|[Mm]en)',
        _steps: ['given', 'when', 'then', 'gitt', 'når', 'så']
    };

    return new Language('Norwegian', vocabulary);
})();
