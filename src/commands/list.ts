import { Command } from '#lib/structures';
import { ApplyOptions } from '#utils/decorators';
import { parseFile } from '#utils/util';
import { Spinner } from '@favware/colorette-spinner';
import { blue, cyan, gray, green, white, yellow } from 'colorette';

@ApplyOptions<Command.Options>({
	description: 'List all files in the src directory.'
})
export class UserCommand extends Command {
	public override async run(options: { dir?: string }) {
		const targetDir = this.resolvePath(this.srcDir);
		const spinner = new Spinner(`Listing files in ${targetDir}`).start();

		if (!(await this.ensureDirExists(targetDir))) {
			console.error(this.makePathNotExistsMessage(targetDir));
			process.exit(1);
		}

		const srcFiles = await this.getFilesInDirectory(targetDir);

		if (!Object.values(srcFiles).some((x) => x.length)) {
			spinner.error({ text: 'The src directory does not have any files. Exiting...' });
			process.exit(1);
		}

		spinner.stop();

		if (options.dir) {
			console.log(white(`### Files in ${options.dir}:\n`));

			const selectedDir = Reflect.get(srcFiles, options.dir);

			if (!selectedDir) {
				console.error(this.makePathNotExistsMessage(options.dir));
				process.exit(1);
			}

			for (const [index, file] of selectedDir.entries()) {
				const color = index % 2 === 0 ? cyan : green;
				console.log(color(`${index + 1}. ${parseFile(file).filename}${parseFile(file).filetype}`));
			}

			console.log(yellow(`\nTotal files: ${selectedDir.length}`));
			console.log(gray('-----------------------------------'));
			return;
		}

		console.log(white(`### Files in ${targetDir}:\n`));

		for (const [folderName, files_] of Object.entries(srcFiles)) {
			console.log(blue(`\n[${folderName}]`));
			for (const [index, file] of files_.entries()) {
				const color = index % 2 === 0 ? cyan : green;
				console.log(color(`${index + 1}. ${parseFile(file).filename}${parseFile(file).filetype}`));
			}

			console.log(yellow(`\nTotal files: ${files_.length}`));
			console.log(gray('-----------------------------------'));
		}
	}

	public override registerCommand(command: Command.CommanderCommand): Command.CommanderCommand {
		return command //
			.alias('ls')
			.option('--dir <dir>', 'The sub-directory to list files for');
	}
}
