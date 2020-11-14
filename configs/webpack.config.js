/* eslint-disable @typescript-eslint/no-var-requires */
const { resolve } = require("path");
const nodeExternals = require("webpack-node-externals");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const basePlugins = [new CleanWebpackPlugin()];

module.exports = {
    mode: "production",
    entry: "./bin/starter.ts",
    devtool: "source-map",
    target: "node",
    context: resolve(__dirname, "../src"),
    externals: [nodeExternals()],
    output: {
        filename: "server.min.js",
        path: resolve(__dirname, "../dist"),
        publicPath: "/",
    },
    performance: {
        hints: false,
    },
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                test: /\.json(\?.*)?$/i,
            }),
        ],
    },
    resolve: {
        alias: {
            "@": resolve(__dirname, "../src"),
        },
        extensions: [
            ".cjs",
            ".mjs",
            ".ts",
            ".js",
            ".json",
            ".jpeg",
            ".png",
            ".gif",
        ],
        modules: ["node_modules", "src"],
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ["babel-loader", "source-map-loader"],
                exclude: /node_modules/,
            },
            {
                test: /\.tsx?$/,
                use: ["babel-loader", "ts-loader"],
                exclude: [/node_modules/, /__tests__/],
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                rules: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "img/[hash].[ext]",
                            hash: "sha512",
                            digest: "hex",
                        },
                    },
                    {
                        loader: "image-webpack-loader",
                        options: {
                            bypassOnDebug: true,
                            optipng: {
                                optimizationLevel: 7,
                            },
                            gifsicle: {
                                interlaced: false,
                            },
                        },
                    },
                ],
            },
            {
                test: /\.mjs$/,
                include: /node_modules/,
                type: "javascript/auto",
            },
        ],
    },
    plugins: process.env.BUNDLE_ANALYZER
        ? [
              ...basePlugins,
              new BundleAnalyzerPlugin(
                  new BundleAnalyzerPlugin({
                      // "static" generates file instead of starting a web server
                      analyzerMode: "server",
                      analyzerHost: "localhost",
                      analyzerPort: 8888,
                      reportFilename: "report.html",
                      defaultSizes: "parsed",
                      openAnalyzer: true,
                      generateStatsFile: false,
                      statsFilename: "stats.json",
                      statsOptions: null,
                      logLevel: "info",
                  }),
              ),
          ]
        : basePlugins,
};
