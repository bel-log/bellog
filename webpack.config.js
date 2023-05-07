const path = require("path");
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require('webpack');

const isProduction = process.argv[process.argv.indexOf('--mode') + 1] === 'production';


module.exports = (env) => {

    return {
        entry: "./src/index.tsx",
        devtool: "source-map",
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.css$/,
                    use: ["style-loader", "css-loader"]
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        // Creates `style` nodes from JS strings
                        "style-loader",
                        // Translates CSS into CommonJS
                        "css-loader",
                        // Compiles Sass to CSS
                        "sass-loader",
                    ],
                }
            ]
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js', '.css', '.scss'],
        },
        output: {
            path: path.resolve(__dirname, "dist/"),
            filename: "bundle.js"
        },
        watch: !isProduction,
        plugins: [
            new CopyPlugin({
                patterns:
                    [
                        {
                            from: 'src/index.html', to: './'
                        },
                        {
                            from: 'src/logo.png', to: './'
                        },
                        {
                            from: 'src/favicon.png', to: './'
                        }
                    ]
            })
        ]
    }
};