# Localisation

Feature specifications can be written in any language. Because Given/When/Then terms are so common, Yadda provides localised library constructors for them in many languages.

Available under `Yadda.localisation`:

- Chinese
- Dutch
- English
- French
- German
- Norwegian
- Pirate
- Polish
- Portuguese
- Russian
- Spanish
- Ukrainian

Pull requests for more languages are welcome.

## Localising a Library

Wrap any library with a localisation to gain the `given` / `when` / `then` shorthand methods in that language:

```js
import Yadda from 'yadda';

const { ContextParamLibrary, localisation: { French } } = Yadda;

const library = French.localise(new ContextParamLibrary())
  .given('un utilisateur nommé $name', (ctx, name) => {})
  .when('$name se connecte', (ctx, name) => {})
  .then('$name est connecté', (ctx, name) => {});
```

`localise` returns the same library, so you can chain `define`, `given`, `when` and `then` calls straight after it.

## Setting the Default Parser Language

The feature parser recognises localised keywords (`Feature`, `Scenario`, `Background`, and so on). To change the language it parses, set `Yadda.localisation.default`:

```js
import Yadda from 'yadda';

Yadda.localisation.default = Yadda.localisation.French;
```

## Custom Languages

A localisation is just a `Language` built from a vocabulary. To add your own, construct a `Yadda.localisation.Language` with translations for the keywords you need (`feature`, `rule`, `scenario`, `examples`, `pending`, `only`, `background`, `given`, `when`, `then`). The `_steps` entry lists which keywords become shorthand methods on a localised library.
