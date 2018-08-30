import cleanup from 'rollup-plugin-cleanup';

export default {
	input: 'src/Powerup.js',
	plugins:[
		cleanup()
	],
	output: {
		file: 'dist/client/pubs_dist.js',
		format: 'umd',
		name: 'Powerup'
	}
};