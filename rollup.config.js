import pkg from './package.json'
import pluginTypescript from '@rollup/plugin-typescript'

export default {
	input: pkg.input,
	output: [
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
		pluginTypescript()
	]
}
