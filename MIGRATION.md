# Migration

## Direct package name

```bash
npm install @stackline/convert-source-map
```

```js
const convert = require('@stackline/convert-source-map');
```

## Drop-in dependency replacement

Keep existing source imports by installing an npm alias:

```bash
npm install convert-source-map@npm:@stackline/convert-source-map
```

Existing code stays unchanged:

```js
const convert = require('convert-source-map');
```

The equivalent manifest entry is:

```json
{
  "dependencies": {
    "convert-source-map": "npm:@stackline/convert-source-map@^1.0.0"
  }
}
```

Commit the regenerated lockfile and run the consuming project's complete test
suite. Consumers on Node.js below 12 must upgrade Node before migrating.

## External map readers

The package preserves the version 2 callback signature:

```js
const converter = convert.fromMapFileComment(comment, filename => {
  return fs.readFileSync(filename, 'utf8');
});
```

Do not pass a directory string. Validate or constrain `filename` in the callback
when comments come from untrusted content.
