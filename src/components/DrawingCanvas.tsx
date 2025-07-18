import React, {
	useRef,
	useState,
	useEffect,
	forwardRef,
	useImperativeHandle,
} from 'react';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';

type Props = {
	onSave: () => void;
	onRecognize?: () => void;
	svgToLoad?: string | null;
};

const DrawingCanvas = forwardRef<ReactSketchCanvasRef, Props>(
	({ onSave, onRecognize, svgToLoad }, ref) => {
		const canvasRef = useRef<ReactSketchCanvasRef>(null);
		const [paths, setPaths] = useState<any[]>([]);
		const [overlaySvg, setOverlaySvg] = useState<string | null>(null);

		useImperativeHandle(ref, () => canvasRef.current as ReactSketchCanvasRef);

		useEffect(() => {
			setOverlaySvg(svgToLoad || null);
		}, [svgToLoad]);

		const handleSave = () => {
			onSave();
		};

		const handleClear = () => {
			canvasRef.current?.clearCanvas();
			setPaths([]);
			setOverlaySvg(null);
		};

		const handleStroke = async () => {
			const newPaths = await canvasRef.current?.exportPaths();
			newPaths && setPaths(newPaths);
		};

		return (
			<div style={{ position: 'relative', width: '100%', margin: '0 auto' }}>
				{/* {overlaySvg && (
					<div
						style={{
							position: 'absolute',
							top: 0,
							left: 0,
							width: 300,
							height: 300,
							zIndex: 2,
							pointerEvents: 'none',
							background: 'rgba(255,255,255,0.7)',
						}}
						dangerouslySetInnerHTML={{ __html: overlaySvg }}
					/>
				)} */}
				<ReactSketchCanvas
					ref={canvasRef}
					strokeWidth={4}
					strokeColor='black'
					width='100%'
					height='300px'
					onStroke={handleStroke}
					style={{
						borderRadius: 12,
						boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
						background: '#fff',
						border: '2px solid #3182ce',
						width: '100%',
						height: '300px',
						display: 'block',
					}}
				/>
				<div
					style={{
						display: 'flex',
						justifyContent: 'center',
						gap: 16,
						marginTop: 16,
					}}>
					<button
						onClick={handleSave}
						style={{
							padding: '8px 24px',
							borderRadius: 6,
							background: '#3182ce',
							color: '#fff',
							border: 'none',
							fontWeight: 500,
							cursor: 'pointer',
							fontSize: 18,
						}}>
						Save Sample
					</button>
					{onRecognize && (
						<button
							onClick={onRecognize}
							style={{
								padding: '8px 24px',
								borderRadius: 6,
								background: '#38a169',
								color: '#fff',
								border: 'none',
								fontWeight: 600,
								fontSize: 18,
								cursor: 'pointer',
							}}>
							Recognize
						</button>
					)}
					<button
						onClick={handleClear}
						style={{
							padding: '8px 24px',
							borderRadius: 6,
							background: '#e53e3e',
							color: '#fff',
							border: 'none',
							fontWeight: 500,
							cursor: 'pointer',
							fontSize: 18,
						}}>
						Clear Canvas
					</button>
				</div>
			</div>
		);
	}
);

export default DrawingCanvas;
