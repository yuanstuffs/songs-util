import { packageJson } from '#utils/constants';
import { Command } from 'commander';

export const rootCommand = new Command() //
	.command('songs-util')
	.version(packageJson.version);
