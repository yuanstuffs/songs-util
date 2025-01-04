import { Command } from '#lib/structures';
import { ApplyOptions } from '#utils/decorators';
import { filterSongs, parseFile } from '#utils/util';
import { Spinner } from '@favware/colorette-spinner';
import { Result } from '@sapphire/result';
import { readdir, rename } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import prompts, { type PromptObject } from 'prompts';

@ApplyOptions<Command.Options>({
	description: "Set a song's index to a specified index"
})
export class UserCommand extends Command {
	public override async run(filename: string, index: string) {
		const spinner = new Spinner("Moving the file's index...").start();
		const files = filterSongs(await readdir(pathToFileURL(this.srcDir), { encoding: 'utf-8' })) //
			.filter((file) => parseFile(file).index !== -1);

		if (!files.length) {
			spinner.error({ text: 'No files to remove.' });
			process.exit(1);
		}

		const targetIndex = files.findIndex((file) => file.includes(filename));

		if (targetIndex === -1) {
			spinner.error({ text: 'File not found in the list. You may have to append an index to the file first before moving.' });
			process.exit(1);
		}

		await this.insertAtIndex(files, Number(index), targetIndex, spinner);
	}

	public override registerCommand(command: Command.CommanderCommand): Command.CommanderCommand {
		return command //
			.alias('m')
			.alias('mv')
			.argument('<filename>', 'The file name')
			.argument('<index>', 'The index of the file to be set');
	}

	private async insertAtIndex(files: string[], index: number, targetIndex: number, spinner: Spinner) {
		spinner.stop();
		const originalFile = files[targetIndex];
		const parsedFile = parseFile(originalFile);

		const response = await prompts(this.makePrompts(parsedFile.filename));
		if (!response.confirm) {
			process.exit(1);
		}

		spinner.start();
		const [removedSong] = files.splice(targetIndex, 1);

		files.splice(index - 1, 0, removedSong);

		let success = 0;

		for (const [i, f] of files.entries()) {
			const parsed = parseFile(f);
			const ui = i + 1;
			const newName = `${ui}. ${parsed.filename}${parsed.filetype}`;

			const result = await Result.fromAsync(() =>
				rename(
					pathToFileURL(`${this.srcDir}/${f}`), //
					pathToFileURL(`${this.srcDir}/${newName}`)
				)
			);

			result.match({
				ok: () => ++success && spinner.update({ text: `Renamed ${parsed.filename} to index ${ui}` }),
				err: () => spinner.error({ text: `Unknown error when renaming ${parsed.filename} to ${ui}` })
			});
		}

		if (success) spinner.success({ text: `Updated ${success} files.` });
	}

	private makePrompts(filename: string): PromptObject<'confirm'> {
		return {
			type: 'confirm',
			name: 'confirm',
			message: `Please confirm if this is the correct file to be set the index (${filename})`
		};
	}
}
