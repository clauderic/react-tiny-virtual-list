module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: {
      global: 'VirtualList',
      externals: {
        react: 'React'
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
