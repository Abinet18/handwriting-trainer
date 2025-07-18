import { Canvg } from 'canvg';
import * as tf from '@tensorflow/tfjs';

function scaleSvg(svg: string, size: number = 64): string {
	let out = svg.replace(/width="[^"]*"/, `width="${size}"`);
	out = out.replace(/height="[^"]*"/, `height="${size}"`);
	out = out.replace(/viewBox="[^"]*"/, `viewBox="0 0 ${size} ${size}"`);
	return out;
}

export const svgToImage = async (svg: string): Promise<HTMLCanvasElement> => {
	const scaledSvg = scaleSvg(svg, 64);
	const canvas = document.createElement('canvas');
	canvas.width = 64;
	canvas.height = 64;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Canvas context not available');
	const v = await Canvg.fromString(ctx, scaledSvg);
	await v.render();
	return canvas;
};

export const imageToTensor = async (
	image: HTMLCanvasElement | HTMLImageElement
): Promise<tf.Tensor> => {
	const canvas = document.createElement('canvas');
	canvas.width = 64;
	canvas.height = 64;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Canvas context not available');
	if (image instanceof HTMLImageElement) {
		ctx.drawImage(image, 0, 0, 64, 64);
	} else {
		ctx.drawImage(image, 0, 0);
	}
	const imageData = ctx.getImageData(0, 0, 64, 64);
	const { data } = imageData;
	const gray: number[] = [];
	for (let i = 0; i < data.length; i += 4) {
		const alpha = data[i + 3];
		if (alpha === 0) {
			gray.push(0); // transparent = white (0 after inversion)
		} else {
			const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
			gray.push(1 - avg / 255);
		}
	}
	return tf.tensor(gray, [64, 64, 1]);
};

export const svgToTensor = async (svg: string): Promise<tf.Tensor> => {
	const canvas = await svgToImage(svg);
	return imageToTensor(canvas);
};

// Path type from react-sketch-canvas
export interface CanvasPath {
	paths: { x: number; y: number }[];
	strokeWidth: number;
	strokeColor: string;
	drawMode: boolean;
	startTimestamp?: number;
	endTimestamp?: number;
}

// Group strokes that are close/touching (simple bounding box clustering)
export function segmentStrokes(
	paths: CanvasPath[],
	threshold = 20
): CanvasPath[][] {
	if (!paths.length) return [];
	// Compute bounding boxes for each path
	const boxes = paths.map((path) => {
		const xs = path.paths.map((p) => p.x);
		const ys = path.paths.map((p) => p.y);
		return {
			minX: Math.min(...xs),
			maxX: Math.max(...xs),
			minY: Math.min(...ys),
			maxY: Math.max(...ys),
		};
	});
	// Simple clustering: group paths whose boxes overlap or are within threshold
	const groups: CanvasPath[][] = [];
	const used = new Array(paths.length).fill(false);
	for (let i = 0; i < paths.length; i++) {
		if (used[i]) continue;
		used[i] = true;
		const group = [paths[i]];
		let changed = true;
		while (changed) {
			changed = false;
			for (let j = 0; j < paths.length; j++) {
				if (used[j]) continue;
				// If any path in group is close to j, add j
				if (
					group.some((g, gi) =>
						boxesOverlap(boxes[paths.indexOf(g)], boxes[j], threshold)
					)
				) {
					group.push(paths[j]);
					used[j] = true;
					changed = true;
				}
			}
		}
		groups.push(group);
	}
	return groups;
}

function boxesOverlap(
	a: { minX: number; maxX: number; minY: number; maxY: number },
	b: { minX: number; maxX: number; minY: number; maxY: number },
	threshold: number
) {
	return (
		a.maxX + threshold >= b.minX &&
		a.minX - threshold <= b.maxX &&
		a.maxY + threshold >= b.minY &&
		a.minY - threshold <= b.maxY
	);
}

// Convert a group of CanvasPaths to SVG string, normalized and centered in a 64x64 box with padding
export function pathsToSvg(
	paths: CanvasPath[],
	boxSize = 64,
	padding = 4
): string {
	if (!paths.length) return '';
	// Flatten all points
	const allPoints = paths.flatMap((path) => path.paths);
	const xs = allPoints.map((p) => p.x);
	const ys = allPoints.map((p) => p.y);
	const minX = Math.min(...xs);
	const maxX = Math.max(...xs);
	const minY = Math.min(...ys);
	const maxY = Math.max(...ys);
	const width = maxX - minX || 1;
	const height = maxY - minY || 1;
	// Scale to fit boxSize with padding
	const scale = Math.min(
		(boxSize - 2 * padding) / width,
		(boxSize - 2 * padding) / height
	);
	// Center in box with padding
	const xOffset = (boxSize - width * scale) / 2;
	const yOffset = (boxSize - height * scale) / 2;
	// Transform and build SVG paths
	const pathEls = paths
		.map((path) => {
			if (!path.paths.length) return '';
			const d = path.paths
				.map((p, i) => {
					const x = (p.x - minX) * scale + xOffset;
					const y = (p.y - minY) * scale + yOffset;
					return `${i === 0 ? 'M' : 'L'}${x},${y}`;
				})
				.join(' ');
			return `<path d="${d}" stroke="${
				path.strokeColor
			}" stroke-width="${Math.max(
				1,
				path.strokeWidth * scale
			)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
		})
		.join('');
	return `<svg width="${boxSize}" height="${boxSize}" viewBox="0 0 ${boxSize} ${boxSize}" xmlns="http://www.w3.org/2000/svg">${pathEls}</svg>`;
}
