#!/bin/bash

echo Running CasperJS Example
pushd ./examples/casper > /dev/null
npm install async --prefix ./node_modules
casperjs test test.js
popd

echo Running Mocha Sync Example
pushd ./examples/mocha-sync > /dev/null
mocha test.js
popd

echo Running Mocha Async Example
pushd ./examples/mocha-async > /dev/null
mocha test.js
popd

echo Running NodeUnit Example
pushd ./examples/nodeunit > /dev/null
nodeunit test.js
popd
