import React from 'react';
import { exportData, importData, clearData } from '../utils/storage';

const DataExportImport: React.FC = () => {
	const handleExport = async () => {
		const json = await exportData();
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'handwriting_data.json';
		a.click();
	};

	const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const text = await file.text();
		await importData(text);
		alert('Import complete');
	};

	const handleClear = async () => {
		await clearData();
		alert('All data cleared');
	};

	return (
		<div>
			<button onClick={handleExport}>Export Data</button>
			<input
				type='file'
				accept='application/json'
				onChange={handleImport}
			/>
			<button onClick={handleClear}>Clear All Data</button>
		</div>
	);
};

export default DataExportImport;
