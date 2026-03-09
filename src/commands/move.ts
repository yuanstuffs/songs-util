import { Command } from '#lib/structures';
import { ApplyOptions } from '#utils/decorators';
import { parseFile } from '#utils/util';
import { Spinner } from '@favware/colorette-spinner';
import { Result } from '@sapphire/result';
import { rename } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import prompts, { type PromptObject } from 'prompts';

@ApplyOptions<Command.Options>({
	description: "Set a song's index to a specified index"
})
export class UserCommand extends Command {
	public override async run(filename: string, index: string, src: string = this.srcDir) {
		const spinner = new Spinner("Moving the file's index...").start();

		if (!(await this.ensureDirExists(src))) {
			console.error(this.makePathNotExistsMessage(src));
			process.exit(1);
		}

		const files = (await this.getFilesInDirectory(src)).filter((file) => parseFile(file).index !== -1);
		if (!files.length) {
			spinner.error({ text: 'No files to move.' });
			process.exit(1);
		}

		const targetIndex = files.findIndex((file) => file.includes(filename));

		if (targetIndex === -1) {
			spinner.error({ text: 'File not found in the list. You may have to append an index to the file first before moving.' });
			process.exit(1);
		}

		await this.insertAtIndex(files, Number(index), targetIndex, src, spinner);
	}

	public override registerCommand(command: Command.CommanderCommand): Command.CommanderCommand {
		return command //
			.alias('m')
			.alias('mv')
			.argument('<filename>', 'The file name (case sensitive)')
			.argument('<index>', 'The index of the file to be set')
			.argument('[src]', 'The directory containing the files to be sorted.');
	}

	private async insertAtIndex(files: string[], index: number, targetIndex: number, src: string, spinner: Spinner) {
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
					pathToFileURL(`${src}/${f}`), //
					pathToFileURL(`${src}/${newName}`)
				)
			);

			result.match({
				ok: () => ++success && spinner.update({ text: `Renamed ${parsed.filename} to index ${ui}` }),
				err: (e: string) => spinner.error({ text: `Unknown error when renaming ${parsed.filename} to ${ui}`, mark: e })
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
