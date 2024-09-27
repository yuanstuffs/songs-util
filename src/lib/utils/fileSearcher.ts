import { Spinner } from '@favware/colorette-spinner';
import { readdir } from 'node:fs/promises';
import { constructFileURL, filterSongs, getFileName } from '#utils/util';

export class FileSearcher {
	public constructor(
		private readonly src: string,
		private readonly query: string
	) {}

	public async search() {
		const spinner = new Spinner(`Searching with the query "${this.query}"`).start();
		const files = filterSongs(await readdir(constructFileURL(this.src)));

		if (!files.length) {
			spinner.error({ text: 'The directory does not contain any files. Exiting...' });
			process.exit(1);
		}

		let i = 0;
		const matched: string[] = [];
		for (const file of files) {
			const filename = getFileName(file);
			if (!filename.includes(this.query)) continue;
			matched.push(file);
			spinner.update({ text: `[${++i}/${files.length}] ${matched.length} files found` });
		}

		if (!matched.length) spinner.error({ text: 'No matching found.' });

		spinner.stop();
		console.log(matched.join('\n'));
	}
}
