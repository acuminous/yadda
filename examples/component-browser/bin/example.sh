#!/bin/bash

which http-server > /dev/null
if [ $? -ne 0 ]; then
    echo "Could not find http-server"
    exit 1;
fi

http-server & 
PID=$!
open http://localhost:8081
kill $PID > /dev/null