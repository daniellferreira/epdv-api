const baseConfig = require('../jest.config')

module.exports = {
  ...baseConfig,
  displayName: 'unit-tests',
  setupFilesAfterEnv: ['<rootDir>/test/jest.setup.ts'],
  testMatch: ['<rootDir>/test/unit/**/*.test.ts'],
}
