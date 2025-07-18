// ==========================
// 6. Utility: training.ts
// ==========================
import * as tf from '@tensorflow/tfjs';
import { getAllSamples } from './storage';
import { svgToTensor } from './preprocess';

export const trainModel = async () => {
	const data = await getAllSamples();
	const labels = Object.keys(data);
	const xs: tf.Tensor[] = [];
	const ys: number[] = [];

	for (let i = 0; i < labels.length; i++) {
		for (const svg of data[labels[i]]) {
			xs.push(await svgToTensor(svg));
			ys.push(i);
		}
	}

	const xTensor = tf.stack(xs);
	const yTensor = tf.tensor1d(ys, 'int32');
	const yOneHot = tf.oneHot(yTensor, labels.length);

	const model = tf.sequential();
	model.add(
		tf.layers.conv2d({
			inputShape: [64, 64, 1],
			filters: 16,
			kernelSize: 3,
			activation: 'relu',
		})
	);
	model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
	model.add(tf.layers.flatten());
	model.add(tf.layers.dense({ units: 128, activation: 'relu' }));
	model.add(tf.layers.dense({ units: labels.length, activation: 'softmax' }));

	model.compile({
		optimizer: 'adam',
		loss: 'categoricalCrossentropy',
		metrics: ['accuracy'],
	});

	await model.fit(xTensor, yOneHot, { epochs: 10 });
	await model.save('indexeddb://handwriting-model');
};
