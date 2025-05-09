import { Command } from '#lib/structures';
import { ApplyOptions } from '#utils/decorators';
import { filterSongs, getFileName } from '#utils/util';
import { Spinner } from '@favware/colorette-spinner';
import { readdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

@ApplyOptions<Command.Options>({
	description: 'Search for files with the matching query.'
})
export class UserCommand extends Command {
	public override async run(query: string) {
		const spinner = new Spinner(`Searching with the query "${query}"`).start();

		if (!(await this.ensureDirExists(this.srcDir))) {
			console.error(this.makePathNotExistsMessage(this.srcDir));
			process.exit(1);
		}

		const files = filterSongs(await readdir(pathToFileURL(this.srcDir)));

		if (!files.length) {
			spinner.error({ text: 'The directory does not contain any files. Exiting...' });
			process.exit(1);
		}

		let i = 0;
		const matched: string[] = [];
		for (const file of files) {
			const filename = getFileName(file);
			if (!filename.toLowerCase().includes(query)) continue;
			matched.push(file);
			spinner.update({ text: `[${++i}/${files.length}] ${matched.length} files found` });
		}

		if (!matched.length) spinner.error({ text: 'No matching found.' });

		spinner.stop();
		console.log(matched.join('\n'));
	}

	public override registerCommand(command: Command.CommanderCommand): Command.CommanderCommand {
		return command
			.alias('query') //
			.argument('<query>', 'The file name to search for');
	}
}
