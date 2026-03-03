import React, { useState, useEffect, useRef, useCallback } from "react"; 
import Scene3D from "./components/Scene3D";
import Toolbar from "./components/Toolbar";
import BrushCursor from "./components/BrushCursor";
import LayerPanel from "./components/LayerPanel";
import { createNewCanvas } from "./utils/canvasHelpers";
import { createLayer, composeLayers } from "./utils/layerHelper";
import "./App.css";
import Preview from "./components/Preview/Preview";
import { loadTemplateToCanvas } from "./utils/canvasHelpers";
function App() {
  const [brushColor, setBrushColor] = useState("#000");
  const [brushSize, setBrushSize] = useState(20);
  const [brushOpacity, setBrushOpacity] = useState(1.0);
  const [isEraser, setIsEraser] = useState(false);
  const [brushTexture, setBrushTexture] = useState(null);
  const [isPaintMode, setIsPaintMode] = useState(false);
  const [uploadedModel, setUploadedModel] = useState(null);
  const [triggerAutoUV, setTriggerAutoUV] = useState(0);
  const [activeChannel, setActiveChannel] = useState("albedo");
  const [layers, setLayers] = useState([]);
  const [activeLayerId, setActiveLayerId] = useState(null);
  const [triggerTextureUpdate, setTriggerTextureUpdate] = useState(0);

  const finalCompositionRef = useRef(null);

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
      if(event.key === "Tab") {
        setIsPaintMode((prev) => !prev);
      }
    else if(event.key === "+") {
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

      if(event.key === "Tab") {
        event.preventDefault();
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
      <BrushCursor size={brushSize} visible={isPaintMode} />

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
        setIsEraser={setIsEraser}
        setUploadedModel={setUploadedModel}
        setBrushTexture={setBrushTexture}
        isPaintMode={isPaintMode}
        toggleMode={setIsPaintMode}
        handleAutoUV={() => setTriggerAutoUV((p) => p + 1)}
      />
{/*
<LayerPanel
        layers={layers}
        activeLayerId={activeLayerId}
        setLayers={setLayers}
        setActiveLayerId={setActiveLayerId}
        onUpdate={updateComposition}
        />
        
        */
      }
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
        isPaintMode={isPaintMode}
        uploadedModel={uploadedModel}
        brushTexture={brushTexture}
        triggerAutoUV={triggerAutoUV}
        channels={finalCompositionRef.current}
      />
      <Preview setTriggerTextureUpdate={setTriggerTextureUpdate} triggerTextureUpdate={triggerTextureUpdate}  finalComposition={finalCompositionRef.current}/>
    </div>
  );
}

export default App;
