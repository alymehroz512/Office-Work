module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@fortawesome/fontawesome-svg-core': '<rootDir>/__mocks__/fontawesome.js',
    '^@fortawesome/free-solid-svg-icons': '<rootDir>/__mocks__/fontawesome.js',
    '^@fortawesome/react-fontawesome': '<rootDir>/__mocks__/fontawesome.js',
    "\\.(css|less|scss|sass)$": "identity-obj-proxy"
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  injectGlobals: true,
};