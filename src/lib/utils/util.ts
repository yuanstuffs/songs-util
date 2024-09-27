export const fileExt = '.mp3' as const;

export function getFileName(file: string) {
	return parseFile(file).filename;
}

export function filterSongs(songs: string[]) {
	return songs //
		.filter((x) => x.endsWith(fileExt))
		.sort((a, b) => {
			const numA = parseFile(a).index;
			const numB = parseFile(b).index;

			if (numA === -1) return 1;
			if (numB === -1) return -1;

			return numA - numB;
		});
}

export function resolvePath(path: string) {
	if (process.platform === 'win32') {
		return path.length > 1 ? path : `${path}:\\`;
	}

	return path;
}

export function parseFile(filename: string): IParseFileOutput {
	const splited = filename.split('.');
	if (splited.length === 2)
		return {
			index: -1,
			filename: splited[0].trim(),
			filetype: fileExt
		};

	return {
		index: Number(splited[0]),
		filename: splited[1].trim(),
		filetype: fileExt
	};
}

export function resolvedDestinationName(destination: string) {
	return destination.split(':\\')[0];
}

interface IParseFileOutput {
	index: number;
	filename: string;
	filetype: '.mp3';
}
