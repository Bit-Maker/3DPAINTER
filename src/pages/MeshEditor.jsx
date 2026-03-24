import { useState, useEffect, useRef, useCallback } from "react";
import General3D from "../components/General3D";
import ToolbarGeneral from "../components/GeneralPage/ToolbarGeneral/ToolbarGeneral";
import BrushCursor from "../components/BrushCursor";
import LayerPanel from "../components/LayerPanel/LayerPanel";
import { createNewCanvas } from "../utils/canvasHelpers";
import { createLayer, composeLayers, clearLayers } from "../utils/layerHelper";
import BodyPartsPanel from "../components/BodyPartsPanel";
import MeshPreview from "../components/GeneralPage/MeshPreview/MeshPreview";
import { loadTemplateToCanvas } from "../utils/canvasHelpers";
import { serializeLayers } from "../utils/save";
import LeftToolbar from "../components/LeftToolBar/LeftToolbar";
import { Analytics } from "@vercel/analytics/react";

function MeshEditor() {
  const [brushColor, setBrushColor] = useState("#000000");
  const [BodyColor, setBodyColor] = useState("#ffd78b");
  const [brushSize, setBrushSize] = useState(5);
  const [brushOpacity, setBrushOpacity] = useState(1.0);
  const [isEraser, setIsEraser] = useState(false);
  const [isBucketMode, setIsBucketMode] = useState(false);
  const [brushTexture, setBrushTexture] = useState(null);
  const [uploadedModel, setUploadedModel] = useState(null);
  const [triggerAutoUV, setTriggerAutoUV] = useState(0);
  const [activeChannel, setActiveChannel] = useState("shirt");
  const [isMirrorEnabled, setIsMirrorEnabled] = useState(false);
  const [layers, setLayers] = useState([]);
  const [activeLayerId, setActiveLayerId] = useState(null);
  const [triggerTextureUpdate, setTriggerTextureUpdate] = useState(0);
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const MAX_HISTORY = 20;
  const finalCompositionRef = useRef(null);
  const [bodyPartsVisibility, setBodyPartsVisibility] = useState({});
  const [lightingMode, setLightingMode] = useState("studio");
  const [scene, setScene] = useState(null);
  const [ambientLight, setAmbientLight] = useState(null);
  const [dirLight, setDirLight] = useState(null);
  const [isWrapMode, setWrapMode] = useState(false);
  const [assetId, setAssetId] = useState("Novo Projeto"); 
  const [isEyedropper, setIsEyedropper] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaintMode, setIsPaintMode] = useState(true);
  const [shadingOpacity, setShadingOpacity] = useState(false);
  const layersRef = useRef(layers);

  useEffect(() => {
    layersRef.current = layers;
  }, [layers]);
  const updateComposition = useCallback(() => {
    if (layers.length > 0 && finalCompositionRef.current) {
      composeLayers(layers, finalCompositionRef.current);
      setTriggerTextureUpdate((prev) => prev + 1);
    }
  }, [layers]);

 const saveHistoryAction = (layerId, beforeData, afterData) => {
  const action = {
    layerId,
    before: beforeData, 
    after: afterData  
  };
console.log(undoStack.current)
  undoStack.current = (()=> {

    const newStack = [...undoStack.current, action];
    if (newStack.length > MAX_HISTORY) newStack.shift(); 
    return newStack;
  })()
  

  redoStack.current = [];
};


const handleUndo = useCallback(() => {
  if (undoStack.current.length === 0) return;

  const lastAction = undoStack.current.pop();

  
  
  const layer = layers.find(l => l.id === lastAction.layerId);
  if (!layer) return;

  const ctx = layer.channels.main.ctx;

  ctx.putImageData(lastAction.before, 0, 0);

  redoStack.current =  [...redoStack.current, lastAction];
  undoStack.current =  undoStack.current.slice(0, -1);
  updateComposition()
},[updateComposition,layers])

