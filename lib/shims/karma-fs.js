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

/* jslint node: false */
"use strict";

module.exports = (function() {

    var path = require("./karma-path");

    function absolutePath(relativePath) {
        return path.resolve(path.normalize(relativePath.split("\\").join("/")));
    }

    var KarmaFileSystem = function() {
        this.registry = new KarmaPathRegistry();
        this.converter = new KarmaUriPathConverter("/base/", "/");
        this.reader = new KarmaFileReader(this.converter);

        var servedUris = Object.keys(window.__karma__.files);
        var servedFiles = this.converter.parseUris(servedUris);
        servedFiles.forEach(this.registry.addFile, this.registry);
    };
    KarmaFileSystem.prototype = {
        constructor: KarmaFileSystem,
        workingDirectory: "/",
        existsSync: function(path) {
            return this.registry.exists(path);
        },
        readdirSync: function(path) {
            return this.registry.getContent(path);
        },
        statSync: function(path) {
            return {
                isDirectory: function() {
                    return this.registry.isDirectory(path);
                }.bind(this)
            };
        },
        readFileSync: function(file, encoding) {
            if (encoding !== "utf8") throw new Error("This fs.readFileSync() shim does not support other than utf8 encoding.");
            if (!this.registry.isFile(file)) throw new Error("File does not exist: " + file);
            return this.reader.readFile(file);
        }
    };

    var KarmaPathRegistry = function KarmaPathRegistry() {
        this.paths = {};
    };

    KarmaPathRegistry.prototype = {
        constructor: KarmaPathRegistry,
        addFile: function(file) {
            file = absolutePath(file);
            this.paths[file] = KarmaPathRegistry.TYPE_FILE;
            var parentDirectory = path.dirname(file);
            this.addDirectory(parentDirectory);
        },
        addDirectory: function(directory) {
            directory = absolutePath(directory);
            this.paths[directory] = KarmaPathRegistry.TYPE_DIRECTORY;
            var parentDirectory = path.dirname(directory);
            if (parentDirectory != directory) this.addDirectory(parentDirectory);
        },
        isFile: function(file) {
            file = absolutePath(file);
            return this.exists(file) && this.paths[file] === KarmaPathRegistry.TYPE_FILE;
        },
        isDirectory: function(directory) {
            directory = absolutePath(directory);
            return this.exists(directory) && this.paths[directory] === KarmaPathRegistry.TYPE_DIRECTORY;
        },
        exists: function(node) {
            node = absolutePath(node);
            return this.paths.hasOwnProperty(node);
        },
        getContent: function(directory) {
            if (!this.isDirectory(directory)) throw new Error("Not a directory: " + directory);
            directory = absolutePath(directory);
            return Object.keys(this.paths).filter(function(node) {
                if (node === directory) return false;
                var parentDirectory = path.dirname(node);
                return parentDirectory === directory;
            }, this).map(function(node) {
                return path.basename(node);
            });
        }
    };

    KarmaPathRegistry.TYPE_FILE = 0;
    KarmaPathRegistry.TYPE_DIRECTORY = 1;

    var KarmaUriPathConverter = function KarmaUriPathConverter(baseUri, workingDirectory) {
        this.workingDirectory = workingDirectory;
        this.workingDirectoryPattern = this.patternFromBase(workingDirectory);
        this.baseUri = baseUri;
        this.baseUriPattern = this.patternFromBase(baseUri);
    };

    KarmaUriPathConverter.prototype = {
        constructor: KarmaUriPathConverter,
        patternFromBase: function(string, flags) {
            var pattern = "^" + string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            return new RegExp(pattern, flags);
        },
        parseUris: function(uris) {
            return uris.filter(function(uri) {
                return this.baseUriPattern.test(uri)
            }, this).map(function(uri) {
                return uri.replace(this.baseUriPattern, this.workingDirectory);
            }, this);
        },
        buildUri: function(file) {
            file = absolutePath(file);
            if (!this.workingDirectoryPattern.test(file)) throw new Error("Path is not in working directory: " + file);
            return file.replace(this.workingDirectoryPattern, this.baseUri);
        }
    };

    var KarmaFileReader = function KarmaFileReader(converter) {
        this.converter = converter;
    };

    KarmaFileReader.prototype = {
        constructor: KarmaFileReader,
        readFile: function(file) {
            var uri = this.converter.buildUri(file);
            var xhr = new XMLHttpRequest();
            xhr.open("get", uri, false);
            xhr.send();
            return xhr.responseText;
        }
    };

    return new KarmaFileSystem();
})();