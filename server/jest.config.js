module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  setupFilesAfterEnv: ['./src/test/setup.js'],
  modulePathIgnorePatterns: ['<rootDir>/node_modules/'],
};