const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = (env, options) => {
	const isDevelopment = options.mode === 'development';
	return {
		entry: './src/index.js',
		mode: options.mode,
		output: {
			filename: () => isDevelopment ? '[id].js' : '[contenthash].js',
			chunkFilename: () => isDevelopment ? '[id]~chunk.js' : 'chunk~[contenthash].js',
			path: path.resolve(__dirname, "bundle"),
			environment: {
				arrowFunction: false
			}
		},
		module: {
			rules: [
				{
					test: /\.css$/,
					use: [
						MiniCssExtractPlugin.loader, 
						"css-loader", 
						{
							loader: "postcss-loader",
							options: {
								postcssOptions: {
									plugins: [require("autoprefixer")],
								},
							},
						}
					],
				},
				{
					test: /\.(svg|gif|png|eot|woff|ttf)$/,
					use: ["url-loader"],
				},
				{
					test: /\.js$/,
					exclude: /(node_modules|bower_components)/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env'],
						},
					},
				},
			],
		},
		plugins: [].concat(
			new HtmlWebpackPlugin({
				inject: 'body',
				template: `./src/index.html`,
				filename: path.resolve(__dirname, `bundle/index.html`),
				scriptLoading: 'blocking',
				minify: false,
			}),
			new MiniCssExtractPlugin({
				filename: () => isDevelopment ? '[id].css' : '[contenthash].css',
				chunkFilename: () => isDevelopment ? '[id]~chunk.css' : 'chunk~[contenthash].css',
			})
		),
		optimization: {
			splitChunks: {
				chunks: 'all',
			},
			minimize: true,
			minimizer: [
				new UglifyJsPlugin({
					test: /\.js(\?.*)?$/i,
					extractComments: true,
				}),
				new OptimizeCssAssetsPlugin(),
			],
		},
	}
};