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
import Prediction from './components/Prediction';

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
	const [stats, setStats] = useState({ uniqueChars: 0, totalSamples: 0 });
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
		const fetchStats = async () => {
			const all = await getAllSamples();
			const uniqueChars = Object.keys(all).length;
			const totalSamples = Object.values(all).reduce(
				(sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
				0
			);
			setStats({ uniqueChars, totalSamples });
		};
		fetchStats();
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
		<>
			{canTrain && (
				<div
					style={{
						position: 'fixed',
						top: 24,
						right: 32,
						zIndex: 1000,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'flex-end',
					}}>
					<button
						onClick={handleTrain}
						style={{
							padding: '10px 28px',
							borderRadius: 8,
							background: '#805ad5',
							color: '#fff',
							border: 'none',
							fontWeight: 600,
							fontSize: 18,
							boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
							cursor: 'pointer',
						}}>
						Train Model
					</button>
					<div
						style={{
							marginTop: 12,
							background: '#fff',
							borderRadius: 8,
							boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
							padding: '10px 18px',
							fontSize: 15,
							color: '#2d3748',
							minWidth: 180,
							textAlign: 'right',
						}}>
						<div>
							<b>Unique Characters:</b> {stats.uniqueChars}
						</div>
						<div>
							<b>Total Samples:</b> {stats.totalSamples}
						</div>
					</div>
				</div>
			)}
			<div className='app-container'>
				<h1 style={{ textAlign: 'center' }}>Handwriting Trainer</h1>
				<div style={{ maxWidth: 900, margin: '0 auto', width: '100%' }}>
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							marginBottom: 16,
						}}>
						<select
							value={char}
							onChange={(e) => setChar(e.target.value)}
							style={{
								padding: '8px 16px',
								borderRadius: 6,
								border: '1px solid #cbd5e1',
								fontSize: 18,
								minWidth: 120,
							}}>
							<option>ሀ</option>
							<option>ለ</option>
							<option>ሐ</option>
						</select>
					</div>
					<div style={{ width: '100%', margin: '0 auto', marginBottom: 16 }}>
						<DrawingCanvas
							onSave={handleSave}
							onRecognize={handleRecognize}
							svgToLoad={importedSvg}
							ref={canvasRef}
						/>
					</div>
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							gap: 16,
							marginBottom: 24,
						}}>
						{/* Removed Save Sample and Recognize buttons from here */}
					</div>
				</div>
				<div
					style={{
						background: '#f9fafb',
						borderRadius: 12,
						padding: 20,
						boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
						marginBottom: 24,
					}}>
					<Characters
						onSampleClick={handleSampleClick}
						currentChar={char}
						refreshKey={samplesVersion}
						onSampleDelete={() => setSamplesVersion((v) => v + 1)}
					/>
				</div>
				<Prediction
					lastPredictedSvgs={lastPredictedSvgs}
					lastImages={lastImages}
					lastTensors={lastTensors}
					prediction={prediction}
				/>
				<div
					style={{
						marginTop: 32,
						background: '#f9fafb',
						borderRadius: 12,
						padding: 20,
						boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
					}}>
					<DataExportImport />
				</div>
			</div>
		</>
	);
};

export default App;
