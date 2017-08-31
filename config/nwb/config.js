module.exports = {
  type: 'react-app',
  polyfill: false,
  webpack: {
    extra: {
      resolve: {
        extensions: ['.ts', '.tsx'],
      },
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            loader: 'awesome-typescript-loader',
          },
        ],
      },
    },
    extractText: {
      allChunks: true,
    },
  },
};
