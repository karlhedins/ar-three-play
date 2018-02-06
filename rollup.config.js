import babel from 'rollup-plugin-babel';
import globals from 'rollup-plugin-node-globals';
import resolve from 'rollup-plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';
import regenerator from 'rollup-plugin-regenerator';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

export default {
  input: 'src/index.js',
  external: ['three'],
  output: [{
    file: './dist/main.min.js',
    format: 'iife',
    name: 'ArThreePlay',
    globals: {
      three: 'THREE',
    },
  }],
  watch: {
    include: 'src/**',
  },
  plugins: [
    babel({
      plugins: ['external-helpers'],
      exclude: 'node_modules/**',
    }),
    globals(),
    resolve(),
    regenerator(),
    cleanup(),
    serve({
      port: 3000,
      contentBase: 'dist',
    }),
    livereload('dist'),
  ],
};
