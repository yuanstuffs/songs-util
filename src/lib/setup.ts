import { setup } from '@skyra/env-utilities';
import * as colorette from 'colorette';

colorette.createColors({ useColor: true });

setup(new URL('../../src/.env', import.meta.url));
