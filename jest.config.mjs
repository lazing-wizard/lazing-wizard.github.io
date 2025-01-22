
export default {
    testMatch: ['<rootDir>/tests/**/*.test.mjs'],
    moduleDirectories: ['node_modules', '<rootDir>/source'],
    moduleFileExtensions: ['js', 'mjs', 'jsx', 'ts', 'tsx', 'json'],
    transform: {
        '^.+\\.(js|mjs|jsx|ts|tsx)$': 'babel-jest'
    },
    verbose: true
};
