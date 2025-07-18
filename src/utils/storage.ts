import { set, get, keys, del } from 'idb-keyval';

export const saveSample = async (label: string, svgs: string[]) => {
	const existing = (await get(label)) || [];
	await set(label, existing.concat(svgs));
};

export const getAllSamples = async (): Promise<Record<string, string[]>> => {
	const all: Record<string, string[]> = {};
	const allKeys = await keys();
	for (const key of allKeys) {
		const data = await get(key as string);
		if (data) all[key as string] = data;
	}
	return all;
};

export const deleteSample = async (label: string, svg: string) => {
	const existing = (await get(label)) || [];
	const updated = existing.filter((s: string) => s !== svg);
	await set(label, updated);
};

export const exportData = async (): Promise<string> => {
	const allData = await getAllSamples();
	return JSON.stringify(allData);
};

export const importData = async (json: string): Promise<void> => {
	const parsed: Record<string, string[]> = JSON.parse(json);
	for (const [key, value] of Object.entries(parsed)) {
		await set(key, value);
	}
};

export const clearData = async (): Promise<void> => {
	const allKeys = await keys();
	for (const key of allKeys) {
		await del(key);
	}
};
