import { filterSongs, getFileName, resolveFileString, resolvePath } from '#utils/util';
import { Spinner } from '@favware/colorette-spinner';
import { Result } from '@sapphire/result';
import { copyFile, readdir, rename, rm, utimes } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';

export class SongsSyncer {
	private readonly defaultWaitTimeout = 1000;
	public constructor(
		private readonly src: string,
		private readonly destination: string
	) {
		this.destination = resolvePath(this.destination);
	}

	public async cleanupFiles() {
		const spinner = new Spinner(`Cleaning files (${this.resolvedDestinationName})...`).start();
		const files = filterSongs(await readdir(new URL(resolveFileString(this.destination)))); //

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
			const result = await Result.fromAsync(() => rm(new URL(resolveFileString(`${this.destination}/${file}`))));
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
		const files = filterSongs(await readdir(new URL(resolveFileString(this.src)))); //

		if (!files.length) {
			spinner.error({ text: 'The directory does not have any files to copy. Exiting...' });
			return this;
		}

		let i = 0;
		let success = 0;
		for (const file of files) {
			const src = new URL(resolveFileString(`${this.src}/${file}`));
			const dest = new URL(resolveFileString(`${this.destination}/${file}`));
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
		const files = filterSongs(await readdir(new URL(resolveFileString(this.src))));

		if (!files.length) {
			spinner.error({ text: 'The directory does not have any files to update. Exiting...' });
			process.exit(1);
		}

		let i = 0;
		let success = 0;
		for (const file of files) {
			const dest = new URL(resolveFileString(`${this.destination}/${file}`));
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

	public async removeIndexNumber() {
		const spinner = new Spinner(`Removing index numbers (${this.resolvedDestinationName})...`).start();
		const files = filterSongs(await readdir(new URL(resolveFileString(this.src))));

		if (!files.length) {
			spinner.error({ text: 'The directory does not have any files to remove index number. Exiting...' });
			process.exit(1);
		}

		let i = 0;
		let success = 0;
		for (const file of files) {
			const filename = getFileName(file);
			const originalFileURL = new URL(resolveFileString(`${this.destination}/${file}`));
			const dest = new URL(resolveFileString(`${this.destination}/${file.replace(/^0+(\d+)/, '$1')}`));
			// const dest = new URL(resolveFileString(`${this.destination}/${filename}${this.fileExt}`));
			const index = ++i;
			spinner.update({ text: `[${index}/${files.length}] Removing index number for ${filename}` });
			const result = await Result.fromAsync(() => rename(originalFileURL, dest));
			result.match({
				ok: () => ++success && spinner.update({ text: `[${index}/${filename}] Removed index number from ${filename}` }),
				err: () => spinner.error({ text: `Unknown error when removing number from ${filename}` })
			});
		}

		if (success) spinner.success({ text: `Removed ${files.length} files of its index number` });

		return this;
	}

	public async execute() {
		const tasks = [
			this.cleanupFiles, //
			this.copyFiles,
			this.updateTime,
			this.removeIndexNumber
		];

		for (const task of tasks) {
			await task.call(this);
			await setTimeout(this.defaultWaitTimeout);
		}
	}

	private get resolvedDestinationName() {
		return this.destination.split(':\\')[0];
	}
}
