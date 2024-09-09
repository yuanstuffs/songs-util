import { constructFileURL, fileExt, filterSongs, parseFile, resolveFileString, resolvePath } from '#utils/util';
import { Spinner } from '@favware/colorette-spinner';
import { Result } from '@sapphire/result';
import { readdir, rename } from 'node:fs/promises';
import { basename } from 'node:path';
import prompts, { type PromptObject } from 'prompts';

export class SongsMover {
	public constructor(
		private readonly destination: string,
		private readonly filename: string,
		private readonly index: number
	) {
		this.destination = resolvePath(this.destination);
	}

	public async move() {
		const spinner = new Spinner(`Moving the file's index...`).start();
		const files = filterSongs(await readdir(new URL(resolveFileString(this.destination)), { encoding: 'utf-8' }));

		if (!files.length) {
			spinner.error({ text: 'No files to remove.' });
			process.exit(1);
		}

		const targetIndex = files.findIndex((file) => file.includes(this.filename));

		if (targetIndex === -1) {
			spinner.error({ text: 'File not found in the list.' });
			process.exit(1);
		}

		await this.insertAtIndex(files, spinner);

		return undefined;
	}

	private async insertAtIndex(files: string[], spinner: Spinner) {
		const targetIndex = files.findIndex((file) => file.includes(this.filename));

		if (targetIndex === -1) {
			spinner.error({ text: 'File not found in the list.' });
			process.exit(1);
		}

		spinner.stop();
		const originalFile = files[targetIndex];
		const file = parseFile(originalFile);
		if (file.index === this.index) {
			return this.updateFileIndices(files, spinner, true);
		}

		const filename = basename(file.filename, fileExt);
		const response = await prompts(this.makePrompts(file.filename));

		if (!response.confirm) {
			process.exit(1);
		}

		spinner.start();

		const newFileName = `${this.index}. ${filename}${file.fileType}`;

		const result = await Result.fromAsync(() =>
			rename(
				constructFileURL(`${this.destination}/${originalFile}`), //
				constructFileURL(`${this.destination}/${newFileName}`)
			)
		);

		result.match({
			ok: () => {
				files.splice(this.index, 0, newFileName);
				spinner.success({ text: `Renamed ${filename} to index ${this.index}` });
			},
			err: () => spinner.error({ text: `Unknown error when renaming ${filename} to ${this.index}` }) && process.exit(1)
		});

		await this.updateFileIndices(files, spinner, false);
	}

	private async updateFileIndices(files: string[], spinner: Spinner, requiredToUpdateIndex: boolean) {
		let success = 0;
		for (const [index, file] of files.entries()) {
			const parsed = parseFile(file);
			const filename = basename(parsed.filename, parsed.fileType);
			const i = requiredToUpdateIndex ? index + 1 : index;
			const newName = `${i}. ${filename}${parsed.fileType}`;
			const result = await Result.fromAsync(() =>
				rename(
					constructFileURL(`${this.destination}/${file}`), //
					constructFileURL(`${this.destination}/${newName}`)
				)
			);

			result.match({
				ok: () => ++success && spinner.success({ text: `Updated index for ${filename} at ${index}` }),
				err: () => spinner.error({ text: `Unknown error when renaming ${filename} to ${index}` })
			});
		}

		if (success) spinner.success({ text: `Updated ${files.length} files to match indexes` });
	}

	private makePrompts(filename: string): PromptObject<'confirm'> {
		return {
			type: 'confirm',
			name: 'confirm',
			message: `Please confirm if this is the correct file to be set the index (${filename})`
		};
	}
}
