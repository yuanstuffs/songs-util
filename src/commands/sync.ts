import { envParseString } from '@skyra/env-utilities';
import { SongsSyncer } from '#utils/syncer';

export default (destination: string) => {
	return new SongsSyncer(envParseString('SRC_DIR'), destination).execute();
};
