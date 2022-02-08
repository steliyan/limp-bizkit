module.exports = {
  root: false,
  extends: ["plugin:react/recommended"],
  parserOptions: {
    ecmaVersion: "latest",
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    "react/prop-types": 0,
  },
};
