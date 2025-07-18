import React, { useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';

interface TensorPreviewProps {
	tensor: tf.Tensor | null;
	width?: number;
	height?: number;
}

const TensorPreview: React.FC<TensorPreviewProps> = ({
	tensor,
	width = 64,
	height = 64,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (!tensor || !canvasRef.current) return;
		const [tHeight, tWidth] = tensor.shape;
		const ctx = canvasRef.current.getContext('2d');
		if (!ctx) return;

		tensor.data().then((data) => {
			const imageData = ctx.createImageData(tWidth, tHeight);
			for (let i = 0; i < tWidth * tHeight; i++) {
				const v = Math.floor((data[i] as number) * 255);
				imageData.data[i * 4 + 0] = v;
				imageData.data[i * 4 + 1] = v;
				imageData.data[i * 4 + 2] = v;
				imageData.data[i * 4 + 3] = 255;
			}
			ctx.putImageData(imageData, 0, 0);
			// Scale to fit preview size
			if (width !== tWidth || height !== tHeight) {
				const temp = document.createElement('canvas');
				temp.width = tWidth;
				temp.height = tHeight;
				temp.getContext('2d')?.putImageData(imageData, 0, 0);
				ctx.clearRect(0, 0, width, height);
				ctx.drawImage(temp, 0, 0, width, height);
			}
		});
	}, [tensor, width, height]);

	return (
		<canvas
			ref={canvasRef}
			width={width}
			height={height}
			style={{ border: '1px solid #ccc', background: '#fff', width, height }}
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
