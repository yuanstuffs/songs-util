import { Command } from '#lib/structures';
import { ApplyOptions } from '#utils/decorators';
import { fileExt, filterSongs, getFileName } from '#utils/util';
import { Spinner } from '@favware/colorette-spinner';
import { Result } from '@sapphire/result';
import { envParseString } from '@skyra/env-utilities';
import { readdir, rename } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

@ApplyOptions<Command.Options>({
	description: 'Sort the files in numerical order. Example: 1 to 100 (or beyond)'
})
export class UserCommand extends Command {
	public override async run(destination?: string) {
		destination ??= envParseString('SRC_DIR');
		destination = this.resolvePath(destination);
		const spinner = new Spinner(`Sorting (${destination})...`).start();

		if (!(await this.ensureDirExists(destination))) {
			console.error(this.makePathNotExistsMessage(destination));
			process.exit(1);
		}

		const files = filterSongs(await readdir(pathToFileURL(destination)));

		if (!files.length) {
			spinner.error({ text: 'The directory does not have any files. Exiting...' });
			process.exit(1);
		}

		let i = 0;
		let success = 0;
		for (const file of files) {
			const filename = getFileName(file);
			const originalFileURL = pathToFileURL(`${destination}/${file}`);
			const index = ++i;
			const dest = pathToFileURL(`${destination}/${index}. ${filename}${fileExt}`);
			spinner.update({ text: `[${index}/${files.length}] Updating index number for ${filename}` });
			const result = await Result.fromAsync(() => rename(originalFileURL, dest));
			result.match({
				ok: () => ++success && spinner.update({ text: `[${index}/${filename}] Updated index number from ${filename}` }),
				err: () => spinner.error({ text: `Unknown error when updating number from ${filename}` })
			});
		}

		if (success) spinner.success({ text: `Updated ${files.length} files of its index number in ${destination}` });
	}

	public override registerCommand(command: Command.CommanderCommand): Command.CommanderCommand {
		return command
			.alias('st') //
			.argument('[src]', 'The directory containing the files to be sorted.');
	}
}
