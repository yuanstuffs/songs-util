import { Command } from 'commander';
import { packageJson } from '#utils/constants';

export const rootCommand = new Command() //
	.command('songs-util')
	.version(packageJson.version);
