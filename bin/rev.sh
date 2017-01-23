#!/bin/bash
set -e

VERSION_PATTERN=[0-9]+\\.[0-9]+\\.[0-9]+
VERSION=$1

if [ -z "$VERSION" ]; then
    echo "usage: rev <VERSION>"
    exit 1
fi

npm run lint
npm test
npm run karma

sed -i '' -E "s/\"version\": \"$VERSION_PATTERN\"/\"version\": \"$VERSION\"/" package.json
sed -i '' -E "s/\"version\": \"$VERSION_PATTERN\"/\"version\": \"$VERSION\"/" component.json
sed -i '' -E "s/\"version\": \"$VERSION_PATTERN\"/\"version\": \"$VERSION\"/" bower.json
sed -i '' -E "s/The current version of Yadda is $VERSION_PATTERN/The current version of Yadda is $VERSION/" README.md
sed -i '' -E "s/yadda-$VERSION_PATTERN.js/yadda-$VERSION.js/" README.md
sed -i '' -E "s/Yadda $VERSION_PATTERN/Yadda $VERSION/" lib/Yadda.js
sed -i '' -E "s/yadda-$VERSION_PATTERN.js/yadda-$VERSION.js/" examples/qunit/test.html

npm run browserify
npm run examples
