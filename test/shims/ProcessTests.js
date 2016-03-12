/* jslint node: true */
/* global describe, it */
"use strict";

var assert = require("assert"),
    proc = require("../../lib/shims").process,
    path = require("../../lib/shims").path;

describe("Process", function () {

    it("should contain the working directory path", function () {
        assert.strictEqual(proc.cwd(), path.resolve("."));
    });

});