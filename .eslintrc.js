module.exports = {
  extends: ['@col0ring/eslint-config/test', '@col0ring/eslint-config'],
  rules: {
    'testing-library/no-unnecessary-act': 'off',
    'testing-library/await-async-query': 'off',
  },
}
