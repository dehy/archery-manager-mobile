const expoPreset = require('jest-expo/jest-preset');

// Formatting tests assert the club's local time: pin the timezone so they pass anywhere (CI is UTC).
process.env.TZ = 'Europe/Paris';

// The HTML parser used to render practice advice ships ESM only: let Babel transform it too.
// jest-expo's own list is extended rather than copied, so SDK upgrades keep their additions.
const esmPackages = 'htmlparser2|domhandler|domelementtype|domutils|dom-serializer|entities';
const transformIgnorePatterns = expoPreset.transformIgnorePatterns.map((pattern) =>
  pattern.startsWith('/node_modules/(?!(') ? pattern.replace('(?!(', `(?!(${esmPackages}|`) : pattern,
);

module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transformIgnorePatterns,
};
