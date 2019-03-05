import cleanup from 'rollup-plugin-cleanup';

export default {
	input: 'src/components/minecraft.js',
	plugins:[
		cleanup({maxEmptyLines:0, comments:"none"})
	],
	output: {
		file: 'dist/client/components/minecraft_party.js',
		format: 'umd',
		name: "Powerup"
	}
};