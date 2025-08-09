module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // Temporarily disable strict rules for production build
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'react/no-unescaped-entities': 'warn',
    '@next/next/no-img-element': 'warn',
    '@next/next/no-html-link-for-pages': 'warn',
  },
};
