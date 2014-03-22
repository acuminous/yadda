#!/bin/bash

./node_modules/.bin/http-server & 
PID=$!
sleep 3
open http://localhost:8080
sleep 3
kill $PID > /dev/null
