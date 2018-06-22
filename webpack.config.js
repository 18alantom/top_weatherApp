const HTMLWebpackPlugin = require('html-webpack-plugin');

const HTMLWebpackPluginConfig = new HTMLWebpackPlugin({
  template: `${__dirname}/src/index.html`,
  filename: 'index.html',
  inject: 'body',
});

module.exports = {
  mode: 'development',
  entry: `${__dirname}/src/script.jsx`,
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.mp3$/,
        exclude: /node_modules/,
        include: `${__dirname}/src`,
        loader: 'file-loader',
      },
      {
        test: /\.s?css$/,
        exclude: /node_modules/,
        use: [
          'style-loader', 
          'css-loader', 
          'sass-loader', 
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  output: {
    filename: 'bundle.js',
    path: `${__dirname}/docs`,
  },
  plugins: [HTMLWebpackPluginConfig],
};
