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
		<div
			style={{
				background: '#f9fafb',
				borderRadius: 12,
				padding: 20,
				boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
				margin: '0 auto',
				maxWidth: 400,
				textAlign: 'center',
			}}>
			<h3 style={{ marginBottom: 18, fontWeight: 600, textAlign: 'center' }}>
				Data Export / Import
			</h3>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: 14,
					alignItems: 'center',
				}}>
				<button
					onClick={handleExport}
					style={{
						padding: '8px 20px',
						borderRadius: 6,
						background: '#3182ce',
						color: '#fff',
						border: 'none',
						fontWeight: 500,
						fontSize: 16,
						cursor: 'pointer',
					}}>
					Export Data
				</button>
				<label
					style={{
						display: 'inline-block',
						padding: '8px 20px',
						borderRadius: 6,
						background: '#805ad5',
						color: '#fff',
						fontWeight: 500,
						fontSize: 16,
						cursor: 'pointer',
					}}>
					Import Data
					<input
						type='file'
						accept='application/json'
						onChange={handleImport}
						style={{ display: 'none' }}
					/>
				</label>
				<button
					onClick={handleClear}
					style={{
						padding: '8px 20px',
						borderRadius: 6,
						background: '#e53e3e',
						color: '#fff',
						border: 'none',
						fontWeight: 500,
						fontSize: 16,
						cursor: 'pointer',
					}}>
					Clear All Data
				</button>
			</div>
		</div>
	);
};

export default DataExportImport;
