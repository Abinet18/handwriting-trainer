import * as tf from '@tensorflow/tfjs';
import { svgToTensor } from './preprocess';

export const predict = async (svg: string, labels: string[]) => {
	try {
		const model = await tf.loadLayersModel('indexeddb://handwriting-model');
		const input = tf.expandDims(await svgToTensor(svg), 0);
		const result = model.predict(input) as tf.Tensor;
		const probs = (await result.array()) as number[][];
		const topIdx = probs[0].indexOf(Math.max(...probs[0]));
		return labels[topIdx];
	} catch (e) {
		console.error('Prediction error:', e);
		return 'Model not trained';
	}
};
