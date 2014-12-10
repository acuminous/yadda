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

var api = {
    Yadda: require('./Yadda'),
    EventBus: require('./EventBus'),
    Interpreter: require('./Interpreter'),
    Context: require('./Context'),
    Library: require('./Library'),
    Dictionary: require('./Dictionary'),
    FeatureFileSearch: require('./FeatureFileSearch'),
    FileSearch: require('./FileSearch'),
    Platform: require('./Platform'),
    localisation: require('./localisation/index'),
    parsers: require('./parsers/index'),
    plugins: require('./plugins/index'),
    shims: require('./shims/index'),
    createInstance: function() {
        // Not everyone shares my sense of humour re the recursive api :(
        // See https://github.com/acuminous/yadda/issues/111
        return api.Yadda.apply(null, Array.prototype.slice.call(arguments, 0));
    }
};

module.exports = api;
