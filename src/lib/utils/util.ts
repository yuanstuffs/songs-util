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
	const name = filename
		.split('. ')
		.find((x) => x.endsWith('.mp3'))!
		.replaceAll('.mp3', ''); // There is some cases that may have '.mp3.mp3'
	const index = filename.match(/^(\d+)\.\s/);
	if (!index)
		return {
			index: -1,
			filename: name,
			filetype: fileExt
		};

	return {
		index: Number(index[1]),
		filename: name,
		filetype: fileExt
	};
}

interface IParseFileOutput {
	index: number;
	filename: string;
	filetype: '.mp3';
}
