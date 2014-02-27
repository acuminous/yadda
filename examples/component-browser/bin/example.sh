#!/bin/bash

./node_modules/.bin/http-server & 
PID=$!
sleep 2;
open http://localhost:8080
kill $PID > /dev/null
