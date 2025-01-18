const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: {
    content: './src/content/content.js',
    popup: './src/popup/popup.js',
    worker: './worker.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json' },
        { from: 'src/popup/popup.html', to: 'popup.html' },
        { from: 'styles.css' },
        { from: 'icons', to: 'icons' },
      ],
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
      },
    }),
  ],
  resolve: {
    fallback: {
      process: false,
    },
  },
};
