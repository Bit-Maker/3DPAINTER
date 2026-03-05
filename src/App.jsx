import React, { useState, useEffect, useRef, useCallback } from "react"; 
import Scene3D from "./components/Scene3D";
import Toolbar from "./components/Toolbar";
import BrushCursor from "./components/BrushCursor";
import LayerPanel from "./components/LayerPanel/LayerPanel";
import { createNewCanvas } from "./utils/canvasHelpers";
import { createLayer, composeLayers,clearLayers } from "./utils/layerHelper";
import "./App.css";
import Preview from "./components/Preview/Preview";
import { loadTemplateToCanvas } from "./utils/canvasHelpers";


function App() {
  const [brushColor, setBrushColor] = useState("#000");
  const [brushSize, setBrushSize] = useState(5);
  const [brushOpacity, setBrushOpacity] = useState(1.0);
  const [isEraser, setIsEraser] = useState(false);
  const [isBucketMode, setIsBucketMode] = useState(false);
  const [brushTexture, setBrushTexture] = useState(null);
  const [uploadedModel, setUploadedModel] = useState(null);
  const [triggerAutoUV, setTriggerAutoUV] = useState(0);
  const [activeChannel, setActiveChannel] = useState("shirt");
  const [layers, setLayers] = useState([]);
  const [activeLayerId, setActiveLayerId] = useState(null);
  const [triggerTextureUpdate, setTriggerTextureUpdate] = useState(0);
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const MAX_HISTORY = 20; // Limite para não estourar a memória RAM
  const finalCompositionRef = useRef(null);
  const updateComposition = useCallback(() => {
    if (layers.length > 0 && finalCompositionRef.current) {
      composeLayers(layers, finalCompositionRef.current);
      setTriggerTextureUpdate((prev) => prev + 1);
    }
  }, [layers]);
  
  useEffect(() => {
    updateComposition();
  }, [updateComposition]);


  const importTemplate = (type,template) => {
    const targetCanvas =layers.find((l) => l.id === activeLayerId)?.channels[type].canvas;
    const ctx = targetCanvas.getContext("2d");
    loadTemplateToCanvas(ctx, template, () => {
      setTriggerTextureUpdate((prev) => prev + 1);
    });
    setTimeout(() => {
      updateComposition();
      
    }, 100);
  }

  const applyImageDataToLayer = useCallback((layerId, channel, imageData) => {
    setLayers((prevLayers) => {
      const newLayers = [...prevLayers];
      const layerIndex = newLayers.findIndex(l => l.id === layerId);
      if (layerIndex === -1) return prevLayers;

      const layer = newLayers[layerIndex];
      const ctx = layer.channels[channel].ctx;
      
      // Limpa e desenha os pixels salvos
      ctx.clearRect(0, 0, 585, 559);
      if (imageData) {
        ctx.putImageData(imageData, 0, 0);
      }
      
      return newLayers;
    });

    // Atualiza o modelo 3D logo em seguida
    setTimeout(() => updateComposition(), 502);
  }, [updateComposition]);

  const handleUndo = useCallback(() => {
    if (undoStack.current.length === 0) return; // Nada para desfazer
    
    const action = undoStack.current.pop(); // Tira a última ação
    redoStack.current.push(action); // Joga para a pilha de refazer
    
    // Restaura a imagem de ANTES da pincelada
    applyImageDataToLayer(action.layerId, action.channel, action.beforeData);
  }, [applyImageDataToLayer]);

  const handleRedo = useCallback(() => {
    if (redoStack.current.length === 0) return; // Nada para refazer
    
    const action = redoStack.current.pop(); // Tira da pilha de refazer
    undoStack.current.push(action); // Joga de volta para o undo
    
    // Restaura a imagem de DEPOIS da pincelada
    applyImageDataToLayer(action.layerId, action.channel, action.afterData);
  }, [applyImageDataToLayer]);

  // Função que o Scene3D vai chamar para salvar a pincelada
  const saveHistoryAction = useCallback((layerId, channel, beforeData, afterData) => {
    undoStack.current.push({ layerId, channel, beforeData, afterData });
    redoStack.current = []; // Sempre que desenhar algo novo, limpa o refazer

    // Remove o mais antigo se passar do limite
    if (undoStack.current.length > MAX_HISTORY) {
      undoStack.current.shift();
    }
  }, []);

  const handleClear = () => {
    if (finalCompositionRef.current) {
      finalCompositionRef.current.shirt.ctx.clearRect(0, 0, 585, 559);
      finalCompositionRef.current.pants.ctx.clearRect(0, 0, 585, 559);
      clearLayers(layers);
      setTriggerTextureUpdate((prev) => prev + 1);
    }
  }

  const updateLayerOpacity = (id, opacity) => {
    const newLayers = layers.map((l) =>
      l.id === id ? { ...l, opacity: opacity } : l,
    );
    setLayers(newLayers);
  }


  const handleAddLayer = () => {
    const newId = Date.now(); // Removido as chaves {} de destruturação que causavam erro

    const createChannel = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 585;
      canvas.height = 559;
      return {
        canvas,
        ctx: canvas.getContext("2d")
      };
    };

    const newLayer = {
      id: newId,
      name: `Camada ${layers.length + 1}`,
      visible: true,
      opacity: 1,
      channels: {
        shirt: createChannel(),
        pants: createChannel()
      }
    };

    setLayers((prev) => [...prev, newLayer]);
    setActiveLayerId(newId);
  };

