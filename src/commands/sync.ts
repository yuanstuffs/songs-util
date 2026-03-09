import { Command } from '#lib/structures';
import { ApplyOptions } from '#utils/decorators';
import { getFileName } from '#utils/util';
import { Spinner } from '@favware/colorette-spinner';
import { Result } from '@sapphire/result';
import { copyFile, mkdir, rm } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';

@ApplyOptions<Command.Options>({
	description: 'Sync the songs to a root of a drive or a directory'
})
export class UserCommand extends Command {
	private readonly defaultWaitTimeout = 1000;

	public override async run(destination: string, options: { dir?: string }) {
		destination = this.resolvePath(destination);

		if (!(await this.ensureDirExists(destination))) {
			console.error(this.makePathNotExistsMessage(destination));
			process.exit(1);
		}

		// const files = await this.getFilesInDirectory(this.srcDir);
		// console.log(files);

		const tasks = [this.cleanupFiles, this.copyFiles];

		for (const task of tasks) {
			await task.call(this, destination, options.dir);
			await setTimeout(this.defaultWaitTimeout);
		}
	}

	public override registerCommand(command: Command.CommanderCommand): Command.CommanderCommand {
		return command
			.alias('s') //
			.argument('<destination>', 'The directory of the songs to be synced')
			.option('--dir <dir>', 'The sub-directory to list files for');
	}

	private async cleanupFiles(destination: string, dir?: string) {
		const spinner = new Spinner(`Cleaning files (${destination})...`).start();
		const files = await this.getFilesInDirectory(destination);

		if (!Object.values(files).some((x) => x.length)) {
			spinner.error({ text: 'No files to remove.' });
			return this;
		}

		if (dir) {
			const selectedDir = Reflect.get(files, dir);

			if (!selectedDir) {
				console.error(this.makePathNotExistsMessage(dir));
				process.exit(1);
			}

			await this.doCleanup(selectedDir, destination, spinner, dir);
			return this;
		}

		for (const [folderName, files_] of Object.entries(files)) {
			await this.doCleanup(files_, destination, spinner, folderName);
		}

		return this;
	}

	private async doCleanup(files: string[], destination: string, spinner: Spinner, folderName: string) {
		let i = 0;
		let success = 0;

		for (const file of files) {
			const filename = getFileName(file);
			const index = ++i;
			spinner.update({ text: `[${folderName}] [${index}/${files.length}] Removing ${filename}` });
			const result = await Result.fromAsync(() => rm(pathToFileURL(`${destination}/${folderName}/${file}`)));
			result.match({
				ok: () => ++success && spinner.update({ text: `[${folderName}] [${index}/${files.length}] Removed ${filename}` }),
				err: () => spinner.error({ text: `[${folderName}] Unknown error when removing ${filename}` })
			});
		}

		if (success) spinner.success({ text: `[${folderName}] Removed ${files.length} files from ${destination}` });

		spinner.reset();
	}

	private async copyFiles(destination: string, dir?: string) {
		const spinner = new Spinner(`Copying files (${destination})...`).start();
		const files = await this.getFilesInDirectory(this.srcDir);

		if (!Object.values(files).some((x) => x.length)) {
			spinner.error({ text: 'The directory does not have any files to copy. Exiting...' });
			return this;
		}

		if (dir) {
			const selectedDir = Reflect.get(files, dir);

			if (!selectedDir) {
				console.error(this.makePathNotExistsMessage(dir));
				process.exit(1);
			}

			await this.doCopyFiles(selectedDir, destination, spinner, dir);
			return this;
		}

		for (const [folderName, files_] of Object.entries(files)) {
			await this.doCopyFiles(files_, destination, spinner, folderName);

			spinner.reset();
			await setTimeout(this.defaultWaitTimeout);
		}

		return this;
	}

	private async doCopyFiles(files: string[], destination: string, spinner: Spinner, folderName: string) {
		let i = 0;
		let success = 0;

		await mkdir(pathToFileURL(`${destination}/${folderName}`), { recursive: true });

		for (const file of files) {
			const src = pathToFileURL(`${this.srcDir}/${folderName}/${file}`);
			const dest = pathToFileURL(`${destination}/${folderName}/${file}`);
			const filename = getFileName(file);
			const index = ++i;
			spinner.update({ text: `[${folderName}] [${index}/${files.length}] Copying ${filename}` });
			const result = await Result.fromAsync(() => copyFile(src, dest));
			result.match({
				ok: () => ++success && spinner.update({ text: `[${folderName}] [${index}/${files.length}] Copied ${filename}` }),
				err: (e) => spinner.error({ text: `[${folderName}] Unknown error when copying ${filename}` }) && console.error(e)
			});
		}

		if (success) spinner.success({ text: `[${folderName}] Copied ${files.length} files to ${destination}` });
	}
}
