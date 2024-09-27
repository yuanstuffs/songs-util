import { Piece } from '@sapphire/pieces';
import { envParseString } from '@skyra/env-utilities';
import { Command as CommanderCommand } from 'commander';

export abstract class Command<Options extends Command.Options = Command.Options> extends Piece<Options, 'commands'> {
	public readonly description: string;
	public readonly commanderData: Command.CommanderCommand;

	public constructor(context: Piece.LoaderContext, options: Command.Options) {
		const name = (options.name ?? context.name).toLowerCase();
		super(context, { name, ...options });

		this.description = options.description;
		this.commanderData = new CommanderCommand() //
			.command(name)
			.description(this.description);
	}

	public abstract run(...args: string[]): Promise<void> | void;

	public abstract registerCommand(command: Command.CommanderCommand): Command.CommanderCommand;

	public get srcDir() {
		return envParseString('SRC_DIR');
	}
}

export namespace Command {
	export type Options = CommandOptions;
	export type LoaderContext = Piece.LoaderContext<'commands'>;
	export type CommanderCommand = import('commander').Command;
}

interface CommandOptions extends Piece.Options {
	description: string;
}
