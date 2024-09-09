import { SongsSyncer } from '#utils/syncer';
import { envParseString } from '@skyra/env-utilities';

export default (destination: string) => {
	return new SongsSyncer(envParseString('SRC_DIR'), destination).execute();
};
