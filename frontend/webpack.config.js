const MiniCssExtractPlugin = require("mini-css-extract-plugin");

var path = require('path');

module.exports = {
  output: {
    path: "frontend/static/",
    publicPath: "/static/frontend/"
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].[hash].css'
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        },
        resolve: {
          alias: {
            src: path.resolve(__dirname, 'src/'),
            assets: path.resolve(__dirname, 'src/assets/'),
            layouts: path.resolve(__dirname, 'src/layouts/'),
            components: path.resolve(__dirname, 'src/components/'),
            views: path.resolve(__dirname, 'src/views/'),
            variables: path.resolve(__dirname, 'src/variables/')
          }
        }
      },
      {
        test: /\.css$/, use: 'css-loader',
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/'
            }
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /\.module\.s(a|c)ss$/,
        loader: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
            }
          },
          {
            loader: 'sass-loader',
          }
        ]
      },
      {
        test: /\.s(a|c)ss$/,
        exclude: /\.module.(s(a|c)ss)$/,
        loader: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
          }
        ]
      }
    ]
  }
};
