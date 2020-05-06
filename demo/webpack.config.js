const path = require('path')
const HelloWorldPlugin = require('./plugins/HelloWorldPlugin')
const HTMLPlugin = require('./plugins/HTMLPlugin')

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      // {
      //   test: /\.js$/,
      //   use: './loaders/mini-loader.js'
      // },
      // {
      //   test: /\.js$/,
      //   use: ['./loaders/mini-loader.js']
      // },
      {
        test: /\.js$/,
        use: {
          loader: './loaders/mini-loader.js',
          options: {
            name: '吴彤'
          }
        }
      }
    ]
  },
  plugins: [
    new HelloWorldPlugin(),
    new HTMLPlugin({
      template: './src/index.html',
      filename: 'index.html'
    })
  ],
  mode: 'development'
}