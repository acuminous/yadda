#!/bin/bash

# Links the local yadda build, then installs and runs every example under examples/.

set -e

npm link
pushd examples
for D in *; do
    echo "Running ${D} example"
    pushd ${D}
    npm --loglevel error install
    npm test
    popd
done
popd
