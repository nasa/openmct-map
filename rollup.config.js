import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import css from 'rollup-plugin-css-only';
import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
    input: 'src/openmct-map.js',
    output: {
        name: 'OpenMCTMapPlugin',
        file: 'dist/openmct-map.js',
        format: 'umd',
        sourcemap: true
    },
    watch: {
        chokidar: true
    },
    plugins: [
        css(),
        resolve(),
        commonjs(),
        sourcemaps()
    ]
};
