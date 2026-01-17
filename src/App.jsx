// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import Scene3D from './components/Scene3D';
import Toolbar from './components/Toolbar';
import BrushCursor from './components/BrushCursor';
import TextureEditor from './components/TextureEditor';
import { createNewCanvas } from './utils/canvasHelpers'; // <--- IMPORTAÇÃO DA CORREÇÃO
import { createLayer, composeLayers } from './utils/layerHelper'; // IMPORT NOVO
import LayerPanel from './components/LayerPanel';
import './App.css';

function App() {
    // States Padrão
    const [brushColor, setBrushColor] = useState('#ff0000');
    const [brushSize, setBrushSize] = useState(20);
    const [brushOpacity, setBrushOpacity] = useState(1.0);
    const [isEraser, setIsEraser] = useState(false);
    const [brushTexture, setBrushTexture] = useState(null);
    const [isPaintMode, setIsPaintMode] = useState(false);
    const [uploadedModel, setUploadedModel] = useState(null);
    const [faceLockMode, setFaceLockMode] = useState(true)
    // Triggers
    const [triggerUndo, setTriggerUndo] = useState(0);
    const [triggerRedo, setTriggerRedo] = useState(0);
    const [triggerClear, setTriggerClear] = useState(0);
    const [triggerAutoUV, setTriggerAutoUV] = useState(0);
    const [triggerTextureUpdate, setTriggerTextureUpdate] = useState(0);
    const [uvLines, setUvLines] = useState([]);
    const [showWireframe, setShowWireframe] = useState(true);
    const [layers, setLayers] = useState([]);
    const [activeLayerId, setActiveLayerId] = useState(null);
    const [triggerComposite, setTriggerComposite] = useState(0); // Gatilho para atualizar a textura final
    const downloadTextureRef = useRef(null);
    const finalCompositionRef = useRef(null);
    // --- SISTEMA PBR MULTI-CANAL ---
    const [activeChannel, setActiveChannel] = useState('albedo'); // 'albedo', 'roughness', 'metallic'
    
    // Ref para guardar os 3 canais. Cria apenas UMA VEZ.
   const channelsRef = useRef(null);
    
   // src/App.jsx
// Compõe sempre que houver trigger
  const handleLayerUpdate = () => {
        if (layers.length > 0 && finalCompositionRef.current) {
            composeLayers(layers, finalCompositionRef.current);
            setTriggerComposite(p => p + 1); // Avisa o Scene3D que a imagem mudou
        }
    };
    useEffect(() => {
        handleLayerUpdate();
    }, [triggerComposite]);

   useEffect(() => {
        if (!finalCompositionRef.current) {
            // Cria os canvases de saída (Destino da mistura)
            finalCompositionRef.current = {
                albedo: createNewCanvas('#ffffff'),
                roughness: createNewCanvas('#808080'), 
                metallic: createNewCanvas('#000000'),
                normal: createNewCanvas('#8080ff')
            };

            // Cria a primeira camada (Base)
            const baseLayer = createLayer(Date.now(), 'Base Layer');
            setLayers([baseLayer]);
            setActiveLayerId(baseLayer.id);
        }

      

        // Listener para criar camada vindo do LayerPanel
        const handleAddLayer = (e) => {
            const newLayer = createLayer(e.detail.id, `Layer ${layers.length + 1}`);
            setLayers(prev => [...prev, newLayer]);
            setActiveLayerId(newLayer.id);
        };
        window.addEventListener('add-layer', handleAddLayer);
        return () => window.removeEventListener('add-layer', handleAddLayer);
    }, [layers.length]); // Dependência simples para atualizar contagem de nome

// ... dentro do componente App ...

    // Inicialização Protegida
    if (!channelsRef.current) {
        if (typeof createNewCanvas !== 'function') {
            console.error("ERRO CRÍTICO: createNewCanvas ausente!");
        } else {
            channelsRef.current = {
                albedo: createNewCanvas('#ffffff'),    // Cor Base
                roughness: createNewCanvas('#808080'), // Rugosidade
                metallic: createNewCanvas('#000000'),  // Metalico
                
                // --- ADICIONE ESTA LINHA ---
                normal: createNewCanvas('#8080ff')     // Normal Map (Roxo padrão)
            };
        }
    }


    // Helper para pegar o canvas ativo atual
const getCurrentChannel = () => {
        // Se a ref não carregou ou o canal ativo está errado, retorna nulo para não travar
        if (!channelsRef.current || !channelsRef.current[activeChannel]) {
            console.warn(`Canal ${activeChannel} não encontrado ou channelsRef vazio.`);
            return { canvas: null, ctx: null }; // Retorna objeto vazio seguro
        }
        return channelsRef.current[activeChannel];
    };
    // Atalhos
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Tab') { e.preventDefault(); setIsPaintMode(prev => !prev); }
            if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') { e.preventDefault(); setTriggerUndo(prev => prev + 1); }
            if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) { e.preventDefault(); setTriggerRedo(prev => prev + 1); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="App">
            <BrushCursor size={brushSize} visible={isPaintMode} />
            
            <Toolbar 
                // Passamos o controle de canais para a Toolbar
                activeChannel={activeChannel}
                setActiveChannel={setActiveChannel}
                
                brushColor={brushColor} setBrushColor={setBrushColor}
                brushSize={brushSize} setBrushSize={setBrushSize}
                brushOpacity={brushOpacity} setBrushOpacity={setBrushOpacity}
                isEraser={isEraser} setIsEraser={setIsEraser}
                setUploadedModel={setUploadedModel}
                setBrushTexture={setBrushTexture}
                isPaintMode={isPaintMode} toggleMode={setIsPaintMode}
                handleClear={() => setTriggerClear(p => p + 1)}
                handleUndo={() => setTriggerUndo(p => p + 1)}
                handleRedo={() => setTriggerRedo(p => p + 1)}
                handleAutoUV={() => setTriggerAutoUV(p => p + 1)}
                faceLockMode={faceLockMode} setFaceLockMode={setFaceLockMode}
                handleDownload={() => downloadTextureRef.current?.()}
                showWireframe={showWireframe} setShowWireframe={setShowWireframe}
            />

            <LayerPanel 
                layers={layers}
                activeLayerId={activeLayerId}
                setLayers={setLayers}
                setActiveLayerId={setActiveLayerId}
                onUpdate={() => setTriggerComposite(p => p + 1)}
            />

            <Scene3D 
                // Props visuais
                layers={layers}
                brushColor={brushColor} brushSize={brushSize} brushOpacity={brushOpacity} isEraser={isEraser}
                isPaintMode={isPaintMode} uploadedModel={uploadedModel} brushTexture={brushTexture}
                faceLockMode={faceLockMode}
                // Triggers

                // Passamos a composição final para o ThreeJS EXIBIR
                finalComposition={finalCompositionRef.current}
                triggerComposite={triggerComposite}
                onPaintEnd={() => setTriggerComposite(p => p + 1)} // Callback após pintar

                triggerUndo={triggerUndo} triggerRedo={triggerRedo} triggerClear={triggerClear} 
                triggerAutoUV={triggerAutoUV} triggerTextureUpdate={triggerTextureUpdate}
                onDownloadTexture={downloadTextureRef}
                onUVsExtracted={setUvLines}
                                sharedCtx={getCurrentChannel()?.ctx}

                // PBR: Passamos TODOS os canais e qual está ativo
                channels={channelsRef.current}
                activeChannel={activeChannel}
            />

            <TextureEditor 
                // Editor 2D recebe apenas o canal ATIVO para exibir na tela
                sharedCanvas={getCurrentChannel()?.canvas}
                sharedCtx={getCurrentChannel()?.ctx}
                
                uvLines={uvLines} showWireframe={showWireframe}
                brushColor={brushColor} brushSize={brushSize} brushOpacity={brushOpacity}
                isEraser={isEraser} brushTexture={brushTexture} isPaintMode={isPaintMode}
                onPaint2D={() => setTriggerTextureUpdate(prev => prev + 1)}
                onSaveHistory={() => window.dispatchEvent(new CustomEvent('save-history'))}
            />
        </div>
    );
}

export default App;