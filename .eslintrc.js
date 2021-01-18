module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    "plugin:@shopify/typescript",
    "plugin:@shopify/jest",
    "plugin:@shopify/react",
    "plugin:@shopify/prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    sourceType: "module",
    ecmaVersion: 2020
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "babel/object-curly-spacing": "off",
    "no-undefined": "off",
    "no-param-reassign": "off",
    "react/no-unused-prop-types": "off",
    "react/jsx-filename-extension": [1, { extensions: [".tsx"] }],
    "typescript/member-ordering": "off",
    "jest/consistent-test-it": [
      "error",
      {
        fn: "it",
      },
    ],
    "prettier/prettier": ["error", { "singleQuote": true }],
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": ["error"],
    "@shopify/react-prefer-private-members": "off",
    "@typescript-eslint/member-ordering": "off"
  },
  settings: {
    "import/ignore": ["node_modules", "\\.s?css"],
  },
};
