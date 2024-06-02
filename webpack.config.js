const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/' // Ensures the correct base path for assets
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/images/[name][ext]' // Customizes where and how the assets are stored
                }
            }
        ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'src/assets', to: 'assets' } // Make sure the path matches where your images are stored
            ]
        })
    ],
    mode: 'development',
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 8080
    },
    resolve: {
        alias: {
            phaser: path.join(__dirname, '/node_modules/phaser/dist/phaser.js')
        }
    }
};
