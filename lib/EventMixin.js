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

    var event_handlers = {};

    // this.proxy_events = function(target, proxy) {
    //     target.on = proxy.on;
    //     target.emit = proxy.emit;
    //     target.emit_around = proxy.emit_around;
    // };

    this.bless = function(target) {
        target.on = make_on(target);
        target.emit = make_emit(target);
        target.emit_around = make_emit_around(target);
        return target;
    };

    var make_on = function(target) {
        return function(event_name, callback) {            
            event_handlers[event_name] = (event_handlers[event_name] || []).concat(callback);
            return target;
        }.bind(target);
    };

    var make_emit = function(target) {
        return function(event_name, event_data) {            
            $(event_handlers[event_name]).each(function(callback) {
                callback({ name: event_name, params: event_data });
            })
        }.bind(target);
    };

    var make_emit_around = function(target) {
        return function(fn, before, after, event_data,  next) {
            target.emit(before, event_data);
            fn(function() {
                target.emit(after, event_data);
                next && next();            
            });
        };
    };

}

module.exports = EventMixin;