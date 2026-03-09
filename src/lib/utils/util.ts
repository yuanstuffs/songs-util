// export const fileExt = '.mp3' as const;
export const fileExts = ['.mp3', '.m4a'] as const;

export function getFileName(file: string) {
	return parseFile(file).filename;
}

export function filterSongs(songs: string[], withoutIndexNumber: boolean = false) {
	const out = songs //
		.filter((x) => fileExts.some((ext) => x.endsWith(ext)))
		.sort((a, b) => {
			const [numA, numB] = [parseFile(a), parseFile(b)].map((file) => file.index);

			if (numA === -1) return 1;
			if (numB === -1) return -1;

			return numA - numB;
		});

	if (withoutIndexNumber) return out.map((x) => parseFile(x).filename + parseFile(x).filetype);

	return out;
}

export function parseFile(filename: string): IParseFileOutput {
	const indexMatch = filename.match(/^(\d+)\.\s/);
	const index = indexMatch ? Number(indexMatch[1]) : -1;

	const filetype = fileExts.find((ext) => filename.endsWith(ext))!;
	const name = filename.slice(0, -filetype.length).replace(/^\d+\.\s/, '');

	return {
		index,
		filename: name,
		filetype
	};
}

interface IParseFileOutput {
	index: number;
	filename: string;
	filetype: (typeof fileExts)[number];
}
