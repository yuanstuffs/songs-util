import { Command } from '#lib/structures';
import { fileExt, filterSongs, getFileName } from '#utils/util';
import { Spinner } from '@favware/colorette-spinner';
import { Result } from '@sapphire/result';
import { readdir, rename } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import prompts, { type PromptObject } from 'prompts';

export class UserCommand extends Command {
	public constructor(context: Command.LoaderContext) {
		super(context, {
			description: [
				'Removes all index number from files in a provided directory.', //
				'Warning: This action cannot be undone.'
			].join('\n')
		});
	}

	public override async run(destination: string) {
		destination = this.resolvePath(destination);
		const spinner = new Spinner(`Preparing to remove index numbers from ${destination}...`).start();
		const files = filterSongs(await readdir(pathToFileURL(destination)));

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
			const originalFileURL = pathToFileURL(`${destination}/${file}`);
			const index = ++i;
			const dest = pathToFileURL(`${destination}/${filename}${fileExt}`);
			spinner.update({ text: `[${index}/${files.length}] Removing index number for ${filename}` });
			const result = await Result.fromAsync(() => rename(originalFileURL, dest));
			result.match({
				ok: () => ++success && spinner.update({ text: `[${index}/${files.length}] Removed index number for ${filename}` }),
				err: () => spinner.error({ text: `Unknown error when removing index number for ${filename}` })
			});
		}

		if (success) spinner.success({ text: `Removed ${success} files of its index number` });
	}

	public override registerCommand(command: Command.CommanderCommand): Command.CommanderCommand {
		return command
			.alias('ri') //
			.argument('<destination>', 'The directory containing the files.');
	}

	private makePrompts(): PromptObject<'confirm'> {
		return {
			type: 'confirm',
			name: 'confirm',
			message: 'Are you sure you want to remove all index numbers?'
		};
	}
}
