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
	svgToLoad?: string | null;
};

const DrawingCanvas = forwardRef<ReactSketchCanvasRef, Props>(
	({ onSave, svgToLoad }, ref) => {
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
			<div style={{ position: 'relative', width: 300, height: 300 }}>
				{overlaySvg && (
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
				)}
				<ReactSketchCanvas
					ref={canvasRef}
					strokeWidth={4}
					strokeColor='black'
					width='300px'
					height='300px'
					onStroke={handleStroke}
				/>
				<button onClick={handleSave}>Save Sample</button>
				<button onClick={handleClear}>Clear Canvas</button>
			</div>
		);
	}
);

export default DrawingCanvas;
