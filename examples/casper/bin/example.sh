#!/bin/bash

which phantomjs > /dev/null
if [ $? -ne 0 ]; then
    echo "Could not find phantomjs"
    exit 1;
fi

PATH=$PATH:node_modules/.bin casperjs test test.js 2>&1 | grep -v 'CoreText performance note'
