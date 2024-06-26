import tseslint from 'typescript-eslint';

export default tseslint.config({
  files: ['src/**/*.{js,ts,jsx,tsx}'],
  ignores: ['**/*.erb'],
  rules: {
    semi: 'error',
    'no-unused-vars': 'error',
  },
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      project: true,
    },
  },
});
