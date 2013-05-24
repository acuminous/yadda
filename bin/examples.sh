#!/bin/bash

echo Running CasperJS Example
pushd ./examples/casper > /dev/null
casperjs test.js
popd

echo Running Mocha Example
pushd ./examples/mocha > /dev/null
mocha test.js
popd

echo Running NodeUnit Example
pushd ./examples/nodeunit > /dev/null
nodeunit test.js
popd
