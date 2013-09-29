#!/bin/bash

echo Running CasperJS Example
pushd ./examples/casper > /dev/null
if [ ! -e ./node_modules/async ]; then
    npm install async --prefix ./node_modules
fi
npm link ../..
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
if [ ! -e ./node_modules/nodeunit ]; then
    npm install nodeunit --prefix ./node_modules
fi
node_modules/nodeunit/bin/nodeunit test.js
popd
