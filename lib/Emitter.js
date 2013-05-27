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

var Emitter = function() {

    var sequence = 0;
    var listeners = {};

    this.on = function(event, callback) {
        var eventListeners = listeners[event] || initListeners(event);        
        var id = sequence++;
        eventListeners.push({id: id, callback: callback});
        return id;
    };

    this.emit = function(event) {
        $(listeners[event]).each(function(listener) {
            listener.callback();
        });
    };

    this.off = function(id) {
        for (var event in listeners) {
            var index = $(listeners[event]).each(function(listener, index) {
                if (listener.id == id) return index;
            });
            if (index != undefined) {
                listeners[event].splice(index, 1);
                break;
            };
        };
    };    

    var initListeners = function(event) {
        listeners[event] = [];
        return listeners[event];
    };
};

module.exports = Emitter;