const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'pinkfluffyunicorn.js',
    path: path.resolve(__dirname, 'dist')
  }
};
