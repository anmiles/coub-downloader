module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['<rootDir>/src/**/__tests__/*.test.[jt]s'],
	coverageDirectory: '.coverage/',
	collectCoverageFrom: [
		'<rootDir>/src/**/*.[jt]s$',
	],
	coveragePathIgnorePatterns: [
		'\\/__tests__\\/',
		'\\.d\\.ts$',
		'\\.snap$',
		'\\.json$',
	],
};
