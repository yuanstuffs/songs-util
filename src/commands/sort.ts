import { Command } from '#lib/structures';
import { ApplyOptions } from '#utils/decorators';
import { fileExts, getFileName } from '#utils/util';
import { Spinner } from '@favware/colorette-spinner';
import { Result } from '@sapphire/result';
import { envParseString } from '@skyra/env-utilities';
import { rename } from 'node:fs/promises';
import { join } from 'node:path';

@ApplyOptions<Command.Options>({
	description: 'Sort the files in numerical order. Example: 1 to 100 (or beyond)'
})
export class UserCommand extends Command {
	public override async run(destination?: string, options?: { dir?: string }) {
		destination ??= envParseString('SRC_DIR');
		destination = this.resolvePath(destination);
		const spinner = new Spinner(`Sorting (${destination})...`).start();

		if (!(await this.ensureDirExists(destination))) {
			console.error(this.makePathNotExistsMessage(destination));
			process.exit(1);
		}

		const files = await this.getFilesInDirectory(destination);

		if (!Object.values(files).some((x) => x.length)) {
			spinner.error({ text: 'The directory does not have any files. Exiting...' });
			process.exit(1);
		}

		if (options?.dir) {
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
			.alias('st') //
			.argument('[src]', 'The directory containing the files to be sorted.')
			.option('--dir <dir>', 'The sub-directory to sort files');
	}

	private async doStuff(files: string[], destination: string, spinner: Spinner, folderName: string) {
		let success = 0;
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const filename = getFileName(file);
			const originalFileURL = join(destination, folderName, file);
			const index = i + 1;
			const dest = join(destination, folderName, `${index}. ${filename}${fileExts.find((ext) => file.endsWith(ext))}`);
			spinner.update({ text: `[${folderName}] [${index}/${files.length}] Updating index number for ${filename}` });
			const result = await Result.fromAsync(() => rename(originalFileURL, dest));
			result.match({
				ok: () => ++success && spinner.update({ text: `[${folderName}] [${index}/${files.length}] Updated index number from ${filename}` }),
				err: (e) => spinner.error({ text: `[${folderName}] Unknown error when updating number from ${filename}`, mark: e as string })
			});
		}

		if (success) spinner.success({ text: `[${folderName}] Updated ${files.length} files of its index number in ${destination}` });
	}
}
