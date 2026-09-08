const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './src/main.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
    devServer: {
        static: './dist',
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index.html"
        })
    ],
    module: {
        rules: [
            {
                test: /\.js$/i,
                exclude: /node_modules/
            },
            {
                test: /\.svg$/i,
                type: "asset/resource"
            }
        ]
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                parallel: true,

                terserOptions: {
                    mangle: {
                        properties: {
                            regex: /^_/,
                            keep_quoted: true
                        }
                    },

                    compress: {
                        passes: 4,
                        pure_getters: true
                    },

                    output: {
                        wrap_func_args: false
                    }
                }
            })
        ]
    }
};