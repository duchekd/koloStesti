import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

import js from "@eslint/js";

export default tseslint.config(
  {
    ignores: ["dist", "build", "node_modules"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: {
      react,
      "simple-import-sort": simpleImportSort,
      "react-hooks": reactHooks,
      import: importPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "import/extensions": ["error", "never", { json: "always", generated: "always" }],
      "import/no-unresolved": "off",
      "import/order": "off",

      "simple-import-sort/imports": [
        "warn",
        {
          groups: [
            ["^react$"],
            ["^[^./@].*"],
            [".*@elx-element.*"],
            [".*@mui.*"],
            [".*@material-ui.*"],
            [".*@mdi.*"],
            [".*types.*"],
            [".*models.*"],
            [".*store.*"],
            [".*utils.*"],
            [".*helpers.*"],
            [".*hooks.*"],
            [".*_core.*"],
            ["others", "."],
            [".*styles.*"],
            ["^\\./"],
          ],
        },
      ],

      "react/jsx-filename-extension": ["error", { extensions: [".tsx"] }],
      "react/function-component-definition": [
        "warn",
        {
          namedComponents: "arrow-function",
          unnamedComponents: "arrow-function",
        },
      ],
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/require-default-props": "off",
      "react/destructuring-assignment": "off",
      "react/prop-types": "off",
      "react/jsx-props-no-spreading": "off",
      "react/jsx-fragments": "off",
      "react/jsx-no-duplicate-props": ["error", { ignoreCase: false }],

      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { vars: "all", argsIgnorePattern: "^_*$" }],
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": "error",

      "default-param-last": "off",
      "no-undef": "off",
      "no-use-before-define": "off",
      "no-console": ["warn", { allow: ["debug"] }],
      radix: ["warn", "as-needed"],
      "arrow-body-style": ["warn", "as-needed"],
      "func-names": ["error", "as-needed"],
    },
  },
  {
    files: ["src/**/**/slice.ts"],
    rules: {
      "no-param-reassign": "off",
    },
  },
  prettier
);
