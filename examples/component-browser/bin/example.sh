#!/bin/bash

./node_modules/.bin/http-server & 
PID=$!
sleep 1;
open http://localhost:8081
kill $PID > /dev/null