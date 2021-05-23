const baseConfig = require('../jest.config')

module.exports = {
  ...baseConfig,
  displayName: 'functional-tests',
  setupFilesAfterEnv: [
    '<rootDir>/test/jest.setup.ts',
    '<rootDir>/test/functional/jest.setup.ts',
  ],
  testMatch: ['<rootDir>/test/functional/**/*.test.ts'],
}
