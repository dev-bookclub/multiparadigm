module.exports = {
  extends: ['@commitlint/config-conventional'], // Conventional Commits 확장
  rules: {
    'type-enum': [2, 'always', ['dhyun2']], // GitHub ID 강제
    'type-empty': [2, 'never'],
    'scope-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'header-max-length': [2, 'always', 100],
  },
};
