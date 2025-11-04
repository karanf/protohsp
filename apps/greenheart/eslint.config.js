import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',
      '@next/next/no-img-element': 'off',
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'no-empty-pattern': 'off',
      'prefer-const': 'off',
      'turbo/no-undeclared-env-vars': 'off',
    },
  },
];
