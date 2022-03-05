import pkg from './package.json'
import rollupTypescript from '@rollup/plugin-typescript'

export default {
	input: './src/index.ts',
	output: [
		// 1.cjs --> common.js
		// 2.esm
		{
			format: 'cjs',
			file: pkg.main
		},
		{
			format: 'es',
			file: pkg.module
		}
	],
	plugins: [
		rollupTypescript()
	]
}
