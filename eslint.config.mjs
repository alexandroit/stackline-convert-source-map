const globals = {
  Buffer: 'readonly',
  Error: 'readonly',
  JSON: 'readonly',
  Object: 'readonly',
  String: 'readonly',
  TextDecoder: 'readonly',
  TextEncoder: 'readonly',
  TypeError: 'readonly',
  Uint8Array: 'readonly',
  URL: 'readonly',
  atob: 'readonly',
  btoa: 'readonly',
  console: 'readonly',
  decodeURIComponent: 'readonly',
  encodeURIComponent: 'readonly',
  module: 'readonly',
  parseInt: 'readonly',
  process: 'readonly',
  require: 'readonly'
};

export default [
  { ignores: ['coverage/**', 'node_modules/**', 'site-dist/**'] },
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: { ecmaVersion: 2022, globals, sourceType: 'module' },
    rules: {
      eqeqeq: 'error',
      'no-constant-condition': 'error',
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-var': 'off'
    }
  },
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  {
    files: ['docs-site/**/*.js'],
    languageOptions: {
      globals: {
        document: 'readonly',
        navigator: 'readonly',
        window: 'readonly'
      }
    }
  }
];
