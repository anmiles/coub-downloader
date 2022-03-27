module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['<rootDir>/src/**/tests/*.test.[jt]s'],
	coverageDirectory: '.coverage/',
	collectCoverageFrom: [
		'<rootDir>/src/**/*.[jt]s$',
	],
	coveragePathIgnorePatterns: [
		'\\/tests\\/',
		'\\.d\\.ts$',
		'\\.snap$',
		'\\.json$',
	],
};
