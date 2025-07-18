import React, { useEffect, useState } from 'react';
import { getAllSamples, deleteSample } from '../utils/storage';
import TensorPreview from './TensorPreview';
import { svgToTensor } from '../utils/preprocess';
import * as tf from '@tensorflow/tfjs';

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
	const [selected, setSelected] = useState<number | null>(null);
	const [tensors, setTensors] = useState<Record<string, tf.Tensor[]>>({});

	useEffect(() => {
		const fetchSamples = async () => {
			const all = await getAllSamples();
			setSamples(all);
			setSelected(null);
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
		setSelected(selected === idx ? null : idx);
	};

	const handleDelete = async () => {
		if (selected === null) return;
		const svg = charSamples[selected];
		await deleteSample(currentChar, svg);
		setSelected(null);
		if (onSampleDelete) onSampleDelete();
	};

	return (
		<div>
			<h2>
				Samples for {currentChar} ({charSamples.length})
			</h2>
			{charSamples.length === 0 && <p>No samples saved.</p>}
			<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
				{charSamples.map((svg, idx) => (
					<div
						key={idx}
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
						}}>
						<div
							style={{
								border: selected === idx ? '2px solid red' : '1px solid #ccc',
								cursor: 'pointer',
								width: 64,
								height: 64,
								overflow: 'hidden',
								background: '#fff',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
							onClick={() => handleSelect(idx)}
							title={`Sample ${idx + 1}`}
							dangerouslySetInnerHTML={{ __html: svg }}
						/>
						{charTensors[idx] && (
							<div style={{ marginTop: 4 }}>
								<TensorPreview tensor={charTensors[idx]} />
							</div>
						)}
					</div>
				))}
			</div>
			{selected !== null && (
				<button
					style={{
						marginTop: 8,
						color: 'white',
						background: 'red',
						border: 'none',
						borderRadius: 4,
						padding: '4px 12px',
						cursor: 'pointer',
					}}
					onClick={handleDelete}>
					Delete Selected
				</button>
			)}
		</div>
	);
};

export default Characters;
