import { packageJson } from '#utils/constants';
import { envParseString } from '@skyra/env-utilities';
import * as colorette from 'colorette';
import { Command } from 'commander';

export const rootCommand = new Command() //
	.command('songs-util')
	.description(
		[
			'Sync songs to another drive (/) or directory', //
			`Loaded src directory: ${envParseString('SRC_DIR')}`
		].join('\n')
	)
	.version(packageJson.version)
	.configureHelp({
		styleCommandDescription: (str) => colorette.cyanBright(str),
		styleDescriptionText: (str) => colorette.dim(colorette.white(str)),
		styleTitle: (title) => colorette.greenBright(title),
		styleUsage: (str) => colorette.whiteBright(str)
	});
