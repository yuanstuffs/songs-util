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
			data.copyInheritedSettings(rootCommand);
			data.action(command.run.bind(command));

			rootCommand.addCommand(data);
		}
	}
}
