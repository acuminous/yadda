"use strict";

var assert = require("assert");
var path = require("../../lib/shims").path;
var proc = require("../../lib/shims").process;

describe("Path", function () {

    it("should create absolute path from relative path", function () {
        assert.strictEqual(path.resolve("x/y/z"), path.join(proc.cwd(), "x/y/z"));
    });

    it("should normalize paths", function () {
        assert.strictEqual(path.normalize("./x//y/./z").split("\\").join("/"), "x/y/z");
    });

    it("should join paths", function () {
        assert.strictEqual(path.join("x", "y", "z").split("\\").join("/"), "x/y/z");
    });

});
