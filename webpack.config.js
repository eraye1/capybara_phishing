const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    background: './background.js',
    content: './content.js',
    popup: './popup.js',
    worker: './worker.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "manifest.json" },
        { from: "popup.html" },
        { from: "styles.css" },
        { from: "icons", to: "icons" }
      ],
    }),
  ],
}; 