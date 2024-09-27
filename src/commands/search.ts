import { envParseString } from '@skyra/env-utilities';
import { FileSearcher } from '#utils/fileSearcher';

export default (query: string) => {
	return new FileSearcher(envParseString('SRC_DIR'), query).search();
};
