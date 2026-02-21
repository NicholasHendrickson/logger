const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require("webpack");
const dotenv = require("dotenv");

// Load environment variables from .env file
const env = dotenv.config().parsed || {};

// Reduce the environment variables to a format that Webpack can use
const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});

// Define the plugins to use
const plugins = [
  new HtmlWebpackPlugin({
    template: path.resolve(__dirname, 'public', 'index.html'),
    filename: 'index.html',
    hash: true,
    favicon: undefined,
  }),
  new webpack.DefinePlugin(envKeys),
];

module.exports = (webpackEnv, options) => {
  const mode = webpackEnv.mode || "development";
  const bProduction = mode === 'production';
  console.log(`Webpack mode: ${mode}`);

  return {
    mode: mode,
    entry: bProduction ? './src/index.ts' : './src/index.ts', // This allows for specifying a different entry point for development
    output: {
      filename: 'index[contenthash].js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
    },
    devtool: bProduction ? 'source-map' : 'eval-source-map',
    module: {
      rules: [
        {
          // TypeScript Loader
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          // CSS Loader with PostCSS - NOTE: css modules underwent a breaking change in v7.0.0. Modules now require import syntax in the following form: `import * as styles from './styles.module.css';`
          test: /\.css$/i,
          use: [
            'style-loader',
            { 
              loader: 'css-loader',
              options: {
                importLoaders: 1,
              }
            },
            'postcss-loader'
          ],
        },
        // File Loader for images
        {
          test: /\.(png|jpe?g|gif)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {},
            }
          ]
        },
        // SVG Loader
        {
          test: /\.svg$/,
          use: ['@svgr/webpack', 'url-loader'],
        },
        // Raw Loader for Markdown Files
        {
          test: /\.md$/,
          use: 'raw-loader',
        },
        // Babel Loader (Optional) - Uncomment if you're using Babel
        /*
        {
          test: /\.(js|ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-typescript',
                // '@babel/preset-react' // Uncomment if using React
              ],
            },
          },
        },
        */
      ],
    },
    resolve: {
      alias: {
        // Define your aliases here. For example: '@components': path.resolve(__dirname, 'src/components/'),
      },
      extensions: ['.tsx', '.ts', '.js'],
      fallback: {
        "path": require.resolve("path-browserify"),
        "os": require.resolve("os-browserify/browser"),
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "buffer": require.resolve("buffer/"),
        "process": require.resolve("process/browser"),
      }
    },
    plugins: plugins,
    devServer: {
      static: {
        directory: path.resolve(__dirname, 'dist'),
      },
      devMiddleware: {
        publicPath: '/',
      },
      compress: true,
      port: 8080,
      open: true,
      hot: true,
    },
    optimization: {
      minimize: bProduction,
      splitChunks: {
        chunks: 'all',
      },
    },
  };
};