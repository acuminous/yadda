#!/bin/bash

which phantomjs > /dev/null
if [ $? -ne 0 ]; then
    echo "Could not find phantomjs"
    exit 1;
fi
which casperjs > /dev/null
if [ $? -ne 0 ]; then
    echo "Could not find casperjs"
    exit 1;
fi

casperjs test test.js 2>&1 | grep -v 'CoreText performance note'