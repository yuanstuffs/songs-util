import { Piece } from '@sapphire/pieces';
import { Result } from '@sapphire/result';
import type { Awaitable } from '@sapphire/utilities';
import { envParseString } from '@skyra/env-utilities';
import * as colorette from 'colorette';
import { Command as CommanderCommand } from 'commander';
import { access, constants } from 'node:fs/promises';

export abstract class Command<Options extends Command.Options = Command.Options> extends Piece<Options, 'commands'> {
	public readonly commanderData: Command.CommanderCommand;

	public constructor(context: Piece.LoaderContext, options: Command.Options) {
		const name = (options.name ?? context.name).toLowerCase();
		super(context, { name, ...options });

		this.commanderData = new CommanderCommand() //
			.command(name)
			.description(options.description);
	}

	public abstract run(...args: string[]): Awaitable<void>;

	public abstract registerCommand(command: Command.CommanderCommand): Command.CommanderCommand;

	public resolvePath(path: string) {
		if (process.platform === 'win32') {
			return path.length > 1 ? path : `${path.toUpperCase()}:\\`;
		}

		return path;
	}

	public get srcDir(): string {
		return envParseString('SRC_DIR');
	}

	public async ensureDirExists(path: string): Promise<boolean> {
		const result = await Result.fromAsync(() => access(path, constants.F_OK));

		return result.match({
			err: () => false,
			ok: () => true
		});
	}

	public makePathNotExistsMessage(path: string): string {
		return `${colorette.cyan(path)} ${colorette.red('could not be found.')}`;
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
