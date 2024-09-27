#!/usr/bin/env node
import '#lib/setup';
import { CommandStore } from '#lib/structures';
import { container, getRootData } from '@sapphire/pieces';
import { createColors } from 'colorette';
import { rootCommand } from '#utils/rootCommand';

createColors({ useColor: true });

container.stores.register(new CommandStore());
container.stores.registerPath(getRootData().root);

await container.stores.load();

rootCommand.parse(process.argv);
