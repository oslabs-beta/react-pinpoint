// import path from "path";
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const extensions = ['.ts', '.js'];

export default [
  {
    input: './src/utils/utils.ts',
    output: {
      file: 'lib/bundle.puppeteer.js',
      exports: 'default',
      format: 'cjs',
    },
    plugins: [
      resolve({
        jsnext: true,
        extensions,
      }),
      commonjs({
        include: 'node_modules/**',
      }),
      babel({
        extensions,
        presets: ['@babel/preset-typescript'],
        exclude: /node_modules/,
      }),
    ],
  },
  {
    input: './src/index.ts',
    output: {
      file: 'lib/bundle.main.js',
      exports: 'default',
      format: 'cjs',
    },
    plugins: [
      resolve({
        jsnext: true,
        extensions,
      }),
      commonjs({
        include: 'node_modules/**',
      }),
      babel({
        extensions,
        babelHelpers: 'bundled',
        presets: ['@babel/preset-typescript'],
        exclude: /node_modules/,
      }),
    ],
  },
];
