import { Spinner } from '@favware/colorette-spinner';
import { Result } from '@sapphire/result';
import { copyFile, readdir, rm, utimes } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';
import { BaseUtil } from '#utils/commander';
import { constructFileURL, filterSongs, getFileName, resolvedDestinationName } from '#utils/util';

export class SongsSyncer extends BaseUtil {
	private readonly defaultWaitTimeout = 1000;
	public constructor(
		private readonly src: string,
		public override readonly destination: string
	) {
		super(destination);
	}

	public async cleanupFiles() {
		const spinner = new Spinner(`Cleaning files (${this.resolvedDestinationName})...`).start();
		const files = filterSongs(await readdir(constructFileURL(this.destination))); //

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
			const result = await Result.fromAsync(() => rm(constructFileURL(`${this.destination}/${file}`)));
			result.match({
				ok: () => ++success && spinner.update({ text: `[${index}/${files.length}] Removed ${filename}` }),
				err: () => spinner.error({ text: `Unknown error when removing ${filename}` })
			});
		}

		if (success) spinner.success({ text: `Removed ${files.length} files from ${this.resolvedDestinationName} drive` });

		return this;
	}

	public async copyFiles() {
		const spinner = new Spinner(`Copying files (${this.resolvedDestinationName})...`).start();
		const files = filterSongs(await readdir(constructFileURL(this.src))); //

		if (!files.length) {
			spinner.error({ text: 'The directory does not have any files to copy. Exiting...' });
			return this;
		}

		let i = 0;
		let success = 0;
		for (const file of files) {
			const src = constructFileURL(`${this.src}/${file}`);
			const dest = constructFileURL(`${this.destination}/${file}`);
			const filename = getFileName(file);
			const index = ++i;
			spinner.update({ text: `[${index}/${files.length}] Copying ${filename}` });
			const result = await Result.fromAsync(() => copyFile(src, dest));
			result.match({
				ok: () => ++success && spinner.update({ text: `[${index}/${filename}] Copied ${filename}` }),
				err: () => spinner.error({ text: `Unknown error when copying ${filename}` })
			});
		}

		if (success) spinner.success({ text: `Copied ${files.length} files to ${this.resolvedDestinationName} drive` });

		return this;
	}

	public async updateTime() {
		const spinner = new Spinner(`Updating timestamp (${this.resolvedDestinationName})...`).start();
		const files = filterSongs(await readdir(constructFileURL(this.src)));

		if (!files.length) {
			spinner.error({ text: 'The directory does not have any files to update. Exiting...' });
			process.exit(1);
		}

		let i = 0;
		let success = 0;
		for (const file of files) {
			const dest = constructFileURL(`${this.destination}/${file}`);
			const filename = getFileName(file);
			const index = ++i;
			spinner.update({ text: `[${index}/${files.length}] Updating ${filename}` });
			const now = new Date();
			const result = await Result.fromAsync(() => utimes(dest, now, now));
			result.match({
				ok: () => ++success && spinner.update({ text: `[${index}/${filename}] Updated ${filename}` }),
				err: () => spinner.error({ text: `Unknown error when updating ${filename}` })
			});
		}

		if (success) spinner.success({ text: `Updated ${files.length} files timestamp` });

		return this;
	}

	public async execute() {
		const tasks = [
			this.cleanupFiles, //
			this.copyFiles,
			this.updateTime
		];

		for (const task of tasks) {
			if (!task) continue;
			await task();
			await setTimeout(this.defaultWaitTimeout);
		}
	}

	private get resolvedDestinationName() {
		return resolvedDestinationName(this.destination);
	}
}
