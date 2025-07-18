import React, { useState } from 'react';
import TensorPreview, { ImagePreview } from './TensorPreview';
import * as tf from '@tensorflow/tfjs';

interface PredictionProps {
	lastPredictedSvgs: string[];
	lastImages: (HTMLCanvasElement | null)[];
	lastTensors: (tf.Tensor | null)[];
	prediction: string[];
}

const Prediction: React.FC<PredictionProps> = ({
	lastPredictedSvgs,
	lastImages,
	lastTensors,
	prediction,
}) => {
	const [showSVGs, setShowSVGs] = useState(true);
	const [showImages, setShowImages] = useState(true);
	const [showTensors, setShowTensors] = useState(true);

	if (!lastPredictedSvgs.length) return null;
	return (
		<div
			style={{
				background: '#f9fafb',
				borderRadius: 12,
				padding: 20,
				boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
				marginBottom: 24,
			}}>
			<h2 style={{ textAlign: 'center', fontWeight: 600, marginBottom: 12 }}>
				Prediction
			</h2>
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					gap: 24,
					marginBottom: 18,
				}}>
				<label style={{ fontSize: 16 }}>
					<input
						type='checkbox'
						checked={showSVGs}
						onChange={(e) => setShowSVGs(e.target.checked)}
						style={{ marginRight: 6 }}
					/>
					Predicted SVGs
				</label>
				<label style={{ fontSize: 16 }}>
					<input
						type='checkbox'
						checked={showImages}
						onChange={(e) => setShowImages(e.target.checked)}
						style={{ marginRight: 6 }}
					/>
					Image Previews
				</label>
				<label style={{ fontSize: 16 }}>
					<input
						type='checkbox'
						checked={showTensors}
						onChange={(e) => setShowTensors(e.target.checked)}
						style={{ marginRight: 6 }}
					/>
					Tensor Previews
				</label>
			</div>
			{showSVGs && (
				<>
					<div
						style={{ fontWeight: 500, marginBottom: 6, textAlign: 'center' }}>
						Predicted SVGs:
					</div>
					<div
						style={{
							display: 'flex',
							gap: '12px',
							marginBottom: '12px',
							justifyContent: 'center',
						}}>
						{lastPredictedSvgs.map((svg, index) => (
							<div
								key={index}
								style={{ textAlign: 'center' }}>
								<div
									dangerouslySetInnerHTML={{ __html: svg }}
									style={{
										width: 64,
										height: 64,
										border: '1px solid #cbd5e1',
										borderRadius: 8,
										background: '#fff',
										boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
										display: 'inline-block',
									}}
								/>
							</div>
						))}
					</div>
				</>
			)}
			{showImages && lastImages.length > 0 && (
				<div>
					<div
						style={{ fontWeight: 500, marginBottom: 6, textAlign: 'center' }}>
						Image Previews:
					</div>
					<div
						style={{
							display: 'flex',
							gap: '12px',
							marginBottom: '12px',
							justifyContent: 'center',
						}}>
						{lastImages.map((image, index) => (
							<div
								key={index}
								style={{ textAlign: 'center' }}>
								<ImagePreview image={image} />
							</div>
						))}
					</div>
				</div>
			)}
			{showTensors && lastTensors.length > 0 && (
				<div>
					<div
						style={{ fontWeight: 500, marginBottom: 6, textAlign: 'center' }}>
						Tensor Previews:
					</div>
					<div
						style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
						{lastTensors.map((tensor, index) => (
							<div
								key={index}
								style={{ textAlign: 'center' }}>
								<TensorPreview tensor={tensor} />
							</div>
						))}
					</div>
				</div>
			)}
			<p
				style={{
					fontSize: 18,
					fontWeight: 500,
					marginTop: 16,
					textAlign: 'center',
				}}>
				Prediction:{' '}
				{prediction.length > 0 ? prediction.join(', ') : 'No prediction yet.'}
			</p>
		</div>
	);
};

export default Prediction;
