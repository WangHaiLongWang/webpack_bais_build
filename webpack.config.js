const HtmlWebpackPlugin = require('html-webpack-plugin');
const LogWebpackPlugin = require('./src/plugins/log-webpack-plugin.js');
const CopyRenameWebpackPlugin = require('./src/plugins/copy-rename-webpack-plugin.js');

const path = require('path');
const resolvePath = (paths) => (path.resolve(__dirname, paths))


module.exports = {
    entry: resolvePath('./src/index.js'),
    output: {
        path: resolvePath('./dist'),
        clean: true,
    },
    module: {
        rules: [
            // {
            //     test: /\.js$/,
            //     loader: "loader1.js",
            //     // enforce: 'pre',
            // },
            // {
            //     test: /\.js$/,
            //     loader: "loader2.js"
            // },
            // {
            //     test: /\.js$/,
            //     loader: "loader3.js",
            //     // enforce: 'post'
            // },

            // {
            //     test: /\.js$/,
            //     use: ['clean-log-loader'],
            // },

            // {
            //     test: /\.js$/,
            //     loader: "banner-loader",
            //     options: {
            //         author: 'wanghailong',
            //         age: 23
            //     }
            // },

            // {
            //     test:/\.js$/,
            //     loader:'babel-loader',
            //     options:{
            //       presets: ['@babel/preset-env']
            //     }
            // },

            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'clean-log-loader',
                    },
                    {
                        loader: 'banner-loader',
                        options: {
                            author: 'wanghailong',
                            age: 23
                        },
                    },
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        },
                    },
                ],
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
                exclude: /node_modules/
            }

        ]
    },
    resolveLoader: {
        modules: [
            // 默认在 node_modules 与 src/loaders 的目录下寻找loader
            'node_modules',
            resolvePath('./src/loaders')
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: resolvePath('./src/index.html')
        }),
        new LogWebpackPlugin({
            emitCallback: () => {
                console.log('emit 事件发生啦')
            },
            compilationCallback: () => {
                console.log('compilation 事件发生啦')
            },
            doneCallback: () => {
                console.log('done 事件发生啦')
            },
        }),
        new CopyRenameWebpackPlugin({
            entry: 'main.js',
            output: [
                '../copy/main1.js',
                '../copy/main2.js'
            ]
        })


    ],
    mode: 'development',
}