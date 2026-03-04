import React, { useState, useEffect, useRef, useCallback } from "react"; 
import Scene3D from "./components/Scene3D";
import Toolbar from "./components/Toolbar";
import BrushCursor from "./components/BrushCursor";
// eslint-disable-next-line 
import LayerPanel from "./components/LayerPanel/LayerPanel";
import { createNewCanvas } from "./utils/canvasHelpers";
import { createLayer, composeLayers } from "./utils/layerHelper";
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
  const [activeChannel, setActiveChannel] = useState("albedo");
  const [layers, setLayers] = useState([]);
  const [activeLayerId, setActiveLayerId] = useState(null);
  const [triggerTextureUpdate, setTriggerTextureUpdate] = useState(0);

  const finalCompositionRef = useRef(null);

  const handleClear = () => {
    if (finalCompositionRef.current) {
      finalCompositionRef.current.shirt.ctx.clearRect(0, 0, 585, 559);
      finalCompositionRef.current.pants.ctx.clearRect(0, 0, 585, 559);
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

  const updateComposition = useCallback(() => {
    if (layers.length > 0 && finalCompositionRef.current) {
      composeLayers(layers, finalCompositionRef.current);
      setTriggerTextureUpdate((prev) => prev + 1);
    }
  }, [layers]);

  useEffect(() => {
    updateComposition();
  }, [updateComposition]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        
        return
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
  }, []);

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
        channels={finalCompositionRef.current}
      />
      <Preview setLayers={setLayers} setTriggerTextureUpdate={setTriggerTextureUpdate} triggerTextureUpdate={triggerTextureUpdate}  finalComposition={finalCompositionRef.current}/>
      <div id="portal-root"></div>
    </div>
  );
}

export default App;
