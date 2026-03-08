import { useEffect, useRef } from "react";
import styles from "./Preview.module.scss";

const Preview = ({
  finalComposition,
  triggerTextureUpdate,
  setTriggerTextureUpdate,
  importTemplate,
  // --- NOVAS PROPS NECESSÁRIAS ---
  layers,
  activeLayerId,
  brushColor,
  brushSize,
  brushOpacity,
  isEraser,
  onPaintEnd, // O mesmo updateComposition usado no 3D
  saveHistoryAction
}) => {
  const shirtCanvasRef = useRef(null);
  const pantsCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const activeType = useRef("shirt");

  // Estados de controle do pincel
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const beforePaintData = useRef(null);

  // Sincroniza o Preview com a Composição Final
  useEffect(() => {
    if (!finalComposition || !finalComposition.shirt || !finalComposition.pants) return;

    const updatePreviewCanvas = (type, ref) => {
      if (ref.current && finalComposition[type]?.canvas) {
        const ctx = ref.current.getContext("2d");
        ctx.clearRect(0, 0, 585, 559);
        ctx.drawImage(finalComposition[type].canvas, 0, 0);
      }
    };

    updatePreviewCanvas("shirt", shirtCanvasRef);
    updatePreviewCanvas("pants", pantsCanvasRef);
  }, [finalComposition, triggerTextureUpdate]);

  // Calcula a posição do mouse em relação ao tamanho real do template (585x559)
  const getMousePos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e, type) => {
    const activeLayer = layers?.find((l) => l.id === activeLayerId);
    if (!activeLayer || !activeLayer.visible) return;

    isDrawing.current = true;
    const canvas = type === "shirt" ? shirtCanvasRef.current : pantsCanvasRef.current;
    lastPos.current = getMousePos(e, canvas);

    // Salva o estado para o Undo (Ctrl+Z)
    const ctx = activeLayer.channels[type].ctx;
    beforePaintData.current = ctx.getImageData(0, 0, 585, 559);
  };

  const draw = (e, type) => {
    if (!isDrawing.current) return;

    const activeLayer = layers?.find((l) => l.id === activeLayerId);
    if (!activeLayer || !activeLayer.visible) return;

    const canvas = type === "shirt" ? shirtCanvasRef.current : pantsCanvasRef.current;
    const currentPos = getMousePos(e, canvas);
    
    const layerCtx = activeLayer.channels[type].ctx; // Contexto da camada real
    const previewCtx = canvas.getContext("2d"); // Contexto visual temporário

    const applyStroke = (ctx) => {
      ctx.beginPath();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = brushSize;

      if (isEraser) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = brushOpacity;
        ctx.strokeStyle = brushColor;
      }

      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
    };

    // Pinta nos dois contextos ao mesmo tempo para feedback instantâneo sem lag no 3D
    applyStroke(layerCtx);
    applyStroke(previewCtx);

    lastPos.current = currentPos;
  };

  const stopDrawing = (e, type) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    // Atualiza o 3D e renderiza as camadas finais apenas quando soltar o mouse
    if (onPaintEnd) onPaintEnd();

    // Salva a ação no histórico
    const activeLayer = layers?.find((l) => l.id === activeLayerId);
    if (activeLayer && saveHistoryAction && beforePaintData.current) {
      const ctx = activeLayer.channels[type].ctx;
      const afterPaintData = ctx.getImageData(0, 0, 585, 559);
      saveHistoryAction(activeLayerId, type, beforePaintData.current, afterPaintData);
    }
  };

  const downloadTexture = (type) => {
    const canvas = finalComposition[type]?.canvas;
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `roblox_${type}_template.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = (type) => {
    activeType.current = type;
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (img.width !== 585 || img.height !== 559) {
          alert(`Erro: A imagem deve ter exatamente 585x559 pixels.\nDetectado: ${img.width}x${img.height}`);
          return;
        }
        importTemplate(activeType.current, event.target.result);
        setTriggerTextureUpdate((prev) => prev + 1);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className={styles.Preview}>
      <h3>ROBLOX CLASSIC</h3>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/png, image/jpeg"
        onChange={handleFileChange}
      />

      <div className={styles.gridContainer}>
        {/* SHIRT */}
        <div className={styles.previewBox}>
          <span className={styles.label}>SHIRT TEMPLATE</span>
          <div className={styles.imageWrapper}>
            <canvas
              ref={shirtCanvasRef}
              width={585}
              height={559}
              className={styles.previewImage}
              style={{ cursor: "crosshair", touchAction: "none" }}
              onPointerDown={(e) => startDrawing(e, "shirt")}
              onPointerMove={(e) => draw(e, "shirt")}
              onPointerUp={(e) => stopDrawing(e, "shirt")}
              onPointerLeave={(e) => stopDrawing(e, "shirt")}
            />
            <div className={styles.overlayActions}>
              <button onClick={() => handleImportClick("shirt")}>Importar</button>
            </div>
          </div>
          <button className={styles.downloadBtn} onClick={() => downloadTexture("shirt")}>
            Baixar Camisa
          </button>
        </div>

        {/* PANTS */}
        <div className={styles.previewBox}>
          <span className={styles.label}>PANTS TEMPLATE</span>
          <div className={styles.imageWrapper}>
            <canvas
              ref={pantsCanvasRef}
              width={585}
              height={559}
              className={styles.previewImage}
              style={{ cursor: "crosshair", touchAction: "none" }}
              onPointerDown={(e) => startDrawing(e, "pants")}
              onPointerMove={(e) => draw(e, "pants")}
              onPointerUp={(e) => stopDrawing(e, "pants")}
              onPointerLeave={(e) => stopDrawing(e, "pants")}
            />
            <div className={styles.overlayActions}>
              <button onClick={() => handleImportClick("pants")}>Importar</button>
            </div>
          </div>
          <button className={styles.downloadBtn} onClick={() => downloadTexture("pants")}>
            Baixar Calça
          </button>
        </div>
      </div>
    </div>
  );
};

export default Preview;