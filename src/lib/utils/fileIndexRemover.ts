import { Spinner } from '@favware/colorette-spinner';
import { Result } from '@sapphire/result';
import { readdir, rename } from 'node:fs/promises';
import prompts, { type PromptObject } from 'prompts';
import { BaseUtil } from '#utils/commander';
import { constructFileURL, fileExt, filterSongs, getFileName } from '#utils/util';

export class FileIndexRemover extends BaseUtil {
	public constructor(public override readonly destination: string) {
		super(destination);
	}

	public async remove() {
		const spinner = new Spinner(`Preparing to remove index numbers from ${this.destination}...`).start();
		const files = filterSongs(await readdir(constructFileURL(this.destination)));

		if (!files.length) {
			spinner.error({ text: 'The directory does not have any files to remove index number. Exiting...' });
			process.exit(1);
		}

		spinner.stop();
		const response = await prompts(this.makePrompts());
		if (!response.confirm) {
			process.exit(1);
		}
		spinner.start();

		let i = 0;
		let success = 0;
		for (const file of files) {
			const filename = getFileName(file);
			const originalFileURL = constructFileURL(`${this.destination}/${file}`);
			const index = ++i;
			const dest = constructFileURL(`${this.destination}/${filename}${fileExt}`);
			spinner.update({ text: `[${index}/${files.length}] Removing index number for ${filename}` });
			const result = await Result.fromAsync(() => rename(originalFileURL, dest));
			result.match({
				ok: () => ++success && spinner.update({ text: `[${index}/${files.length}] Removed index number for ${filename}` }),
				err: () => spinner.error({ text: `Unknown error when removing index number for ${filename}` })
			});
		}

		if (success) spinner.success({ text: `Removed ${success} files of its index number` });

		return undefined;
	}

	private makePrompts(): PromptObject<'confirm'> {
		return {
			type: 'confirm',
			name: 'confirm',
			message: 'Are you sure you want to remove all index numbers?'
		};
	}
}
