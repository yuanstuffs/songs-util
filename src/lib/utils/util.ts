export const fileExt = '.mp3' as const;

export function getFileName(file: string) {
	return parseFile(file).filename;
}

export function filterSongs(songs: string[], withoutIndexNumber: boolean = false) {
	const out = songs //
		.filter((x) => x.endsWith(fileExt))
		.sort((a, b) => {
			const numA = parseFile(a).index;
			const numB = parseFile(b).index;

			if (numA === -1) return 1;
			if (numB === -1) return -1;

			return numA - numB;
		});

	if (withoutIndexNumber) return out.map((x) => parseFile(x).filename + fileExt);

	return out;
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
