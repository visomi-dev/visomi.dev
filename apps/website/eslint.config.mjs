import astroPlugin from 'eslint-plugin-astro';

import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  ...astroPlugin.configs['flat/recommended'],
  ...astroPlugin.configs['flat/jsx-a11y-recommended'],
];
