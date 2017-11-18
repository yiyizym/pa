const path = require('path')
module.exports = {
  entry: ['./src/main.js'],
  output: {
    path: path.resolve(__dirname, './output'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  },
  devtool: 'eval-inline-sourcemap',
  devServer: {
    hot: true
  }
}