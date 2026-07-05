import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      'node_modules/',
      'out/',
      '.next/',
      'dist/',
      'jest.setup.cjs',
      'eslint.config.mjs',
      '**/*.cjs',
    ],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-unused-vars': 'off',
      'no-undef': 'off',
    },
  },
];
