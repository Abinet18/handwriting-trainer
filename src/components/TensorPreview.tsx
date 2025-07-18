import React, { useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';

interface TensorPreviewProps {
	tensor: tf.Tensor | null;
}

const TensorPreview: React.FC<TensorPreviewProps> = ({ tensor }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (!tensor || !canvasRef.current) return;
		const [height, width] = tensor.shape;
		const ctx = canvasRef.current.getContext('2d');
		if (!ctx) return;

		tensor.data().then((data) => {
			const imageData = ctx.createImageData(width, height);
			for (let i = 0; i < width * height; i++) {
				const v = Math.floor((data[i] as number) * 255);
				imageData.data[i * 4 + 0] = v;
				imageData.data[i * 4 + 1] = v;
				imageData.data[i * 4 + 2] = v;
				imageData.data[i * 4 + 3] = 255;
			}
			ctx.putImageData(imageData, 0, 0);
		});
	}, [tensor]);

	return (
		<canvas
			ref={canvasRef}
			width={64}
			height={64}
			style={{ border: '1px solid #ccc', background: '#fff' }}
		/>
	);
};

interface ImagePreviewProps {
	image: HTMLCanvasElement | HTMLImageElement | null;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ image }) => {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!ref.current) return;
		ref.current.innerHTML = '';
		if (image) {
			ref.current.appendChild(image);
		}
		// Clean up appended image on unmount
		return () => {
			if (ref.current && image && ref.current.contains(image)) {
				ref.current.removeChild(image);
			}
		};
	}, [image]);

	return (
		<div
			ref={ref}
			style={{
				width: 64,
				height: 64,
				border: '1px solid #ccc',
				background: '#fff',
			}}
		/>
	);
};

export default TensorPreview;
