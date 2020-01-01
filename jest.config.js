module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['./lib'],
  testMatch: ['**/__tests__/**/*.+(ts)', '**/?(*.)+(spec|test).+(ts)'],
  transform: {
    '^.+\\.(ts)$': 'ts-jest'
  }
};
