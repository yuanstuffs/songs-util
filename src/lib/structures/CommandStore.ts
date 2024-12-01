import { Command } from '#lib/structures';
import { rootCommand } from '#utils/rootCommand';
import { Store } from '@sapphire/pieces';

export class CommandStore extends Store<Command, 'commands'> {
	public constructor() {
		super(Command, { name: 'commands' });
	}

	public override async loadAll(): Promise<void> {
		await super.loadAll();

		for (const command of this.values()) {
			const data = command.registerCommand(command.commanderData);
			const run = command.run.bind(command) as CommandAction;
			data.copyInheritedSettings(rootCommand);
			data.action(run);

			rootCommand.addCommand(data);
		}
	}
}

type CommandAction = (...args: any[]) => Promise<void> | void;
