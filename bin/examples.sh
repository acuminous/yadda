#!/bin/bash

echo Running Mocha Sync Example
pushd ./examples/mocha-sync > /dev/null
mkdir -p node_modules
if [ ! -e ./node_modules/yadda ]; then
	ln -sf ../../.. node_modules/yadda
fi
mocha --reporter spec test.js
popd

echo Running Mocha Async Example
pushd ./examples/mocha-async > /dev/null
mkdir -p node_modules
if [ ! -e ./node_modules/yadda ]; then
	ln -sf ../../.. node_modules/yadda
fi
mocha --reporter spec test.js
popd

echo Running WebDriver Example
pushd ./examples/webdriver > /dev/null
mkdir -p node_modules
if [ ! -e ./node_modules/yadda ]; then
	ln -sf ../../.. node_modules/yadda
fi
if [ ! -e ./node_modules/selenium-webdriver ]; then
	npm install selenium-webdriver --prefix ./node_modules
fi
mocha --reporter spec --timeout 10000 test.js
popd

echo Running CasperJS Example
pushd ./examples/casper > /dev/null
mkdir -p node_modules
if [ ! -e ./node_modules/async ]; then
    npm install async --prefix ./node_modules
fi
if [ ! -e ./node_modules/yadda ]; then
	ln -sf ../../.. node_modules/yadda
fi
casperjs test test.js
popd

echo Running NodeUnit Example
pushd ./examples/nodeunit > /dev/null
mkdir -p node_modules
if [ ! -e ./node_modules/nodeunit ]; then
    npm install nodeunit --prefix ./node_modules
fi
node_modules/nodeunit/bin/nodeunit test.js
popd
