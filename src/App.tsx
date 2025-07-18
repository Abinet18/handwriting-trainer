import React, { useState, useRef, useEffect } from 'react';
import DrawingCanvas from './components/DrawingCanvas';
import DataExportImport from './components/DataExportImport';
import Characters from './components/Characters';
import { saveSample } from './utils/storage';
import { trainModel } from './utils/training';
import { predict } from './utils/predict';
import { segmentStrokes, pathsToSvg } from './utils/preprocess';
import { ReactSketchCanvasRef } from 'react-sketch-canvas';
import { getAllSamples } from './utils/storage';
import TensorPreview, { ImagePreview } from './components/TensorPreview';
import * as tf from '@tensorflow/tfjs';
import { svgToTensor, svgToImage } from './utils/preprocess';

const App: React.FC = () => {
	const [char, setChar] = useState('ሀ');
	const [prediction, setPrediction] = useState<string[]>([]);
	const [importedSvg, setImportedSvg] = useState<string | null>(null);
	const [samplesVersion, setSamplesVersion] = useState(0);
	const [canTrain, setCanTrain] = useState(false);
	const [isRecognizing, setIsRecognizing] = useState(false);
	const [lastPredictedSvgs, setLastPredictedSvgs] = useState<string[]>([]);
	const [lastTensors, setLastTensors] = useState<tf.Tensor[]>([]);
	const [lastImages, setLastImages] = useState<HTMLCanvasElement[]>([]);
	const canvasRef = useRef<ReactSketchCanvasRef>(null);

	useEffect(() => {
		const checkCanTrain = async () => {
			const all = await getAllSamples();
			const eligible = Object.values(all).filter(
				(arr) => Array.isArray(arr) && arr.length >= 50
			).length;
			console.log('DEBUG getAllSamples:', all);
			console.log('DEBUG eligible count:', eligible);
			setCanTrain(eligible >= 2);
		};
		checkCanTrain();
	}, [samplesVersion]);

	useEffect(() => {
		let cancelled = false;
		const genImages = async () => {
			if (lastPredictedSvgs.length > 0) {
				const images = await Promise.all(
					lastPredictedSvgs.map((svg) => svgToImage(svg))
				);
				if (!cancelled) setLastImages(images);
			} else {
				setLastImages([]);
			}
		};
		genImages();
		return () => {
			cancelled = true;
		};
	}, [lastPredictedSvgs]);

	useEffect(() => {
		if (lastTensors.length > 0) {
			console.log('Tensor shape:', lastTensors[0].shape);
			lastTensors[0]
				.data()
				.then((d) =>
					console.log('Tensor data (first 64):', Array.from(d).slice(0, 64))
				);
		}
	}, [lastTensors]);

	const handleSave = async () => {
		if (!canvasRef.current) return;
		const paths = await canvasRef.current.exportPaths();
		const charGroups = segmentStrokes(paths);
		const svgs = charGroups.map((group) => pathsToSvg(group));
		await saveSample(char, svgs);
		setSamplesVersion((v) => v + 1);
	};

	const handleTrain = async () => {
		await trainModel();
		alert('Training complete!');
	};

	const handlePredict = async (svg: string) => {
		const result = await predict(svg, ['ሀ', 'ለ', 'ሐ']);
		return result;
	};

	const handleRecognize = async () => {
		if (!canvasRef.current) return;
		setIsRecognizing(true);
		const paths = await canvasRef.current.exportPaths();
		const charGroups = segmentStrokes(paths);
		if (charGroups.length === 0) {
			setIsRecognizing(false);
			return;
		}
		const svgs = charGroups.map((group) => pathsToSvg(group));
		setLastPredictedSvgs(svgs);
		const tensors = await Promise.all(svgs.map((svg) => svgToTensor(svg)));
		setLastTensors(tensors);
		const predictions = await Promise.all(
			svgs.map((svg) => handlePredict(svg))
		);
		setPrediction(predictions);
		setIsRecognizing(false);
	};

	const handleSampleClick = (svg: string) => {
		setImportedSvg(svg);
	};

	return (
		<div>
			<h1>Handwriting Trainer</h1>
			<select
				value={char}
				onChange={(e) => setChar(e.target.value)}>
				<option>ሀ</option>
				<option>ለ</option>
				<option>ሐ</option>
			</select>
			<DrawingCanvas
				onSave={handleSave}
				svgToLoad={importedSvg}
				ref={canvasRef}
			/>

			<Characters
				onSampleClick={handleSampleClick}
				currentChar={char}
				refreshKey={samplesVersion}
				onSampleDelete={() => setSamplesVersion((v) => v + 1)}
			/>
			<button
				onClick={handleRecognize}
				disabled={isRecognizing}
				style={{ marginTop: 8, marginBottom: 8 }}>
				{isRecognizing ? 'Recognizing...' : 'Recognize'}
			</button>
			{lastPredictedSvgs.length > 0 && (
				<div style={{ margin: '12px 0' }}>
					<div>Predicted SVGs:</div>
					<div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
						{lastPredictedSvgs.map((svg, index) => (
							<div
								key={index}
								style={{ textAlign: 'center' }}>
								<div
									dangerouslySetInnerHTML={{ __html: svg }}
									style={{
										width: 64,
										height: 64,
										border: '1px solid #ccc',
										display: 'inline-block',
										background: '#fff',
									}}
								/>
							</div>
						))}
					</div>
					{lastImages.length > 0 && (
						<div>
							<div>Image Previews:</div>
							<div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
								{lastImages.map((image, index) => (
									<div
										key={index}
										style={{ textAlign: 'center' }}>
										<div style={{ fontSize: '12px', marginBottom: '4px' }}>
											Char {index + 1}
										</div>
										<ImagePreview image={image} />
									</div>
								))}
							</div>
						</div>
					)}
					{lastTensors.length > 0 && (
						<div>
							<div>Tensor Previews:</div>
							<div style={{ display: 'flex', gap: '8px' }}>
								{lastTensors.map((tensor, index) => (
									<div
										key={index}
										style={{ textAlign: 'center' }}>
										<div style={{ fontSize: '12px', marginBottom: '4px' }}>
											Char {index + 1}
										</div>
										<TensorPreview tensor={tensor} />
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			)}

			<p>
				Prediction:{' '}
				{prediction.length > 0 ? prediction.join(', ') : 'No prediction yet.'}
			</p>
			<DataExportImport />
			{canTrain && <button onClick={handleTrain}>Train Model</button>}
		</div>
	);
};

export default App;
