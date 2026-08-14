# Playwright Example

Driving a browser with Yadda and [Playwright](https://playwright.dev).

The feature file is written entirely in business language. The CSS selectors
live only in the step definitions (`steps/bottles-library.js`), so the tests are
the single place coupled to the page structure. One parameterised step —
`I specify $count $field` — maps a field name straight onto its input's `name`
attribute, so it drives every field on the form.

Playwright owns the test runner. Rather than a Yadda plugin, Yadda is driven from
inside Playwright's `test()`: one test per scenario (so Playwright gives us a
fresh, isolated `page` each time, clearing state between scenarios) and one
`test.step()` per Yadda step (so each step appears in Playwright's report).

## Running

```
npm install
npm link
cd examples/playwright
npm install
npm test
```

`npm test` runs headed locally so you can watch it. On CI (where `CI=true` is
set) it runs headless. The `pretest` hook downloads the Chromium browser.

## Continuous integration

Playwright downloads a browser (~100 MB) on first run. On CI, cache it so it is
not re-downloaded every build:

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ hashFiles('**/package-lock.json') }}
```
