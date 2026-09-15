// Builds design tokens from DTCG JSON into CSS custom properties, an SCSS map, and typed TS keys.
// Run: npm run tokens:build
import StyleDictionary from 'style-dictionary';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const out = join(root, 'src/generated/');

// style-dictionary globs require forward slashes, even on Windows
const p = (rel) => join(root, rel).replaceAll('\\', '/');
const base = [p('tokens/*.json')];

const sd = new StyleDictionary({
  source: base,
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: out,
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: { outputReferences: true, selector: ':root' },
        },
      ],
    },
    scss: {
      transformGroup: 'scss',
      buildPath: out,
      files: [
        {
          destination: 'tokens.scss',
          format: 'scss/map-deep',
          options: { outputReferences: true },
        },
      ],
    },
    ts: {
      transformGroup: 'js',
      buildPath: out,
      files: [
        { destination: 'tokens.ts', format: 'javascript/es6' },
        { destination: 'tokens.d.ts', format: 'typescript/es6-declarations' },
      ],
    },
  },
});

// Dark theme: only overrides, emitted under a data attribute selector.
const dark = new StyleDictionary({
  include: base,
  source: [p('tokens/themes/dark.json')],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: out,
      files: [
        {
          destination: 'tokens.dark.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('themes/dark'),
          options: { outputReferences: true, selector: '[data-theme="dark"]' },
        },
      ],
    },
  },
});

await sd.buildAllPlatforms();
await dark.buildAllPlatforms();
console.log('Design tokens built →', out);
