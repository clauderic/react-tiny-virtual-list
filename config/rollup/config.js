import typescript from 'rollup-plugin-typescript2';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';

export default function createRollupConfig({input, output, format, minify}) {
  return {
    input,
    output: [{file: output, format}],
    exports: format === 'es' ? 'named' : 'default',
    name: 'VirtualList',
    external: ['react', 'prop-types'],
    globals: {
      react: 'React',
      'prop-types': 'PropTypes',
    },
    plugins: [
      nodeResolve({
        module: true,
        jsnext: true,
        main: true,
      }),
      commonjs({include: 'node_modules/**'}),
      babel({exclude: 'node_modules/**'}),
      minify ? uglify() : null,
    ].filter(Boolean),
  };
}
