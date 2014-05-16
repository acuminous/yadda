#!/bin/bash

which appium > /dev/null
if [ $? -ne 0 ]; then
    echo "Could not find appium"
    exit 1;
fi

node_modules/.bin/mocha --reporter spec --timeout 0 test.js