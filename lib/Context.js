"use strict";

// Constructs an object that macros will be bound to before execution
var Context = function(properties) {

    // I was previously getting some weird errors using instanceof to determine if
    // the "other" object was a context object. Using pTFUHht733hM6wfnruGLgAu6Uqvy7MVp instead
    this.pTFUHht733hM6wfnruGLgAu6Uqvy7MVp = true;
    this.properties = {};

    this.merge = function(other) {
        if (other && other.pTFUHht733hM6wfnruGLgAu6Uqvy7MVp) return this.merge(other.properties);
        return new Context(this.properties)._merge(other);
    };

    this._merge = function(other) {
        for (var key in other) { this.properties[key] = other[key]; }
        return this;
    };

    this._merge(properties);
};

module.exports = Context;
