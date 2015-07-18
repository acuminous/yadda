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

var Localisation = require('../../localisation');
var Platform = require('../../Platform');
var FeatureFileParser = require('../../parsers/FeatureFileParser');
var $ = require('../../Array');

module.exports.create = function(options) {

    /* jslint shadow: true */
    var platform = new Platform();
    var language = options.language || Localisation.default;
    var parser = options.parser || new FeatureFileParser(language);
    var container = options.container || platform.get_container();

    function featureFiles(files, iterator) {
        $(files).each(function(file) {
            features(parser.parse(file), iterator);
        });
    }

    function features(features, iterator) {
        $(features).each(function(feature) {
            describe(feature.title, feature, iterator);
        });
    }

    function describe(title, subject, iterator) {
        var _describe = getDescribe(subject.annotations);
        _describe(title, function() {
            iterator(subject);
        });
    }

    function it_async(title, subject, iterator) {
        var _it = getIt(subject.annotations);
        _it(title, function(done) {
            iterator(this, subject, done);
        });
    }

    function it_sync(title, subject, iterator) {
        var _it = getIt(subject.annotations);
        _it(title, function() {
            iterator(this, subject);
        });
    }

    function getIt(annotations, next) {
        if (has_annotation(annotations, 'pending')) return container.xit;
        if (has_annotation(annotations, 'only')) return container.it.only || container.fit || container.iit;
        return container.it;
    }

    function getDescribe(annotations, next) {
        if (has_annotation(annotations, 'pending')) return container.xdescribe;
        if (has_annotation(annotations, 'only')) return container.describe.only || container.fdescribe || container.ddescribe;
        return container.describe;
    }

    function has_annotation(annotations, name) {
        var regexp = new RegExp('^' + language.localise(name) + '$', 'i');
        for (var key in annotations) {
            if (regexp.test(key)) return true;
        }
    }

    return {
        featureFiles: featureFiles,
        features: features,
        describe: describe,
        it_async: it_async,
        it_sync: it_sync
    };
};
