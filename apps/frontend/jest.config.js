module.exports = {
  transformIgnorePatterns: [
    'node_modules/(?!(@chakra-ui|@ark-ui)/)',
  ],
  moduleNameMapper: {
    '^@ark-ui/react/(.+)$': '<rootDir>/node_modules/@ark-ui/react/dist/components/$1/index.cjs',
    '^@ark-ui/react$': '<rootDir>/node_modules/@ark-ui/react/dist/index.cjs',
    '^@chakra-ui/react$': '<rootDir>/node_modules/@chakra-ui/react/dist/cjs/index.cjs',
  },
};