useEffect(() => {
    if (!finalCompositionRef.current) {
        finalCompositionRef.current = {
            shirt: createNewCanvas("transparent", 585, 559),
            pants: createNewCanvas("transparent", 585, 559),
        };

        const baseLayer = createLayer(Date.now(), "Camada Base");
        if (baseLayer.channels.shirt.ctx) {
            loadTemplateToCanvas(baseLayer.channels.shirt.ctx, "/templates/TemplateShirt.png");
        }
        if (baseLayer.channels.pants.ctx) {
            loadTemplateToCanvas(baseLayer.channels.pants.ctx, "/templates/TemplatePants.png");
        }

        setLayers([baseLayer]);
        setActiveLayerId(baseLayer.id);
        setTimeout(() => {
            composeLayers([baseLayer], finalCompositionRef.current);
            setTriggerTextureUpdate(prev => prev + 1);
        }, 150);
    }
}, []);


  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key.toLowerCase() === 'z') {
          event.preventDefault();
          if (event.shiftKey) {
            handleRedo(); // Ctrl + Shift + Z
          } else {
            handleUndo(); // Ctrl + Z
          }
        } else if (event.key.toLowerCase() === 'y') {
          event.preventDefault();
          handleRedo(); // Ctrl + Y
        }
        return;
      }


      event.preventDefault();
       if(event.key === "+") {
        setBrushSize((size) => Math.min(size + 5, 500));
    }
    else if(event.key === "-") {
        setBrushSize((size) => Math.max(size - 5, 1));
      }

    };

      const handleKeyUp = (event) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        
        return
      }

    

    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleUndo, handleRedo]);

  return (
    <div className="App">
      <BrushCursor size={brushSize} visible={true} />

      <Toolbar
        activeChannel={activeChannel}
        setActiveChannel={setActiveChannel}
        brushColor={brushColor}
        setBrushColor={setBrushColor}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        brushOpacity={brushOpacity}
        setBrushOpacity={setBrushOpacity}
        isEraser={isEraser}
        isBucketMode={isBucketMode}
        handleClear={handleClear}
        setIsBucketMode={setIsBucketMode}
        setIsEraser={setIsEraser}
        setUploadedModel={setUploadedModel}
        setBrushTexture={setBrushTexture}
        handleAutoUV={() => setTriggerAutoUV((p) => p + 1)}
      />

<LayerPanel
        layers={layers}
        activeLayerId={activeLayerId}
        setLayers={setLayers}
        setActiveLayerId={setActiveLayerId}
        onUpdate={updateComposition}
        addLayer={handleAddLayer}
        updateOpacity={updateLayerOpacity}
        />
        
        
    
      <Scene3D
        layers={layers}
        activeLayerId={activeLayerId}
        finalComposition={finalCompositionRef.current}
        triggerTextureUpdate={triggerTextureUpdate}
        onPaintEnd={updateComposition}
        activeChannel={activeChannel}
        brushColor={brushColor}
        brushSize={brushSize}
        brushOpacity={brushOpacity}
        isEraser={isEraser}
        isBucketMode={isBucketMode}
        uploadedModel={uploadedModel}
        brushTexture={brushTexture}
        triggerAutoUV={triggerAutoUV}
        saveHistoryAction={saveHistoryAction}
        channels={finalCompositionRef.current}
      />
      <Preview importTemplate={importTemplate} setTriggerTextureUpdate={setTriggerTextureUpdate} triggerTextureUpdate={triggerTextureUpdate}  finalComposition={finalCompositionRef.current}/>
      <div id="portal-root"></div>
    </div>
  );
}

export default App;
