module.exports = {
  rootDir: '..',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'json'],
  transform: {
    '^.+\\.js$': ['babel-jest', { configFile: './config/babel.config.js' }],
  },
  testMatch: ['**/tests/unit/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.js'],
  moduleDirectories: ['node_modules', 'src'],
  transformIgnorePatterns: ['node_modules/(?!(@mlc-ai/web-llm)/)'],
  globals: {
    'process.env': {
      NODE_ENV: 'test',
    },
  },
  collectCoverage: true,
  coverageReporters: ['text', 'lcov'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
};
