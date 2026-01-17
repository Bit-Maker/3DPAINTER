
import { useRef, useEffect, useState } from 'react';
import { performPaint } from '../utils/paintHelper';
import './TextureEditor.css';

const TextureEditor = ({
    sharedCanvas, sharedCtx, 
    brushColor, brushSize,
    brushOpacity, isEraser,
    brushTexture, isPaintMode,
    onPaint2D, onSaveHistory,
    uvLines, showWireframe
}) => {
    const containerRef = useRef(null);
    const overlayRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);


    useEffect(() => {
        if (containerRef.current && sharedCanvas) {
            sharedCanvas.style.width = '100%';
            sharedCanvas.style.height = '100%';
            sharedCanvas.style.display = 'block';
            sharedCanvas.style.imageRendering = 'pixelated';
            
            containerRef.current.innerHTML = '';
            containerRef.current.appendChild(sharedCanvas);
            if (!overlayRef.current) {
                const cvs = document.createElement('canvas');
                cvs.width = 1024; 
                cvs.height = 1024;
                cvs.style.position = 'absolute'; 
                cvs.style.top = '0';
                cvs.style.left = '0';
                cvs.style.width = '100%';
                cvs.style.height = '100%';
                cvs.style.pointerEvents = 'none'; 
                cvs.style.zIndex = '10'; 
                overlayRef.current = cvs;
            }
            containerRef.current.appendChild(overlayRef.current);
        }
    }, [sharedCanvas]);

    useEffect(() => {
        const ctx = overlayRef.current?.getContext('2d');
        if (!ctx) return;

        // Limpa o overlay
        ctx.clearRect(0, 0, 1024, 1024);

        if (showWireframe && uvLines && uvLines.length > 0) {
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.75)';
            ctx.lineWidth = 3;
            ctx.beginPath();

            const size = 1024;
            for (let i = 0; i < uvLines.length; i+=2) {
                const u1 = uvLines[i].u;
                const v1 = 1 - uvLines[i].v; 
                
                const u2 = uvLines[i+1].u;
                const v2 = 1 - uvLines[i+1].v;

                ctx.moveTo(u1 * size, v1 * size);
                ctx.lineTo(u2 * size, v2 * size);
            }
            ctx.stroke();
        }
    }, [uvLines, showWireframe]); 

    const handlePaint = (e) => {
        if (!isDrawing || !isPaintMode || !sharedCtx) return;

        const rect = containerRef.current.getBoundingClientRect();
        const scaleX = sharedCanvas.width / rect.width;
        const scaleY = sharedCanvas.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        performPaint(
            sharedCtx,
            x, y,
            brushSize, brushColor, brushOpacity, isEraser, brushTexture
        );

        onPaint2D(); 
    };

    const handleMouseDown = (e) => {
        if (!isPaintMode) return;
        setIsDrawing(true);
        onSaveHistory();
        handlePaint(e);
    };
    const handleMouseUp = () => {
        setIsDrawing(false);
    };

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, []);


    return (
        <div className={`texture-editor-panel ${isPaintMode ? 'active' : ''}`}>
             <h3>Editor de Textura (2D)</h3>
             <div 
                className="canvas-container" 
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handlePaint}
                onMouseLeave={() => setIsDrawing(false)}
                onMouseUp={() => setIsDrawing(false)}
                style={{ cursor: isPaintMode ? 'crosshair' : 'default' }}
             >
             </div>
        </div>
    );
};

export default TextureEditor;