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

var $ = require('./Array');

// Blesses Yadda objects with event handling capabilities
var EventMixin = function() {

    var event_handlers = $();

    this.bless = function(subject) {
        subject.on = make_on(subject);
        subject.emit = make_emit(subject);
        subject.emit_around = make_emit_around(subject);
        subject.re_emit = make_re_emit(subject);
        return subject;
    };

    var make_on = function(subject) {
        return function(event_pattern, callback) {
            event_handlers.push({ pattern: event_pattern, callback: callback });
            return subject;
        }.bind(subject);
    };

    var make_emit = function(subject) {
        return function(event_name, event_data) {            
            find_handlers(event_name).each(function(callback) {
                callback({ name: event_name, params: event_data });
            })
        }.bind(subject);
    };

    var make_emit_around = function(subject) {
        return function(fn, before, after, event_data,  next) {
            subject.emit(before, event_data);
            fn(function() {
                subject.emit(after, event_data);
                next && next();            
            });
        };
    };

    var make_re_emit = function(subject) {
        return function(target, event_pattern) {
            target.on(event_pattern || /.*/, function(event) {
                subject.emit(event.name, event.params);
            });
            return subject;
        };
    };

    var find_handlers = function(event_name) {
        return event_handlers.find_all(function(handler) {
            return new RegExp(handler.pattern).test(event_name);
        }).collect(function(handler) {
            return handler.callback;
        });
    };
}

module.exports = EventMixin;