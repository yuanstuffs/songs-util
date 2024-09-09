export const fileExt = '.mp3' as const;

export function getFileName(file: string) {
	return file.split('.')[1].trim();
}

export function filterSongs(songs: string[]) {
	return songs //
		.filter((x) => x.endsWith(fileExt))
		.sort((a, b) => {
			const numA = Number(a.split('.')[0]);
			const numB = Number(b.split('.')[0]);
			return Number.isNaN(numA) ? -1 : isNaN(numB) ? 1 : numA - numB;
		});
}

export function constructFileURL<T extends string>(s: T) {
	return new URL(`file://${s}`);
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
			filetype: '.mp3'
		};

	return {
		index: Number(splited[0]),
		filename: splited[1].trim(),
		filetype: '.mp3'
	};
}

interface IParseFileOutput {
	index: number;
	filename: string;
	filetype: '.mp3';
}
