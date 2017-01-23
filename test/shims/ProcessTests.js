"use strict";

var assert = require("assert");
var proc = require("../../lib/shims").process;
var path = require("../../lib/shims").path;

describe("Process", function () {

    it("should contain the working directory path", function () {
        assert.strictEqual(proc.cwd(), path.resolve("."));
    });

});
