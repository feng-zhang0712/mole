const path  = require('path');
const ExamplePlugin = require('./plugins/ExamplePlugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  plugins: [
    new ExamplePlugin(),
  ],
  mode: "development",
};
