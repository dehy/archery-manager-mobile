const expoConfig = require('eslint-config-expo/flat');

module.exports = [...expoConfig, { ignores: ['src/api/schema.d.ts', 'dist/*', 'ios/*', 'android/*', '.expo/*'] }];
