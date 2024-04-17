const path = require('path');

module.exports = {
  entry: './src/lib/dom.js',
  output: {
    filename: 'rfidtemplate.js',
    library: 'rfidtemplate',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    minimize: false
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: {node: "current"} }],
              "@babel/preset-react"
            ]
          }
        }
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      }
    ],
  },
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM'  
  }
};