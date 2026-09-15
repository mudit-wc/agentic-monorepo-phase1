const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  coverageReporters: ['text-summary', 'lcov', 'cobertura'],
  // Enforced in CI (--configuration=ci). Raise over time; never lower without an ADR.
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
