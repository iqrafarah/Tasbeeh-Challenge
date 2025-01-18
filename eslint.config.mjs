import nextjs from "eslint-config-next";

export default [
  {
    ...nextjs,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    env: {
      browser: true,
      node: true,
      es6: true,
    },
  },
];
