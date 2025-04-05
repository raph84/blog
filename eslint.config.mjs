import eslint from '@eslint/js';
import { globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';

export default tseslint.config(
  eslint.configs.recommended,
  //tseslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  // tseslint.configs.strictTypeChecked, // Typed linting (slower)
  // tseslint.configs.stylisticTypeChecked, // Typed linting (slower)
  // {
  //   // typed linting settings
  //   languageOptions: {
  //     parserOptions: {
  //       projectService: true,
  //       // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  //       tsconfigRootDir: import.meta.dirname,
  //     },
  //   },
  // },
  eslintPluginAstro.configs['flat/recommended'],
  eslintPluginAstro.configs['flat/jsx-a11y-recommended'],
  globalIgnores(['content/']), // ignore old content folder
  globalIgnores(['.astro/']),
  globalIgnores(['.lintstagedrc.mjs']),
  {
    // override/add rules settings here, such as:
    // "astro/no-set-html-directive": "error"
  },
  {
    // override/add rules settings here
    rules: {
      'no-unused-vars': [
        'error', // or 'error' if you want it to be an error
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  // {
  //   files: ['**/*.astro'],
  //   languageOptions: {
  //     parserOptions: {
  //       parser: '@typescript-eslint/parser',
  //       extraFileExtensions: ['.astro'],
  //       projectService: false,
  //       project: true,
  //     },
  //   },
  // },
);
