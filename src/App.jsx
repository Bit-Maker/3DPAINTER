import React, { useState, useEffect, useRef, useCallback } from 'react'; // <--- IMPORT USECALLBACK
import Scene3D from './components/Scene3D';
import Toolbar from './components/Toolbar';
import BrushCursor from './components/BrushCursor';
import LayerPanel from './components/LayerPanel';
import { createNewCanvas } from './utils/canvasHelpers'; 
import { createLayer, composeLayers } from './utils/layerHelper';
import './App.css';

function App() {
    const [brushColor, setBrushColor] = useState('#ff0000');
    const [brushSize, setBrushSize] = useState(20);
    const [brushOpacity, setBrushOpacity] = useState(1.0);
    const [isEraser, setIsEraser] = useState(false);
    const [brushTexture, setBrushTexture] = useState(null);
    const [isPaintMode, setIsPaintMode] = useState(false);
    const [uploadedModel, setUploadedModel] = useState(null);
    const [triggerAutoUV, setTriggerAutoUV] = useState(0);
    const [activeChannel, setActiveChannel] = useState('albedo');

    const [layers, setLayers] = useState([]);
    const [activeLayerId, setActiveLayerId] = useState(null);
    const [triggerTextureUpdate, setTriggerTextureUpdate] = useState(0);

    const finalCompositionRef = useRef(null);

    useEffect(() => {
        if (!finalCompositionRef.current) {
            finalCompositionRef.current = {
                albedo: createNewCanvas('#ffffff'),
                roughness: createNewCanvas('#808080'), 
                metallic: createNewCanvas('#000000'),
                normal: createNewCanvas('#8080ff')
            };

            const baseLayer = createLayer(Date.now(), 'Base Layer');
            setLayers([baseLayer]);
            setActiveLayerId(baseLayer.id);
            
            composeLayers([baseLayer], finalCompositionRef.current);
            setTriggerTextureUpdate(1);
        }
    }, []);


    const updateComposition = useCallback(() => {
        if (layers.length > 0 && finalCompositionRef.current) {
            composeLayers(layers, finalCompositionRef.current);
            setTriggerTextureUpdate(prev => prev + 1);
        }
    }, [layers]); 

    useEffect(() => {
        updateComposition();
    }, [updateComposition]); 

    return (
        <div className="App">
            <BrushCursor size={brushSize} visible={isPaintMode} />
            
            <Toolbar 
                activeChannel={activeChannel} setActiveChannel={setActiveChannel}
                brushColor={brushColor} setBrushColor={setBrushColor}
                brushSize={brushSize} setBrushSize={setBrushSize}
                brushOpacity={brushOpacity} setBrushOpacity={setBrushOpacity}
                isEraser={isEraser} setIsEraser={setIsEraser}
                setUploadedModel={setUploadedModel} setBrushTexture={setBrushTexture}
                isPaintMode={isPaintMode} toggleMode={setIsPaintMode}
                handleAutoUV={() => setTriggerAutoUV(p => p + 1)}
            />

            <LayerPanel 
                layers={layers}
                activeLayerId={activeLayerId}
                setLayers={setLayers}
                setActiveLayerId={setActiveLayerId}
                onUpdate={updateComposition} 
            />

            <Scene3D 
                layers={layers}
                activeLayerId={activeLayerId}
                finalComposition={finalCompositionRef.current}
                triggerTextureUpdate={triggerTextureUpdate} 
                onPaintEnd={updateComposition}
                
                activeChannel={activeChannel}
                brushColor={brushColor} brushSize={brushSize} brushOpacity={brushOpacity}
                isEraser={isEraser} isPaintMode={isPaintMode}
                uploadedModel={uploadedModel} brushTexture={brushTexture}
                triggerAutoUV={triggerAutoUV}
                channels={finalCompositionRef.current}
            />
        </div>
    );
}

export default App;