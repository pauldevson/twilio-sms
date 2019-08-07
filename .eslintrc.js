module.exports = {
  extends: 'airbnb-base',
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': ['error'],
    'comma-dangle': 0,
    'arrow-parens': 0,
  },
  env: { node: true, mocha: true },
};
