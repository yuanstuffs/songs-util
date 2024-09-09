#!/usr/bin/env node
import '#lib/setup';
import moveCmd from '#commands/move';
import syncCmd from '#commands/sync';
import { createColors } from 'colorette';
import { Command } from 'commander';

createColors({ useColor: true });

const songsUtil = new Command() //
	.name('Song Syncer')
	.version('1.0.0');

songsUtil
	.command('sync')
	.description('Sync the songs to a root of a drive or a directory')
	.alias('s')
	.argument('<destination>', 'The destination of the songs to be synced')
	.action(syncCmd);

songsUtil
	.command('move')
	.description("Set a song's index to a specified index")
	.alias('m')
	.argument('<filename>', 'The file name')
	.argument('<index>', 'The index of the file to be set')
	.action(moveCmd);

songsUtil.parse(process.argv);
