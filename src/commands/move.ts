import { SongsMover } from '#utils/mover';
import { envParseString } from '@skyra/env-utilities';

export default (filename: string, index: string) => {
	return new SongsMover(envParseString('SRC_DIR'), filename, Number(index)).move();
};
