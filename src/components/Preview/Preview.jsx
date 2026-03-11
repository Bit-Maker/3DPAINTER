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
  saveHistoryAction,
  isEyedropper,
  setIsEyedropper,
  setBrushColor,
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

 // Função auxiliar para converter RGB do Canvas para HEX do Pincel
const rgbToHex = (r, g, b) => {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
};

// Modifique o evento de clique inicial
const startDrawing = (e, type) => {
  const canvas = type === "shirt" ? shirtCanvasRef.current : pantsCanvasRef.current;
  const pos = getMousePos(e, canvas);

  // --- LÓGICA DO CONTA-GOTAS ---
  if (isEyedropper) {
    const ctx = canvas.getContext("2d");
    // Pega exatamente 1 pixel na posição do mouse
    const pixel = ctx.getImageData(pos.x, pos.y, 1, 1).data; 
    
    // Se o alpha (transparência) for maior que 0, copia a cor
    if (pixel[3] > 0) {
      const hexColor = rgbToHex(pixel[0], pixel[1], pixel[2]);
      setBrushColor(hexColor);
    }
    
    setIsEyedropper(false); // Desativa o conta-gotas após o uso (UX padrão)
    return; // Para a execução aqui para não desenhar
  }

  // --- LÓGICA NORMAL DE DESENHO (se o conta-gotas não estiver ativo) ---
  const activeLayer = layers?.find((l) => l.id === activeLayerId);
  if (!activeLayer || !activeLayer.visible) return;

  isDrawing.current = true;
  lastPos.current = pos;

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
  <section 
  className="preview-sidebar position-fixed end-0 m-3 d-flex flex-column gap-3" 
  style={{ top: '60px', zIndex: 1020, maxWidth: '200px' }}
  aria-label="Visualização dos Templates"
>
  {/* Input de Arquivo Escondido */}
  <input
    type="file"
    ref={fileInputRef}
    className="d-none"
    accept="image/png, image/jpeg"
    onChange={handleFileChange}
  />

  {/* Template: SHIRT */}
  <article className="card bg-dark border-secondary shadow">
    <header className="card-header py-1 border-secondary bg-black bg-opacity-25 text-center">
      <span className="fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '1px' }}>Shirt Template</span>
    </header>
    
    <div className="card-body p-1">
      <figure className="m-0 border border-secondary rounded overflow-hidden bg-white">
        <canvas
          ref={shirtCanvasRef}
          width={585}
          height={559}
          className="img-fluid d-block"
          style={{ cursor: "crosshair", touchAction: "none" }}
          onPointerDown={(e) => startDrawing(e, "shirt")}
          onPointerMove={(e) => draw(e, "shirt")}
          onPointerUp={(e) => stopDrawing(e, "shirt")}
          onPointerLeave={(e) => stopDrawing(e, "shirt")}
          role="img"
          aria-label="Área de desenho da camisa"
        />
      </figure>
    </div>

    <footer className="card-footer p-1 d-grid gap-1 border-secondary">
      <button className="btn btn-xs btn-outline-info" onClick={() => handleImportClick("shirt")}>
        Importar
      </button>
      <button className="btn btn-xs btn-primary" onClick={() => downloadTexture("shirt")}>
        Baixar Camisa
      </button>
    </footer>
  </article>

  {/* Template: PANTS */}
  <article className="card bg-dark border-secondary shadow">
    <header className="card-header py-1 border-secondary bg-black bg-opacity-25 text-center">
      <span className="fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '1px' }}>Pants Template</span>
    </header>
    
    <div className="card-body p-1">
      <figure className="m-0 border border-secondary rounded overflow-hidden bg-white">
        <canvas
          ref={pantsCanvasRef}
          width={585}
          height={559}
          className="img-fluid d-block"
          style={{ cursor: "crosshair", touchAction: "none" }}
          onPointerDown={(e) => startDrawing(e, "pants")}
          onPointerMove={(e) => draw(e, "pants")}
          onPointerUp={(e) => stopDrawing(e, "pants")}
          onPointerLeave={(e) => stopDrawing(e, "pants")}
          role="img"
          aria-label="Área de desenho da calça"
        />
      </figure>
    </div>

    <footer className="card-footer p-1 d-grid gap-1 border-secondary">
      <button className="btn btn-xs btn-outline-info" onClick={() => handleImportClick("pants")}>
        Importar
      </button>
      <button className="btn btn-xs btn-primary" onClick={() => downloadTexture("pants")}>
        Baixar Calça
      </button>
    </footer>
  </article>
</section>
  );
};

export default Preview;