const handleRedo = useCallback(() => {
  if (redoStack.current.length === 0) return;

  const action = redoStack.current.pop();
  const layer = layers.find(l => l.id === action.layerId);
  if (!layer) return;

  const ctx = layer.channels.main.ctx;
  ctx.putImageData(action.after, 0, 0);

  undoStack.current =  [...undoStack.current, action];
  redoStack.current =   redoStack.current.slice(0, -1);
  updateComposition()
},[updateComposition,layers])


  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const extension = file.name.split(".").pop().toLowerCase();

    const url = URL.createObjectURL(file);


    setUploadedModel({
      url: url,
      extension: extension,
      name: file.name,
    });
  };

  const handleModelLoaded = (parts) => {
    const initialState = {};
    parts.forEach((part) => {
      if (part.name !== "Head") {
        initialState[part.name] = true;
      } else {
        initialState[part.name] = false;
      }
    });
    setBodyPartsVisibility(initialState);
  };

  const toggleBodyPart = (partName) => {
    setBodyPartsVisibility((prev) => ({
      ...prev,
      [partName]: !prev[partName],
    }));
  };

  const importTemplate = (type, template) => {
    const targetCanvas = layers.find((l) => l.id === activeLayerId)?.channels[
      type
    ].canvas;
    const ctx = targetCanvas.getContext("2d");
    loadTemplateToCanvas(ctx, template, () => {
      setTriggerTextureUpdate((prev) => prev + 1);
    });
    setTimeout(() => {
      updateComposition();
    }, 100);
  };

  const handleClear = () => {
    if (finalCompositionRef.current) {
      finalCompositionRef.current.main.ctx.clearRect(0, 0, 1024, 1024);
      clearLayers(layers);
      setTriggerTextureUpdate((prev) => prev + 1);
    }
  };

  const NewTemplate = () => {
    const r = window.confirm(
      "Do you want to create a new template? All the progress will be lost",
    );

    if (r) {
      loadTemplateToCanvas(
        layers[0].channels.shirt.ctx,
        process.env.PUBLIC_URL + "/templates/TemplateShirt.png",
      ).then(() => {
        updateComposition();
      });
      loadTemplateToCanvas(
        layers[0].channels.pants.ctx,
        "/templates/TemplatePants.png",
      ).then(() => {
        updateComposition();
      });
    }
  };

  const updateLayerOpacity = (id, opacity) => {
    const newLayers = layers.map((l) =>
      l.id === id ? { ...l, opacity: opacity } : l,
    );
    setLayers(newLayers);
    updateComposition();
  };
  const createChannel = (height, width) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return {
      canvas,
      ctx: canvas.getContext("2d"),
    };
  };

  const handleAddLayer = () => {
    const newId = Date.now(); 

    const newLayer = {
      id: newId,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      opacity: 1,
      channels: {
        main: createChannel(1024, 1024),
      },
    };

    setLayers((prev) => [...prev, newLayer]);
    setActiveLayerId(newId);
  };

  const handleDeleteLayer = (id) => {
    setLayers((prev) => prev.filter((l) => l.id !== id));
    if (activeLayerId === id) {
      setActiveLayerId(layers.find((l) => l.id !== id)?.id || null);
    }
  };

  useEffect(() => {
    const initApp = async () => {
      if (!finalCompositionRef.current) {
        finalCompositionRef.current = {
          main: createNewCanvas("transparent", 1024, 1024),
        };
      }

      const savedData = localStorage.getItem("roblox_editor_backup");

      if (savedData) {
        try {
          const backup = JSON.parse(savedData);
          console.log("📂 Backup encontrado, restaurando...");

          const restoredLayers = await Promise.all(
            backup.layers.map(async (layer) => {
              return {
                ...layer,
                channels: {
                  main: createChannel(1024, 1024),
                },
              };
            }),
          );

          setLayers(restoredLayers);
          setActiveLayerId(restoredLayers[0]?.id);
          setAssetId(backup.assetId || "Projeto Recuperado");

          return; 
        } catch (e) {
          console.error("❌ Erro ao restaurar backup:", e);
        }
      } else {
        console.log("🆕 Nenhum backup encontrado. Criando projeto novo...");
        const baseLayer = createLayer(Date.now(), "Camada Base");

        loadTemplateToCanvas(
          baseLayer.channels.shirt.ctx,
          "/templates/TemplateShirt.png",
        );
        loadTemplateToCanvas(
          baseLayer.channels.pants.ctx,
          "/templates/TemplatePants.png",
        );

        setLayers([baseLayer]);
        setActiveLayerId(baseLayer.id);
      }
    };
    initApp();
    // eslint-disable-next-line
  }, []); 

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key.toLowerCase() === "z") {
          event.preventDefault();
          if (event.shiftKey) {
            handleRedo(); 
          } else {
            handleUndo(); 
          }
        } else if (event.key.toLowerCase() === "y") {
          event.preventDefault();
          handleRedo(); 
        }
        return;
      }

      event.preventDefault();
      if (event.key === "+") {
        setBrushSize((size) => Math.min(size + 5, 500));
      } else if (event.key === "-") {
        setBrushSize((size) => Math.max(size - 5, 1));
      } else if (event.code === "Space") {
        setIsAnimating((prev) => !prev);
      }
    };

    const handleKeyUp = (event) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();

        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleUndo, handleRedo]);

  useEffect(() => {
 
    if (layers.length === 0) return;

    const timeout = setInterval(() => {
      try {
        const dataToSave = {
          assetId,
          layers: serializeLayers(layers),
          lastSaved: Date.now(),
        };

        localStorage.setItem(
          "roblox_editor_backup",
          JSON.stringify(dataToSave),
        );
        console.log("💾 Autosave realizado com sucesso!");
      } catch (e) {
        console.warn(
          "⚠️ Falha no autosave (provavelmente limite de 5MB do LocalStorage excedido)",
        );
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }); 

  return (
    <div className="App">
      <BrushCursor size={brushSize} visible={true} />

      <ToolbarGeneral
        NewTemplate={NewTemplate}
        scene={scene}
        myAmbLight={ambientLight}
        myDirLight={dirLight}
        setIsMirrorEnabled={setIsMirrorEnabled}
        isMirrorEnabled={isMirrorEnabled}
        activeChannel={activeChannel}
        setActiveChannel={setActiveChannel}
        brushColor={brushColor}
        setBrushColor={setBrushColor}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        brushOpacity={brushOpacity}
        setBrushOpacity={setBrushOpacity}
        isEraser={isEraser}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        bodyColor={BodyColor}
        setBodyColor={setBodyColor}
        isBucketMode={isBucketMode}
        handleClear={handleClear}
        setIsBucketMode={setIsBucketMode}
        setIsEraser={setIsEraser}
        isWrapMode={isWrapMode}
        setWrapMode={setWrapMode}
        model={uploadedModel}
        lightingMode={lightingMode}
        setLightingMode={setLightingMode}
        importRobloxTemplate={importTemplate}
        setUploadedModel={setUploadedModel}
        setBrushTexture={setBrushTexture}
        handleAutoUV={() => setTriggerAutoUV((p) => p + 1)}
        isEyedropper={isEyedropper}
        setIsEyedropper={setIsEyedropper}
        isAnimating={isAnimating}
        setIsAnimating={setIsAnimating}
        shadingOpacity={shadingOpacity}
        setShadingOpacity={setShadingOpacity}
      />
      <LeftToolbar
        scene={scene}
        isPaintMode={isPaintMode}
        setIsPaintMode={setIsPaintMode}
        myAmbLight={ambientLight}
        myDirLight={dirLight}
        setIsMirrorEnabled={setIsMirrorEnabled}
        isMirrorEnabled={isMirrorEnabled}
        activeChannel={activeChannel}
        setActiveChannel={setActiveChannel}
        brushColor={brushColor}
        setBrushColor={setBrushColor}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        brushOpacity={brushOpacity}
        setBrushOpacity={setBrushOpacity}
        isEraser={isEraser}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        bodyColor={BodyColor}
        setBodyColor={setBodyColor}
        isBucketMode={isBucketMode}
        handleClear={handleClear}
        setIsBucketMode={setIsBucketMode}
        setIsEraser={setIsEraser}
        isWrapMode={isWrapMode}
        setWrapMode={setWrapMode}
        model={uploadedModel}
        lightingMode={lightingMode}
        setLightingMode={setLightingMode}
        importRobloxTemplate={importTemplate}
        setUploadedModel={setUploadedModel}
        setBrushTexture={setBrushTexture}
        handleAutoUV={() => setTriggerAutoUV((p) => p + 1)}
        isEyedropper={isEyedropper}
        setIsEyedropper={setIsEyedropper}
        isAnimating={isAnimating}
        setIsAnimating={setIsAnimating}
      />

      <LayerPanel
        layers={layers}
        activeLayerId={activeLayerId}
        setLayers={setLayers}
        setActiveLayerId={setActiveLayerId}
        onUpdate={updateComposition}
        addLayer={handleAddLayer}
        updateOpacity={updateLayerOpacity}
        deleteLayer={handleDeleteLayer}
      />

      <BodyPartsPanel
        visibilityState={bodyPartsVisibility}
        togglePart={toggleBodyPart}
      />

      <General3D
        setScene={setScene}
        layers={layers}
        activeLayerId={activeLayerId}
        isWrapMode={isWrapMode}
        setAmbientLight={setAmbientLight}
        setDirLight={setDirLight}
        finalComposition={finalCompositionRef.current}
        triggerTextureUpdate={triggerTextureUpdate}
        onPaintEnd={updateComposition}
        bodyColor={BodyColor}
        activeChannel={activeChannel}
        brushColor={brushColor}
        brushSize={brushSize}
        brushOpacity={brushOpacity}
        isEraser={isEraser}
        isBucketMode={isBucketMode}
        uploadedModel={uploadedModel}
        brushTexture={brushTexture}
        triggerAutoUV={triggerAutoUV}
        setActiveChannel={setActiveChannel}
        handleModelLoaded={handleModelLoaded}
        bodyPartsVisibility={bodyPartsVisibility}
        setModel={setUploadedModel}
        saveHistoryAction={saveHistoryAction}
        isMirrorEnabled={isMirrorEnabled}
        setLightingMode={setLightingMode}
        channels={finalCompositionRef.current}
        isAnimating={isAnimating}
        isPaintMode={isPaintMode}
        isEyedropper={isEyedropper}
        setIsEyedropper={setIsEyedropper}
        setBrushColor={setBrushColor}
        setShadingOpacity={setShadingOpacity}
        shadingOpacity={shadingOpacity}
      />
      <MeshPreview
        importTemplate={importTemplate}
        setTriggerTextureUpdate={setTriggerTextureUpdate}
        triggerTextureUpdate={triggerTextureUpdate}
        finalComposition={finalCompositionRef.current}
        layers={layers}
        activeLayerId={activeLayerId}
        brushColor={brushColor}
        brushSize={brushSize}
        brushOpacity={brushOpacity}
        isEraser={isEraser}
        onPaintEnd={updateComposition}
        saveHistoryAction={saveHistoryAction}
        isEyedropper={isEyedropper}
        setBrushColor={setBrushColor}
        setIsEyedropper={setIsEyedropper}
      />
      <Analytics />
      <div id="portal-root"></div>
                        <input
                    type="file"
                    id="model-upload"
                    accept=".obj,.fbx"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
    </div>
  );
}

export default MeshEditor;
