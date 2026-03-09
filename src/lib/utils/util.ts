import type { Dirent } from 'node:fs';
import path from 'node:path';

export const fileExts = ['.mp3', '.m4a'] as const;

export function getFileName(file: string) {
	return parseFile(file).filename;
}

export function filterSongs(songs: Dirent<string>[], withoutIndexNumber: boolean = false) {
	const grouped: Record<string, Dirent<string>[]> = {};
	const filtered = songs.filter((x) => x.isFile()).filter((x) => !x.parentPath.split(path.sep).slice(-1)[0].startsWith('_'));

	for (const song of filtered) {
		if (!fileExts.some((ext) => song.name.endsWith(ext))) continue;

		const parts = song.parentPath.split(path.sep);
		const folder = parts.length > 1 ? parts.slice(-1).join(path.sep) : '';

		if (!grouped[folder]) grouped[folder] = [];
		grouped[folder].push(song);
	}

	const result: Record<string, string[]> = {};

	for (const folder of Object.keys(grouped)) {
		const sorted = grouped[folder].sort((a, b) => {
			const [numA, numB] = [parseFile(a.name), parseFile(b.name)].map((file) => file.index);

			if (numA === -1) return 1;
			if (numB === -1) return -1;

			return numA - numB;
		});

		result[folder] = withoutIndexNumber
			? sorted.map((x) => {
					const file = parseFile(x.name);
					return file.filename + file.filetype;
				})
			: sorted.map((x) => x.name);
	}

	const sorted = Object.fromEntries(Object.entries(result).sort((a, b) => a[1].length - b[1].length));

	return sorted;
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
