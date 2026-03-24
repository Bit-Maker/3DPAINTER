import { useEffect, useRef } from "react";

const Preview = ({
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
  saveHistoryAction,
  isEyedropper,
  setIsEyedropper,
  setBrushColor,
}) => {
  const shirtCanvasRef = useRef(null);
  const pantsCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const activeType = useRef("shirt");

  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const beforePaintData = useRef(null);

  // --- ESTILOS CYBER-HUD ---
  const sidebarStyle = {
    top: '70px',
    right: '20px',
    zIndex: 1020,
    width: '260px',
    maxHeight: 'calc(100vh - 420px)', // Evita colisão com o LayerPanel embaixo
    paddingRight: '5px'
  };

  const glassCardStyle = {
    background: 'rgba(15, 15, 15, 0.8)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '15px'
  };

  const canvasContainerStyle = {
    position: 'relative',
    backgroundColor: '#1a1a1a',
    backgroundImage: `
      linear-gradient(45deg, #252525 25%, transparent 25%),
      linear-gradient(-45deg, #252525 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #252525 75%),
      linear-gradient(-45deg, transparent 75%, #252525 75%)
    `,
    backgroundSize: '10px 10px',
    backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
    border: '1px solid rgba(0, 229, 255, 0.2)',
    borderRadius: '8px'
  };

  const actionBtnStyle = (isPrimary) => ({
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '1px',
    padding: '6px 0',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
    backgroundColor: isPrimary ? '#00E5FF' : 'transparent',
    color: isPrimary ? '#000' : '#00E5FF',
    border: `1px solid ${isPrimary ? '#00E5FF' : 'rgba(0, 229, 255, 0.3)'}`,
    textTransform: 'uppercase'
  });

  // --- LÓGICA DE CANVASES ---
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

  const getMousePos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const rgbToHex = (r, g, b) => {
    return "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join("");
  };

  const startDrawing = (e, type) => {
    const canvas = type === "shirt" ? shirtCanvasRef.current : pantsCanvasRef.current;
    const pos = getMousePos(e, canvas);

    if (isEyedropper) {
      const ctx = canvas.getContext("2d");
      const pixel = ctx.getImageData(pos.x, pos.y, 1, 1).data; 
      if (pixel[3] > 0) {
        setBrushColor(rgbToHex(pixel[0], pixel[1], pixel[2]));
      }
      setIsEyedropper(false);
      return;
    }

    const activeLayer = layers?.find((l) => l.id === activeLayerId);
    if (!activeLayer || !activeLayer.visible) return;

    isDrawing.current = true;
    lastPos.current = pos;
    beforePaintData.current = activeLayer.channels[type].ctx.getImageData(0, 0, 585, 559);
  };

  const draw = (e, type) => {
    if (!isDrawing.current) return;
    const activeLayer = layers?.find((l) => l.id === activeLayerId);
    if (!activeLayer || !activeLayer.visible) return;

    const canvas = type === "shirt" ? shirtCanvasRef.current : pantsCanvasRef.current;
    const currentPos = getMousePos(e, canvas);
    const layerCtx = activeLayer.channels[type].ctx;
    const previewCtx = canvas.getContext("2d");

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

    applyStroke(layerCtx);
    applyStroke(previewCtx);
    lastPos.current = currentPos;
  };

  const stopDrawing = (e, type) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const activeLayer = layers?.find((l) => l.id === activeLayerId);
    if (activeLayer && saveHistoryAction && beforePaintData.current) {
      const afterPaintData = activeLayer.channels[type].ctx.getImageData(0, 0, 585, 559);
      saveHistoryAction(activeLayerId, type, beforePaintData.current, afterPaintData);
    }
  };

  const downloadTexture = (type) => {
    const canvas = finalComposition[type]?.canvas;
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `roblox_${type}.png`;
    link.click();
  };

  const handleImportClick = (type) => {
    activeType.current = type;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (img.width !== 585 || img.height !== 559) {
          alert("Erro: Dimensões inválidas (585x559 obrigatório)");
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

  const TemplateSection = ({ type, canvasRef, label }) => (
    <article style={glassCardStyle}>
      <div className="px-3 py-1 bg-black bg-opacity-40 d-flex justify-content-between align-items-center">
        <span style={{ fontSize: '9px', fontWeight: '800', color: '#00E5FF', letterSpacing: '1.5px' }}>
          {label}
        </span>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00E5FF', boxShadow: '0 0 5px #00E5FF' }}></div>
      </div>
      
      <div className="p-2">
        <div style={canvasContainerStyle}>
          <canvas
            ref={canvasRef}
            width={585}
            height={559}
            className="w-100 d-block"
            style={{ cursor: isEyedropper ? "copy" : "crosshair", touchAction: "none", height: '140px', objectFit: 'contain' }}
            onPointerDown={(e) => startDrawing(e, type)}
            onPointerMove={(e) => draw(e, type)}
            onPointerUp={(e) => stopDrawing(e, type)}
            onPointerLeave={(e) => stopDrawing(e, type)}
          />
        </div>
      </div>

      <div className="px-2 pb-2 d-flex gap-2">
        <button 
          style={{ ...actionBtnStyle(false), flex: 1 }} 
          onClick={() => handleImportClick(type)}
        >
          Import
        </button>
        <button 
          style={{ ...actionBtnStyle(true), flex: 2 }} 
          onClick={() => downloadTexture(type)}
        >
          Download PNG
        </button>
      </div>
    </article>
  );

  return (
    <section className="position-fixed overflow-y-auto custom-scrollbar-y" style={sidebarStyle}>
      <input type="file" ref={fileInputRef} className="d-none" accept="image/png, image/jpeg" onChange={handleFileChange} />
      
      <TemplateSection type="shirt" canvasRef={shirtCanvasRef} label="SHIRT TEMPLATE" />
      <TemplateSection type="pants" canvasRef={pantsCanvasRef} label="PANTS TEMPLATE" />

      <style>{`
        .custom-scrollbar-y::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar-y::-webkit-scrollbar-thumb { background: rgba(0, 229, 255, 0.2); border-radius: 10px; }
      `}</style>
    </section>
  );
};

export default Preview;