const assert = require('node:assert');
const Yadda = require('yadda');

const dictionary = new Yadda.Dictionary().define('count', /(\d+)/).define('field', /(\w+)/);

// A ContextParamLibrary passes the scenario context as the first argument, so
// steps can be plain arrow functions. The context carries the Puppeteer `page`
// (see ../test.js). CSS selectors live only in this file — the feature file is
// written entirely in business language, so the tests are the single place that
// couples to the page structure.
module.exports = Yadda.localisation.English.localise(new Yadda.ContextParamLibrary(dictionary))

  .given('I open the green bottles page', async (ctx) => {
    await ctx.page.goto(ctx.url);
  })

  // The field name in the specification maps directly onto the input's name
  // attribute, so one parameterised step drives every field on the form.
  .when('I specify $count $field', async (ctx, count, field) => {
    await ctx.page.type(`input[name="${field}"]`, count);
  })

  .when('I update the wall', async (ctx) => {
    await ctx.page.click('button[type="submit"]');
  })

  .then('there are $count green bottles standing on the wall', async (ctx, count) => {
    const remaining = await ctx.page.$eval('#remaining', (el) => el.textContent);
    assert.equal(remaining, `${count} green bottles standing on the wall`);
  });
