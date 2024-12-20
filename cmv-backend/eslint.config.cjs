module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true, // Pour les tests
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:prettier/recommended',
    'plugin:security/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:promise/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json', // Chemin vers votre fichier de configuration TypeScript
    tsconfigRootDir: __dirname,
  },
  plugins: [
    '@typescript-eslint',
    'prettier',
    'security',
    'import',
    'promise',
    'unused-imports',
  ],
  settings: {
    'import/resolver': {
      typescript: {}, // Support des imports TypeScript
    },
  },
  rules: {
    // Règles Prettier
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'es5',
        printWidth: 100,
        tabWidth: 2,
        semi: true,
        arrowParens: 'always',
      },
    ],

    // Règles TypeScript
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/no-misused-promises': 'error',

    // Règles de sécurité
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-fs-filename': 'error',

    // Règles d'importation
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
      },
    ],
    'import/no-unresolved': 'error',
    'import/no-duplicates': 'error',

    // Autres règles
    'no-console': 'warn',
    complexity: ['warn', 10],
    'max-depth': ['error', 4],
    'max-lines-per-function': ['warn', 50],
    'promise/always-return': 'error',
    'promise/no-return-wrap': 'error',

    // Gestion des imports non utilisés
    'unused-imports/no-unused-imports': 'error',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '*.config.js',
    '.eslintrc.js',
    '.env',
  ],
};
