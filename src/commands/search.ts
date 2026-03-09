import { Command } from '#lib/structures';
import { ApplyOptions } from '#utils/decorators';
import { getFileName } from '#utils/util';
import { Spinner } from '@favware/colorette-spinner';
import { blue, green } from 'colorette';

@ApplyOptions<Command.Options>({
	description: 'Search for files with the matching query.'
})
export class UserCommand extends Command {
	public override async run(query: string, options: { dir?: string }) {
		const spinner = new Spinner(`Searching with the query "${query}"`).start();

		if (!(await this.ensureDirExists(this.srcDir))) {
			console.error(this.makePathNotExistsMessage(this.srcDir));
			process.exit(1);
		}

		const files = await this.getFilesInDirectory(this.srcDir);

		if (!Object.values(files).some((x) => x.length)) {
			spinner.error({ text: 'The directory does not contain any files. Exiting...' });
			process.exit(1);
		}

		if (options.dir) {
			const selectedDir = Reflect.get(files, options.dir);

			if (!selectedDir) {
				console.error(this.makePathNotExistsMessage(options.dir));
				process.exit(1);
			}

			this.doSearch(selectedDir, query, spinner, options.dir);
			return;
		}

		for (const [folderName, files_] of Object.entries(files)) {
			spinner.update({ text: `Searching in ${folderName}...` });
			this.doSearch(files_, query, spinner, folderName);
		}
	}

	public override registerCommand(command: Command.CommanderCommand): Command.CommanderCommand {
		return command
			.alias('query') //
			.argument('<query>', 'The file name to search for')
			.option('--dir <dir>', 'The directory to list files for');
	}

	private doSearch(files: string[], query: string, spinner: Spinner, folderName: string) {
		let i = 0;
		const matched: string[] = [];
		for (const file of files) {
			const filename = getFileName(file);
			if (!filename.toLowerCase().includes(query.toLowerCase())) continue;
			matched.push(`[${blue(folderName)}]: ${green(file)}`);
			spinner.update({ text: `[${folderName}] [${++i}/${files.length}] ${matched.length} files found` });
		}

		if (!matched.length) spinner.error({ text: `[${folderName}] No matching found.` });

		spinner.stop();
		console.log(matched.join('\n'));
	}
}
