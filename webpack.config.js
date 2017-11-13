const path = require('path')
module.exports = {
  entry: ['whatwg-fetch','./src/main.js'],
  output: {
    path: path.resolve(__dirname, 'output'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  }
}