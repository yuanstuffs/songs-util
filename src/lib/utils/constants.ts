import { readFile } from 'node:fs/promises';
import { URL } from 'node:url';

const packageFile = new URL('../../../package.json', import.meta.url);
export const packageJson = JSON.parse(await readFile(packageFile, 'utf-8'));
