#!/usr/bin/env node
import '#lib/setup';
import moveCmd from '#commands/move';
import removeIndexCmd from '#commands/removeindex';
import sortCmd from '#commands/sort';
import syncCmd from '#commands/sync';
import { readFile } from 'node:fs/promises';
import { URL } from 'node:url';
import { createColors } from 'colorette';
import { Command } from 'commander';

createColors({ useColor: true });

const songsUtil = new Command();

const packageFile = new URL('../package.json', import.meta.url);
const packageJson = JSON.parse(await readFile(packageFile, 'utf-8'));

songsUtil //
	.name('Songs Util')
	.version(packageJson.version);

songsUtil
	.command('sync')
	.description('Sync the songs to a root of a drive or a directory')
	.alias('s')
	.argument('<destination>', 'The directory of the songs to be synced')
	.action(syncCmd);

songsUtil
	.command('move')
	.description("Set a song's index to a specified index")
	.alias('m')
	.argument('<filename>', 'The file name')
	.argument('<index>', 'The index of the file to be set')
	.action(moveCmd);

songsUtil
	.command('sort')
	.description('Sort the files in numerical order. Example: 1 to 100 (or beyond)')
	.alias('st')
	.argument('<src>', 'The directory containing the files to be sorted.')
	.action(sortCmd);

songsUtil
	.command('removeindex')
	.description(
		[
			'Removes all index number from files in a provided directory.', //
			'Warning: This action cannot be undone.'
		].join('\n')
	)
	.alias('ri')
	.argument('<destination>', 'The directory containing the files.')
	.action(removeIndexCmd);

songsUtil.parse(process.argv);
