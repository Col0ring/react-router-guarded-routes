const __PROD__ = process.env.NODE_ENV === 'production'
module.exports = require('@col0ring/prettier-config')(__PROD__)
