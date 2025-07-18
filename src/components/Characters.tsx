import React, { useEffect, useState } from 'react';
import { getAllSamples, deleteSample } from '../utils/storage';
import TensorPreview from './TensorPreview';
import { svgToTensor } from '../utils/preprocess';
import * as tf from '@tensorflow/tfjs';
import { set } from 'idb-keyval';

interface CharactersProps {
	onSampleClick: (svg: string) => void;
	currentChar: string;
	refreshKey?: any;
	onSampleDelete?: () => void;
}

const Characters: React.FC<CharactersProps> = ({
	onSampleClick,
	currentChar,
	refreshKey,
	onSampleDelete,
}) => {
	const [samples, setSamples] = useState<Record<string, string[]>>({});
	const [selected, setSelected] = useState<number[]>([]);
	const [tensors, setTensors] = useState<Record<string, tf.Tensor[]>>({});
	const [showSamples, setShowSamples] = useState(true);

	useEffect(() => {
		const fetchSamples = async () => {
			const all = await getAllSamples();
			setSamples(all);
			setSelected([]);
			// Generate tensors for all samples
			const newTensors: Record<string, tf.Tensor[]> = {};
			for (const [char, svgs] of Object.entries(all)) {
				newTensors[char] = [];
				for (const svg of svgs) {
					try {
						const tensor = await svgToTensor(svg);
						newTensors[char].push(tensor);
					} catch (e) {
						console.error('Error generating tensor for SVG:', e);
						newTensors[char].push(tf.zeros([64, 64, 1]));
					}
				}
			}
			setTensors(newTensors);
		};
		fetchSamples();
	}, [refreshKey]);

	const charSamples = samples[currentChar] || [];
	const charTensors = tensors[currentChar] || [];

	const handleSelect = (idx: number) => {
		setSelected((prev) =>
			prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
		);
	};

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelected(charSamples.map((_, idx) => idx));
		} else {
			setSelected([]);
		}
	};

	const handleDeleteSelected = async () => {
		if (selected.length === 0) return;
		if (
			!window.confirm('Are you sure you want to delete the selected samples?')
		)
			return;
		for (const idx of selected) {
			await deleteSample(currentChar, charSamples[idx]);
		}
		setSelected([]);
		if (onSampleDelete) onSampleDelete();
	};

	return (
		<div
			style={{
				background: '#f9fafb',
				borderRadius: 12,
				padding: 20,
				boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
				marginBottom: 24,
			}}>
			<h2 style={{ textAlign: 'center', fontWeight: 600, marginBottom: 16 }}>
				Samples for {currentChar} ({charSamples.length})
			</h2>
			<div
				style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
				<label style={{ fontSize: 16 }}>
					<input
						type='checkbox'
						checked={showSamples}
						onChange={(e) => setShowSamples(e.target.checked)}
						style={{ marginRight: 6 }}
					/>
					Show Samples
				</label>
				{showSamples && charSamples.length > 0 && (
					<label style={{ fontSize: 16, marginLeft: 24 }}>
						<input
							type='checkbox'
							checked={selected.length === charSamples.length}
							onChange={(e) => handleSelectAll(e.target.checked)}
							style={{ marginRight: 6 }}
						/>
						Select All
					</label>
				)}
			</div>
			{showSamples && (
				<>
					{charSamples.length === 0 && (
						<p style={{ textAlign: 'center' }}>No samples saved.</p>
					)}
					<div
						style={{
							display: 'flex',
							gap: '12px',
							flexWrap: 'wrap',
							justifyContent: 'center',
						}}>
						{charSamples.map((svg, idx) => (
							<div
								key={idx}
								style={{
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									background: selected.includes(idx) ? '#e6f7ff' : '#fff',
									borderRadius: 6,
									boxShadow: selected.includes(idx)
										? '0 0 0 2px #3182ce'
										: '0 1px 2px rgba(0,0,0,0.04)',
									transition: 'box-shadow 0.2s, background 0.2s',
									padding: 6,
									cursor: 'pointer',
								}}
								onClick={() => handleSelect(idx)}
								title={`Sample ${idx + 1}`}>
								<div
									style={{
										border: selected.includes(idx)
											? '2px solid #3182ce'
											: '1px solid #ccc',
										width: 32,
										height: 32,
										borderRadius: 4,
										overflow: 'hidden',
										background: '#fff',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										marginBottom: 2,
									}}
									dangerouslySetInnerHTML={{
										__html: svg
											.replace(/width="\d+"/, 'width="32"')
											.replace(/height="\d+"/, 'height="32"')
											.replace(/viewBox="[^"]+"/, 'viewBox="0 0 64 64"'),
									}}
								/>
								{charTensors[idx] && (
									<div style={{ marginTop: 2 }}>
										<TensorPreview
											tensor={charTensors[idx]}
											width={32}
											height={32}
										/>
									</div>
								)}
							</div>
						))}
					</div>
					{selected.length > 0 && (
						<button
							style={{
								marginTop: 12,
								color: 'white',
								background: '#e53e3e',
								border: 'none',
								borderRadius: 4,
								padding: '6px 16px',
								cursor: 'pointer',
								fontWeight: 500,
								fontSize: 16,
							}}
							onClick={handleDeleteSelected}>
							Delete Selected
						</button>
					)}
				</>
			)}
		</div>
	);
};

export default Characters;
