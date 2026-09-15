export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Require AB#<id> work-item reference in the footer or body for traceability
    'references-empty': [2, 'never'],
    'header-max-length': [2, 'always', 100],
    'scope-enum': [
      1,
      'always',
      ['app', 'dashboard', 'shared', 'ci', 'deps', 'docs', 'agents', 'release'],
    ],
  },
  parserPreset: {
    parserOpts: {
      issuePrefixes: ['AB#'],
    },
  },
};
