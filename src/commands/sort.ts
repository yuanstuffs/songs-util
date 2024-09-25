import { SortFiles } from '#utils/sortFiles';

export default (destination: string) => {
	return new SortFiles(destination).sort();
};
