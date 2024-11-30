#!/usr/bin/env -S node --enable-source-maps
import '#lib/setup';
import { CommandStore } from '#lib/structures';
import { rootCommand } from '#utils/rootCommand';
import { container, getRootData } from '@sapphire/pieces';
import { createColors } from 'colorette';

createColors({ useColor: true });

let rootData = getRootData().root;
if (!rootData.endsWith('dist')) rootData = process.argv[1].replace('/cli.js', '');

container.stores.register(new CommandStore());
container.stores.registerPath(rootData);

await container.stores.load();

rootCommand.parse(process.argv);
