import { Spinner } from '@favware/colorette-spinner';
import { Result } from '@sapphire/result';
import { readdir, rename } from 'node:fs/promises';
import { BaseUtil } from '#utils/commander';
import { constructFileURL, fileExt, filterSongs, getFileName, resolvedDestinationName } from '#utils/util';

export class SortFiles extends BaseUtil {
	public constructor(public override readonly destination: string) {
		super(destination);
	}

	public async sort() {
		const spinner = new Spinner(`Sorting (${resolvedDestinationName(this.destination)})...`).start();
		const files = filterSongs(await readdir(constructFileURL(this.destination)));

		if (!files.length) {
			spinner.error({ text: 'The directory does not have any files to remove index number. Exiting...' });
			process.exit(1);
		}

		let i = 0;
		let success = 0;
		for (const file of files) {
			const filename = getFileName(file);
			const originalFileURL = constructFileURL(`${this.destination}/${file}`);
			const index = ++i;
			const dest = constructFileURL(`${this.destination}/${index}. ${filename}${fileExt}`);
			spinner.update({ text: `[${index}/${files.length}] Updating index number for ${filename}` });
			const result = await Result.fromAsync(() => rename(originalFileURL, dest));
			result.match({
				ok: () => ++success && spinner.update({ text: `[${index}/${filename}] Updated index number from ${filename}` }),
				err: () => spinner.error({ text: `Unknown error when updating number from ${filename}` })
			});
		}

		if (success) spinner.success({ text: `Updated ${files.length} files of its index number` });

		return undefined;
	}
}
