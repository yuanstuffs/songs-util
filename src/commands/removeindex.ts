import { FileIndexRemover } from '#utils/fileIndexRemover';

export default (destination: string) => {
	return new FileIndexRemover(destination).remove();
};
