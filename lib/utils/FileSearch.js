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

var path = require('path')
var fs = require('fs');
var $ = require('../Array');

var FileSearch = function(directories, patterns) {

    console.log(directories);

    var _this = this;

    this.search = function() {
        return $(directories).inject($(), function(files, directory) {
            return files.concat(list_files(directory).find_all(by_pattern).collect(relative_path));
        });
    };

    var list_files = function(directory) {
        return $(list_immediate_files(directory).concat(list_sub_directory_files(directory)));
    };

    var list_immediate_files = function(directory) {
        return ls(directory).find_all(by_file);
    };

    var list_sub_directory_files = function(directory) {
        console.log(ls(directory).find_all(by_directory));
        return ls(directory).find_all(by_directory).inject($(), function(files, directory) {
            return files.concat(list_files(directory));
        });
    };

    var ls = function(directory) {
        if (!fs.existsSync(directory)) return $();
        return $(fs.readdirSync(directory)).collect(function(file) {
            return path.join(directory, file);
        });
    };

    var by_file = function(file) {
        return !by_directory(file);
    };

    var by_directory = function(file) {
        return fs.statSync(file).isDirectory();
    }

    var by_pattern = function(filename) {
        return $(patterns).find(function(pattern) {
            return new RegExp(pattern).test(filename)
        })
    };

    var relative_path = function(filename) {
        return path.relative(process.cwd(), filename);
    };
};

module.exports = FileSearch;