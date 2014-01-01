#!/bin/bash

set -e

pushd examples
for D in *; do
    echo "Running ${D} example"
    pushd ${D}
    npm --loglevel error install
    npm test
    popd
done
popd
