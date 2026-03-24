import { useEffect, useRef } from "react";

const MeshPreview = ({
  finalComposition,
  triggerTextureUpdate,
  setTriggerTextureUpdate,
  importTemplate,
  layers,
  activeLayerId,
  brushColor,
  brushSize,
  brushOpacity,
  isEraser,
  onPaintEnd,
  saveHistoryAction,
  isEyedropper,
  setIsEyedropper,
  setBrushColor,
}) => {
  // Agora temos apenas um canvas para a textura inteira
  const mainCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Estados de controle do pincel
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const beforePaintData = useRef(null);

  // RESOLUÇÃO DA TEXTURA GENÉRICA
  const CANVAS_SIZE = 1024;

  // Sincroniza o Preview com a Composição Final
  useEffect(() => {
    if (!finalComposition || !finalComposition.main) return;

    if (mainCanvasRef.current && finalComposition.main.canvas) {
      const ctx = mainCanvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.drawImage(finalComposition.main.canvas, 0, 0);
    }
  }, [finalComposition, triggerTextureUpdate]);

  // Calcula a posição do mouse em relação ao tamanho real da textura (1024x1024)
  const getMousePos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Função auxiliar para converter RGB do Canvas para HEX do Pincel
  const rgbToHex = (r, g, b) => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  };

  const startDrawing = (e) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    
    const pos = getMousePos(e, canvas);

    // --- LÓGICA DO CONTA-GOTAS ---
    if (isEyedropper) {
      const ctx = canvas.getContext("2d");
      const pixel = ctx.getImageData(pos.x, pos.y, 1, 1).data;

      if (pixel[3] > 0) {
        const hexColor = rgbToHex(pixel[0], pixel[1], pixel[2]);
        setBrushColor(hexColor);
      }

      setIsEyedropper(false);
      return;
    }

    // --- LÓGICA NORMAL DE DESENHO ---
    const activeLayer = layers?.find((l) => l.id === activeLayerId);
    if (!activeLayer || !activeLayer.visible) return;

    isDrawing.current = true;
    lastPos.current = pos;

    const ctx = activeLayer.channels.main.ctx;
    beforePaintData.current = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;

    const activeLayer = layers?.find((l) => l.id === activeLayerId);
    if (!activeLayer || !activeLayer.visible) return;

    const canvas = mainCanvasRef.current;
    const currentPos = getMousePos(e, canvas);

    const layerCtx = activeLayer.channels.main.ctx; // Contexto da camada real
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

    // Pinta nos dois contextos ao mesmo tempo
    applyStroke(layerCtx);
    applyStroke(previewCtx);

    lastPos.current = currentPos;
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    const activeLayer = layers?.find((l) => l.id === activeLayerId);
    
    // Salva a ação no histórico (Adequado para a nova função saveHistoryAction)
    if (activeLayer && saveHistoryAction && beforePaintData.current) {
      const ctx = activeLayer.channels.main.ctx;
      const afterPaintData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      
      // Enviando apenas o ID da camada, o antes e o depois
      saveHistoryAction(activeLayerId, beforePaintData.current, afterPaintData);
      beforePaintData.current = null;
    }

    // Atualiza o modelo 3D
    if (onPaintEnd) onPaintEnd();
  };

  const downloadTexture = () => {
    const canvas = finalComposition.main?.canvas;
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `textura_albedo.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Validação da resolução (Avisa, mas não impede caso o usuário queira esticar)
        if (img.width !== CANVAS_SIZE || img.height !== CANVAS_SIZE) {
          console.warn(`Aviso: A imagem importada (${img.width}x${img.height}) será redimensionada para ${CANVAS_SIZE}x${CANVAS_SIZE}.`);
        }
        
        // Passamos "main" e a imagem em base64
        importTemplate("main", event.target.result);
        setTriggerTextureUpdate((prev) => prev + 1);
        if (onPaintEnd) onPaintEnd(); // Força a atualização no 3D
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // Reseta o input para permitir importar o mesmo arquivo depois
  };

  return (
    <section
      className="preview-sidebar position-fixed end-0 m-3 d-flex flex-column gap-3 custom-scrollbar"
      style={{
        top: "60px",
        zIndex: 1020,
        maxWidth: "25vw",
        width: "300px",
      }}
      aria-label="Texture Preview"
    >
      <input
        type="file"
        ref={fileInputRef}
        className="d-none"
        accept="image/png, image/jpeg"
        onChange={handleFileChange}
      />

      <article className="card bg-dark border-secondary shadow flex-shrink-0">
        <header className="card-header py-1 border-secondary bg-black bg-opacity-25 text-center">
          <span
            className="fw-bold text-uppercase text-primary"
            style={{ fontSize: "10px", letterSpacing: "1px" }}
          >
            Texture Map
          </span>
        </header>

        <div className="card-body p-1">
          <figure className="m-0 border border-secondary rounded overflow-hidden bg-white">
            <canvas
              ref={mainCanvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              className="img-fluid d-block mx-auto"
              style={{
                cursor: "crosshair",
                touchAction: "none",
                maxHeight: "35vh", // Aumentado um pouco já que agora é um só
                objectFit: "contain",
                backgroundColor: "#fff", // Fundo branco padrão
              }}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerLeave={stopDrawing}
              role="img"
              aria-label="Draw Texture Area"
            />
          </figure>
        </div>

        <footer className="card-footer p-1 d-grid gap-1 border-secondary">
          <button
            className="btn btn-xs btn-outline-info"
            onClick={handleImportClick}
          >
            Import Texture
          </button>
          <button
            className="btn btn-xs btn-primary"
            onClick={downloadTexture}
          >
            Download Texture
          </button>
        </footer>
      </article>
    </section>
  );
};

export default MeshPreview;