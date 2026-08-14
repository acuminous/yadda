# Puppeteer Example

Driving a browser with Yadda and [Puppeteer](https://pptr.dev).

The feature file is written entirely in business language. The CSS selectors
live only in the step definitions (`steps/bottles-library.js`), so the tests are
the single place coupled to the page structure. One parameterised step —
`I specify $count $field` — maps a field name straight onto its input's `name`
attribute, so it drives every field on the form.

Unlike [Playwright](../playwright), Puppeteer is just a browser library with no
test runner of its own. So this example brings one: Yadda's `node:test` plugin
turns the feature files into `describe`/`it` blocks, and we own the browser
lifecycle through `node:test` hooks — the browser launches once, and each
scenario gets a fresh page (which is how state is cleared between scenarios).

## Running

```
npm install
npm link
cd examples/puppeteer
npm install
npm test
```

`npm test` runs headed locally so you can watch it. On CI (where `CI=true` is
set) it runs headless. Puppeteer downloads its own Chromium on install.

## Continuous integration

Puppeteer downloads a browser (~100 MB) on install. On CI, cache it so it is not
re-downloaded every build:

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.cache/puppeteer
    key: puppeteer-${{ hashFiles('**/package-lock.json') }}
```
