const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'utils.js',
    library: {
      name: 'MicroFrontendUtils',
      type: 'umd',
      export: 'default'
    },
    globalObject: 'this'
  },
  module: {
    rules: []
  },
  resolve: {
    extensions: ['.js']
  }
};
