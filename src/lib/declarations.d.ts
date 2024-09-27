import type { CommandStore } from '#lib/structures';

declare module '@skyra/env-utilities' {
	export interface Env {
		SRC_DIR: string;
	}
}

declare module '@sapphire/pieces' {
	interface StoreRegistryEntries {
		commands: CommandStore;
	}
}
