"use strict";

var assert = require("assert");
var fs = require("../../lib/shims").fs;
var path = require("../../lib/shims").path;

describe("FileSystem", function () {

    it("should check path existence", function () {
        assert(fs.existsSync("./test/shims/data/subdir1"));
        assert(fs.existsSync("./test/shims/data/file3.json"));
        assert(fs.existsSync("test/shims/data/subdir2"));
        assert(fs.existsSync("test/shims/data/subdir2/file2.feature"));
        assert(fs.existsSync(path.join(__dirname, "data/subdir1/file1.json")));
        assert(!fs.existsSync("./test/shims/data/non.existent"));
    });

    it("should distinguish files and directories", function () {
        var dirStat = fs.statSync("./test/shims/data/subdir1");
        assert(dirStat.isDirectory());
        var fileStat = fs.statSync("./test/shims/data/subdir2/file2.feature");
        assert(!fileStat.isDirectory());
    });

    it("should get directory content for a single level depth", function () {
        var content = fs.readdirSync("./test/shims/data");
        assert.deepEqual(content.sort(), ["subdir1", "subdir2", "file3.json"].sort());
    });

    it("should get file content as string", function () {
        var content = fs.readFileSync("./test/shims/data/subdir1/file1.json", "utf8");
        var json = JSON.parse(content);
        assert.deepEqual(json, {x: 1, y: 2});
    });

});
