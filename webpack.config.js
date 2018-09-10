'use strict';

const path = require('path');

module.exports = {
    entry: './src/assets/scripts/index.js',

    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
    },

    module: {
        rules: [
            {
                test: /\.js?$/,
                enforce: 'pre',
                exclude: /node_modules/,
                loader: 'eslint-loader',
            },
            {
                test: /.(js)?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015']
                },
            },
        ]
    },

    devServer: {
        port: 7001,
        open: true,
        contentBase: './dist/',
    }
};