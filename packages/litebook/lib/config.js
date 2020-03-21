const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const merge = require('webpack-merge');

const baseStoryConfig = {
  target: "web",
  performance: { hints: false },
  devtool: "eval-source-map",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.(ts|tsx)?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          transpileOnly: true
        }
      }
    ]
  },
  optimization: {
    splitChunks: false
  }
};

function createStoryConfigs({ cwd, sourceDir, sourceFiles, tempDir, watch, webpack }) {
  return sourceFiles.map(file => {
    const filename = path.basename(file).replace(/\.\w+$/, "");
    const relDir = path.dirname(file).replace(sourceDir, "");
    const absDir = path.join(tempDir, relDir);

    const config = {
      ...baseStoryConfig,
      mode: watch ? "development" : "production",
      entry: file,
      output: {
        filename: `${filename}.js`,
        path: absDir,
        libraryTarget: "commonjs"
      },
      resolve: {
        alias: { "@": sourceDir }
      },
    };

    return webpack ? merge.smart(config, webpack({ ...config })) : config;
  });
}

function createAppConfig({ root, tempDir, publicDir, watch }) {
  return {
    ...baseStoryConfig,
    mode: watch ? "development" : "production",
    entry: path.join(tempDir, "index.js"),
    output: { path: publicDir },
    devtool: "eval-source-map",
    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(root, "/lib/index.html"),
        templateParameters: false
      })
    ]
  };
}

module.exports = {
  baseStoryConfig,
  createStoryConfigs,
  createAppConfig
};
