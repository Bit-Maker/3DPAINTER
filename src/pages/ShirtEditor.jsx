import { useState, useEffect, useRef, useCallback } from "react";
import Scene3D from "../components/Scene3D";
import Toolbar from "../components/Toolbar/Toolbar";
import BrushCursor from "../components/BrushCursor";
import LayerPanel from "../components/LayerPanel/LayerPanel";
import { createNewCanvas } from "../utils/canvasHelpers";
import { createLayer, composeLayers, clearLayers } from "../utils/layerHelper";
import BodyPartsPanel from "../components/BodyPartsPanel";
import Preview from "../components/Preview/Preview";
import { loadTemplateToCanvas } from "../utils/canvasHelpers";
import { serializeLayers } from "../utils/save";
import LeftToolbar from "../components/LeftToolBar/LeftToolbar";
import  {Analytics}  from "@vercel/analytics/react"

function ShirtEditor() {
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
  const MAX_HISTORY = 20; // Limite para não estourar a memória RAM
  const finalCompositionRef = useRef(null);
  const [bodyPartsVisibility, setBodyPartsVisibility] = useState({});
  const [lightingMode, setLightingMode] = useState("studio");
  const [scene, setScene] = useState(null);
  const [ambientLight, setAmbientLight] = useState(null);
  const [dirLight, setDirLight] = useState(null);
  const [isWrapMode, setWrapMode] = useState(false);
  const [assetId, setAssetId] = useState("Novo Projeto"); // Estado para o ID do asset atual
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

  const applyHistoryState = useCallback((action, isUndo) => {
    // Usamos layersRef para garantir que pegamos a versão exata do momento, sem delay do React
    const currentLayers = layersRef.current;
    const layer = currentLayers.find((l) => l.id === action.layerId);
    if (!layer) return;

    const shirtCtx = layer.channels.shirt.ctx;
    const pantsCtx = layer.channels.pants.ctx;

    // Define qual estado aplicar dependendo se é Undo ou Redo
    const shirtData = isUndo ? action.beforeShirt : action.afterShirt;
    const pantsData = isUndo ? action.beforePants : action.afterPants;

    // Restaura e desenha a Camisa
    if (shirtData) {
      shirtCtx.clearRect(0, 0, 585, 559);
      shirtCtx.putImageData(shirtData, 0, 0);
    }

    // Restaura e desenha a Calça
    if (pantsData) {
      pantsCtx.clearRect(0, 0, 585, 559);
      pantsCtx.putImageData(pantsData, 0, 0);
    }

    // A MÁGICA ACONTECE AQUI: Compõe as layers e atualiza a textura 3D IMEDIATAMENTE
    if (finalCompositionRef.current) {
      composeLayers(currentLayers, finalCompositionRef.current);
      setTriggerTextureUpdate((prev) => prev + 1);
    }
  }, []);

  // 2. Desfazer (Undo)
  const handleUndo = useCallback(() => {
    if (undoStack.current.length === 0) return;

    const action = undoStack.current.pop();
    redoStack.current.push(action); // Joga para a pilha de refazer

    applyHistoryState(action, true);
  }, [applyHistoryState]);

  // 3. Refazer (Redo)
  const handleRedo = useCallback(() => {
    if (redoStack.current.length === 0) return;

    const action = redoStack.current.pop();
    undoStack.current.push(action); // Devolve para a pilha de desfazer

    applyHistoryState(action, false);
  }, [applyHistoryState]);

  // 4. Salvar Histórico (Protegido contra estouro de RAM)
  const saveHistoryAction = useCallback(
    (layerId, beforeShirt, afterShirt, beforePants, afterPants) => {
      undoStack.current.push({
        layerId,
        beforeShirt,
        afterShirt,
        beforePants,
        afterPants,
      });
      
      // Ao pintar algo novo, o futuro (redo) deixa de existir
      redoStack.current = []; 
      
      // Gerenciamento estrito de memória
      if (undoStack.current.length > MAX_HISTORY) {
        undoStack.current.shift();
      }
    },
    [] // Sem dependências, essa função nunca recria atoa
  );

  


  const handleModelLoaded = (parts) => {
    const initialState = {};
    parts.forEach((part) => {
      if (part.name !== "Head") {
        initialState[part.name] = true; // Tudo começa visível
      } else {
        initialState[part.name] = false; // Deixa a cabeça invisível por padrão
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
      finalCompositionRef.current.shirt.ctx.clearRect(0, 0, 585, 559);
      finalCompositionRef.current.pants.ctx.clearRect(0, 0, 585, 559);
      clearLayers(layers);
      setTriggerTextureUpdate((prev) => prev + 1);
    }
  };

  const NewTemplate = () => {
    const r = window.confirm("Do you want to create a new template? All the progress will be lost")

    if(r) {
    loadTemplateToCanvas(
          layers[0].channels.shirt.ctx,
           process.env.PUBLIC_URL+ "/templates/TemplateShirt.png",
        ).then(()=> {
         updateComposition()
        
        })
        loadTemplateToCanvas(
           layers[0].channels.pants.ctx,
          "/templates/TemplatePants.png",
        ).then(()=> {
         updateComposition()
        
        });
      }
  }

  const updateLayerOpacity = (id, opacity) => {
    const newLayers = layers.map((l) =>
      l.id === id ? { ...l, opacity: opacity } : l,
    );
    setLayers(newLayers);
    updateComposition()
  };

  const handleAddLayer = () => {
    const newId = Date.now(); // Removido as chaves {} de destruturação que causavam erro

    const createChannel = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 585;
      canvas.height = 559;
      return {
        canvas,
        ctx: canvas.getContext("2d"),
      };
    };

    const newLayer = {
      id: newId,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      opacity: 1,
      channels: {
        shirt: createChannel(),
        pants: createChannel(),
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

  const createCanvasFromBase64 = (base64) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 585;
        canvas.height = 559;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas);
      };
    });
  };

  useEffect(() => {
    const initApp = async () => {
      // 1. Inicializa os canais de composição final se não existirem
      if (!finalCompositionRef.current) {
        finalCompositionRef.current = {
          shirt: createNewCanvas("transparent", 585, 559),
          pants: createNewCanvas("transparent", 585, 559),
        };
      }

      // 2. Tenta buscar o backup primeiro
      const savedData = localStorage.getItem("roblox_editor_backup");

      if (savedData) {
        try {
          const backup = JSON.parse(savedData);
          console.log("📂 Backup encontrado, restaurando...");

          const restoredLayers = await Promise.all(
            backup.layers.map(async (layer) => {
              const shirtCanvas = await createCanvasFromBase64(
                layer.images.shirt,
              );
              const pantsCanvas = await createCanvasFromBase64(
                layer.images.pants,
              );
              return {
                ...layer,
                channels: {
                  shirt: {
                    canvas: shirtCanvas,
                    ctx: shirtCanvas.getContext("2d"),
                  },
                  pants: {
                    canvas: pantsCanvas,
                    ctx: pantsCanvas.getContext("2d"),
                  },
                },
              };
            }),
          );

          setLayers(restoredLayers);
          setActiveLayerId(restoredLayers[0]?.id);
          setAssetId(backup.assetId || "Projeto Recuperado");

          return; // Finaliza aqui se restaurou com sucesso
        } catch (e) {
          console.error("❌ Erro ao restaurar backup:", e);
        }
      } else {
        // 3. Se NÃO houver backup, aí sim criamos a Camada Base do zero
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
  }, []); // Executa apenas uma vez ao montar o componente

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key.toLowerCase() === "z") {
          event.preventDefault();
          if (event.shiftKey) {
            handleRedo(); // Ctrl + Shift + Z
          } else {
            handleUndo(); // Ctrl + Z
          }
        } else if (event.key.toLowerCase() === "y") {
          event.preventDefault();
          handleRedo(); // Ctrl + Y
        } 
        return;
      }

      event.preventDefault();
      if (event.key === "+") {
        setBrushSize((size) => Math.min(size + 5, 500));
      } else if (event.key === "-") {
        setBrushSize((size) => Math.max(size - 5, 1));
      } else if (event.code === "Space") {
          setIsAnimating(prev => !prev)
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
    // Impede de salvar um projeto vazio por cima de um backup existente no primeiro render
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
    }, 2000); // Salva 2 segundos após a última alteração

    return () => clearTimeout(timeout);
  }); // <--- OBRIGATÓRIO: observar mudanças aqui

  return (
    <div className="App">
      <BrushCursor size={brushSize} visible={true} />

      <Toolbar
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

      <Scene3D
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
      <Preview
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
      <Analytics/>
      <div id="portal-root"></div>
    </div>
  );
}

export default ShirtEditor;
