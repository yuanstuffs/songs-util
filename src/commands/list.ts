import { Command } from '#lib/structures';
import { ApplyOptions } from '#utils/decorators';
import { Spinner } from '@favware/colorette-spinner';
import { cyan, green, white, yellow } from 'colorette';

@ApplyOptions<Command.Options>({
	description: 'List all files in the src directory.'
})
export class UserCommand extends Command {
	public override async run() {
		const targetDir = this.resolvePath(this.srcDir);
		const spinner = new Spinner(`Listing files in ${targetDir}`).start();

		if (!(await this.ensureDirExists(targetDir))) {
			console.error(this.makePathNotExistsMessage(targetDir));
			process.exit(1);
		}

		const srcFiles = await this.getFilesInDirectory(targetDir);

		if (!srcFiles.length) {
			spinner.error({ text: 'The src directory does not have any files. Exiting...' });
			process.exit(1);
		}

		spinner.stop();

		console.log(white(`### Files in ${targetDir}:\n`));

		for (const [index, file] of srcFiles.entries()) {
			const color = index % 2 === 0 ? cyan : green;
			console.log(color(`${index + 1}. ${file}`));
		}

		console.log(yellow(`\nTotal files: ${srcFiles.length}`));
	}

	public override registerCommand(command: Command.CommanderCommand): Command.CommanderCommand {
		return command.alias('ls');
	}
}
