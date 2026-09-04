const path = require("path");

module.exports = {
    mode: "development",

    entry: "./src/main.js",

    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
        clean: true,
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                type: "javascript/auto",
            },
            {
                test: /\.svg$/i,
                type: "asset/resource",
            },
        ],
    },

    devServer: {
        static: {
            directory: path.join(__dirname, "src"),
        },
        port: 8080,
        open: true,
    },
};