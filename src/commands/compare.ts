import { Command } from '#lib/structures';
import { ApplyOptions } from '#utils/decorators';
import { Spinner } from '@favware/colorette-spinner';
import { blue, gray, green, red, yellow } from 'colorette';

@ApplyOptions<Command.Options>({
	description: [
		'Find files that is missing in src dir and provided dir.', //
		'It will not output the file index number when comparing'
	].join('\n')
})
export class UserCommand extends Command {
	public override async run(targetDir: string, options: { dir?: string }) {
		targetDir = this.resolvePath(targetDir);
		const spinner = new Spinner(`Comparing files between src dir and ${targetDir}`).start();

		if (!(await this.ensureDirExists(this.srcDir))) {
			console.error(this.makePathNotExistsMessage(this.srcDir));
			process.exit(1);
		}

		if (!(await this.ensureDirExists(targetDir))) {
			console.error(this.makePathNotExistsMessage(targetDir));
			process.exit(1);
		}

		const srcFiles = await this.getFilesInDirectory();
		const targetFiles = await this.getFilesInDirectory(targetDir);

		if (!Object.values(srcFiles).some((x) => x.length)) {
			spinner.error({ text: 'The src directory does not have any files. Exiting...' });
			process.exit(1);
		}

		if (!Object.values(targetFiles).some((x) => x.length)) {
			spinner.error({ text: 'The provided directory does not have any files. Exiting...' });
			process.exit(1);
		}

		spinner.stop();
		spinner.clear();

		if (options.dir) {
			this.doStuff(srcFiles[options.dir], targetFiles[options.dir], options.dir);
			return;
		}

		for (const [folderName, files] of Object.entries(srcFiles)) {
			this.doStuff(files, targetFiles[folderName] ?? [], folderName);
		}
	}

	public override registerCommand(command: Command.CommanderCommand): Command.CommanderCommand {
		return command //
			.alias('diff')
			.argument('<target_dir>', 'The directory to compare')
			.option('--dir <dir>', 'The sub-directory to compare files');
	}

	private compare(arr1: string[], arr2: string[]) {
		const filteredArray1 = arr1.filter((x) => !arr2.includes(x));
		const filteredArray2 = arr2.filter((x) => !arr1.includes(x));

		return { filteredArray1, filteredArray2 };
	}

	private formatOutput(title: string, added: string[], removed: string[]) {
		console.log(gray(title));
		added.map((file) => console.log(gray('+ ') + green(file)));
		removed.map((file) => console.log(gray('- ') + red(file)));
	}

	private doStuff(files: string[], targetFiles: string[], folderName: string) {
		console.log(blue(`\n[${folderName}]`));

		const output = this.compare(files, targetFiles);
		const totalDifferent = output.filteredArray1.length + output.filteredArray2.length;
		this.formatOutput('### src directory', output.filteredArray1, output.filteredArray2);
		this.formatOutput('### target directory', output.filteredArray2, output.filteredArray1);
		console.log(yellow(`There is a total of ${totalDifferent} files missing between src and provided directory.`));
		console.log(gray('----------------------------------'));
	}
}
