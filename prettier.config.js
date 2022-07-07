const __PROD__ = process.env.NODE_ENV === 'production'
module.exports = {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: false,
  trailingComma: 'es5',
  arrowParens: 'always',
  endOfLine: 'lf',
  plugins: [
    __PROD__ && require.resolve('prettier-plugin-organize-imports'),
    require.resolve('prettier-plugin-packagejson'),
  ].filter(Boolean),
}
