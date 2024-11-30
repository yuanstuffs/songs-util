#!/usr/bin/env node
import { Result } from '@sapphire/result';
import { access, chmod, constants } from 'node:fs/promises';

if (process.platform !== 'linux') process.exit(0);

const cli = new URL('../dist/cli.js', import.meta.url);
const fileExists = await Result.fromAsync(() => access(cli, constants.F_OK));

if (fileExists.isErr()) process.exit(0);

await chmod(cli, 0o775); // Make cli file executable

process.exit(0);
