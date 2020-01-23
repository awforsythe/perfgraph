const path = require('path');

module.exports = {
  entry: {
    index: './src/index.jsx',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '..', 'public'),
  },
  mode: process.env.NODE_ENV || 'development',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(jpg|jpeg|png|woff|woff2|eot|ttf|svf)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              publicPath: url => `../public/${url}`,
            },
          },
        ],
      }
    ],
  },
};
