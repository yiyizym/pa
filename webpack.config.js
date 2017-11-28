const path = require('path')
module.exports = {
  entry: ['./src/main.js'],
  output: {
    path: path.resolve(__dirname, './output'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      { test: /\.js$/, include: /src/, loader: "babel-loader" },
      { test: /\.css$/, include: /src/, loader: ["style-loader", "css-loader"] }
    ]
  },
  devtool: 'eval-inline-sourcemap',
  devServer: {
    hot: true
  }
}