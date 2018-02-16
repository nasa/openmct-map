// Cesium integration from https://cesiumjs.org/tutorials/cesium-and-webpack/

var path = require('path');
var webpack = require('webpack');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');
var CopywebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/openmct-map',
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "openmct-map.js",
        library: "MapPlugin",
        libraryTarget: "umd",
        libraryExport: "default",
        sourcePrefix: "" // For cesium
    },
    amd: {
        toUrlUndefined: true // For cesium
    },
    node: {
        fs: "empty" // For cesium 
    },
    module: {
        rules: [
            { test: /\.css$/, use: ["style-loader", "css-loader"] },
            { test: /\.(png|gif|jpg|jpeg|svg|xml|json)$/, use: ["url-loader"] },
            { test: /\.html$/, use: ["html-loader"] }
        ]
    },
    resolve: {
        alias: {
            vue: "vue/dist/vue.min.js",
            cesium: path.resolve(__dirname, "node_modules/cesium/Source")
        }
    },
    devtool: "source-map",
    plugins: [
        new UglifyJsPlugin({ sourceMap: true }),
        new CopywebpackPlugin([
            { from: "node_modules/cesium/Build/Cesium/Workers", to: 'cesium/Workers' },
            { from: "node_modules/cesium/Source/Widgets", to: 'cesium/Widgets' },
            { from: "node_modules/cesium/Source/Assets", to: 'cesium/Assets' }
        ]),
        new webpack.DefinePlugin({ FOO: "dist/cesium" })
    ],
    devServer: {
        contentBase: path.join(__dirname, "dist")
    }
};
