module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: {
      global: 'VirtualList',
      externals: {
        react: 'React',
        'prop-types': 'PropTypes',
      }
    }
  },
  polyfill: false,
  webpack: {
    extractText: {
      allChunks: true
    }
  }
}
