import { envParseString } from '@skyra/env-utilities';
import { SongsMover } from '#utils/mover';

export default (filename: string, index: string) => {
	return new SongsMover(envParseString('SRC_DIR'), filename, Number(index)).move();
};
