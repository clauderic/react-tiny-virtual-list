const babelJest = require('babel-jest');

module.exports = babelJest.createTransformer({
  presets: [
    require('babel-preset-es2015'),
    require('babel-preset-react'),
    require('babel-preset-stage-1')
  ]
});
