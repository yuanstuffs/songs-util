import { Command } from '#lib/structures';
import { ApplyOptions } from '#utils/decorators';
import { fileExts, getFileName } from '#utils/util';
import { Spinner } from '@favware/colorette-spinner';
import { Result } from '@sapphire/result';
import { rename } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import prompts, { type PromptObject } from 'prompts';

@ApplyOptions<Command.Options>({
	description: [
		'Removes all index number from files in a provided directory.', //
		'Warning: This action cannot be undone.'
	].join('\n')
})
export class UserCommand extends Command {
	public override async run(destination: string, options: { dir?: string }) {
		destination = this.resolvePath(destination);
		const spinner = new Spinner(`Preparing to remove index numbers from ${destination}...`).start();

		if (!(await this.ensureDirExists(destination))) {
			console.error(this.makePathNotExistsMessage(destination));
			process.exit(1);
		}

		const files = await this.getFilesInDirectory(destination);

		if (!Object.values(files).some((x) => x.length)) {
			spinner.error({ text: 'The directory does not have any files to remove index number. Exiting...' });
			process.exit(1);
		}

		spinner.stop();
		const response = await prompts(this.makePrompts(options.dir));
		if (!response.confirm) {
			process.exit(1);
		}
		spinner.start();

		if (options.dir) {
			const selectedDir = Reflect.get(files, options.dir);

			if (!selectedDir) {
				console.error(this.makePathNotExistsMessage(options.dir));
				process.exit(1);
			}

			await this.doStuff(selectedDir, destination, spinner, options.dir);
			return;
		}

		for (const [folderName, files_] of Object.entries(files)) {
			await this.doStuff(files_, destination, spinner, folderName);
		}
	}

	public override registerCommand(command: Command.CommanderCommand): Command.CommanderCommand {
		return command
			.alias('ri') //
			.argument('<destination>', 'The directory containing the files.')
			.option('--dir <dir>', 'The sub-directory to remove index from');
	}

	private makePrompts(dir?: string): PromptObject<'confirm'> {
		const additionalInfo = dir ? ` in the ${dir} directory` : '';

		return {
			type: 'confirm',
			name: 'confirm',
			message: `Are you sure you want to remove all index numbers${additionalInfo}?`
		};
	}

	private async doStuff(files: string[], destination: string, spinner: Spinner, folderName: string) {
		let i = 0;
		let success = 0;

		for (const file of files) {
			const filename = getFileName(file);
			const originalFileURL = pathToFileURL(`${destination}/${file}`);
			const index = ++i;
			const dest = pathToFileURL(`${destination}/${filename}${fileExts.find((ext) => file.endsWith(ext))}`);
			spinner.update({ text: `[${folderName}] [${index}/${files.length}] Removing index number for ${filename}` });
			const result = await Result.fromAsync(() => rename(originalFileURL, dest));
			result.match({
				ok: () => ++success && spinner.update({ text: `[${folderName}] [${index}/${files.length}] Removed index number for ${filename}` }),
				err: () => spinner.error({ text: `[${folderName}] Unknown error when removing index number for ${filename}` })
			});
		}

		if (success) spinner.success({ text: `[${folderName}] Removed ${success} files of its index number` });
	}
}
