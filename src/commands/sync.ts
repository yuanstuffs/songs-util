import { Command } from '#lib/structures';
import { ApplyOptions } from '#utils/decorators';
import { filterSongs, getFileName } from '#utils/util';
import { Spinner } from '@favware/colorette-spinner';
import { Result } from '@sapphire/result';
import { copyFile, readdir, rm } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';

@ApplyOptions<Command.Options>({
	description: 'Sync the songs to a root of a drive or a directory'
})
export class UserCommand extends Command {
	private readonly defaultWaitTimeout = 1000;

	public override async run(destination: string) {
		destination = this.resolvePath(destination);
		const tasks = [
			this.cleanupFiles, //
			this.copyFiles
		];

		for (const task of tasks) {
			await task.call(this, destination);
			await setTimeout(this.defaultWaitTimeout);
		}
	}

	public override registerCommand(command: Command.CommanderCommand): Command.CommanderCommand {
		return command
			.alias('s') //
			.argument('<destination>', 'The directory of the songs to be synced');
	}

	private async cleanupFiles(destination: string) {
		const spinner = new Spinner(`Cleaning files (${destination})...`).start();
		const files = filterSongs(await readdir(pathToFileURL(destination))); //

		if (!files.length) {
			spinner.error({ text: 'No files to remove.' });
			return this;
		}

		let i = 0;
		let success = 0;
		for (const file of files) {
			const filename = getFileName(file);
			const index = ++i;
			spinner.update({ text: `[${index}/${files.length}] Removing ${filename}` });
			const result = await Result.fromAsync(() => rm(pathToFileURL(`${destination}/${file}`)));
			result.match({
				ok: () => ++success && spinner.update({ text: `[${index}/${files.length}] Removed ${filename}` }),
				err: () => spinner.error({ text: `Unknown error when removing ${filename}` })
			});
		}

		if (success) spinner.success({ text: `Removed ${files.length} files from ${destination}` });

		return this;
	}

	private async copyFiles(destination: string) {
		const spinner = new Spinner(`Copying files (${destination})...`).start();
		const files = filterSongs(await readdir(pathToFileURL(this.srcDir))); //

		if (!files.length) {
			spinner.error({ text: 'The directory does not have any files to copy. Exiting...' });
			return this;
		}

		let i = 0;
		let success = 0;
		for (const file of files) {
			const src = pathToFileURL(`${this.srcDir}/${file}`);
			const dest = pathToFileURL(`${destination}/${file}`);
			const filename = getFileName(file);
			const index = ++i;
			spinner.update({ text: `[${index}/${files.length}] Copying ${filename}` });
			const result = await Result.fromAsync(() => copyFile(src, dest));
			result.match({
				ok: () => ++success && spinner.update({ text: `[${index}/${filename}] Copied ${filename}` }),
				err: () => spinner.error({ text: `Unknown error when copying ${filename}` })
			});
		}

		if (success) spinner.success({ text: `Copied ${files.length} files to ${destination}` });

		return this;
	}
}
