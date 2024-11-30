#!/usr/bin/env -S node --enable-source-maps
import '#lib/setup';
import { CommandStore } from '#lib/structures';
import { rootCommand } from '#utils/rootCommand';
import { container, getRootData } from '@sapphire/pieces';
import { createColors } from 'colorette';

createColors({ useColor: true });

container.stores.register(new CommandStore());
container.stores.registerPath(getRootData().root);

await container.stores.load();

rootCommand.parse(process.argv);
