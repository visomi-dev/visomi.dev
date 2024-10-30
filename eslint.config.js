// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const eslintConfigPrettier = require('eslint-config-prettier');
const eslintPluginImport = require('eslint-plugin-import');

module.exports = tseslint.config(
  {
    files: ['**/*.ts', '**/*.spec.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.strict,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
      eslintConfigPrettier,
      // @ts-ignore eslint-plugin-import does not have types
      eslintPluginImport.flatConfigs.recommended,
      // @ts-ignore eslint-plugin-import does not have types
      eslintPluginImport.flatConfigs.typescript,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      'import/order': ['error', { 'newlines-between': 'always' }],
      'import/no-unresolved': [
        'error',
        {
          ignore: [
            'hono/bun',

            '@angular/core/testing',
            '@angular/platform-browser/animations/async',
            '@angular/common/http',
            '@angular/core/rxjs-interop',
          ],
        },
      ],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    },
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {},
  },
);
