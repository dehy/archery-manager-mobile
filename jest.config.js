// Formatting tests assert the club's local time: pin the timezone so they pass anywhere (CI is UTC).
process.env.TZ = 'Europe/Paris';

module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
