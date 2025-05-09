import { envIsDefined, envIsNullish, setup } from '@skyra/env-utilities';
import * as colorette from 'colorette';
import process from 'node:process';

colorette.createColors({ useColor: true });

setup(new URL('../../src/.env', import.meta.url));

if (!envIsDefined('SRC_DIR') || envIsNullish('SRC_DIR')) {
	console.error(colorette.red(`${colorette.cyanBright('env[SRC_DIR]')} is not defined. It is required when running this cli.`));
	process.exit(1);
}
