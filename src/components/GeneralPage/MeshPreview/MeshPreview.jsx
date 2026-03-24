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
  const mainCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const beforePaintData = useRef(null);

  const CANVAS_SIZE = 1024;

  // --- ESTILOS CYBER HUD ---
  const glassPanelStyle = {
    top: '75px',
    right: '20px',
    width: '280px',
    zIndex: 1020,
    background: 'rgba(10, 10, 10, 0.8)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    maxHeight: 'calc(100vh - 430px)', // Evita colidir com o LayerPanel no rodapé
    display: 'flex',
    flexDirection: 'column'
  };

  const checkerboardStyle = {
    position: 'relative',
    backgroundColor: '#1a1a1a',
    backgroundImage: `
      linear-gradient(45deg, #252525 25%, transparent 25%),
      linear-gradient(-45deg, #252525 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #252525 75%),
      linear-gradient(-45deg, transparent 75%, #252525 75%)
    `,
    backgroundSize: '12px 12px',
    backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
    border: '1px solid rgba(0, 229, 255, 0.2)',
    borderRadius: '12px',
    overflow: 'hidden'
  };

  // --- LÓGICA DE SINCRONIZAÇÃO E PINTURA ---
  useEffect(() => {
    if (!finalComposition || !finalComposition.main) return;

    if (mainCanvasRef.current && finalComposition.main.canvas) {
      const ctx = mainCanvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.drawImage(finalComposition.main.canvas, 0, 0);
    }
  }, [finalComposition, triggerTextureUpdate]);

  const getMousePos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const rgbToHex = (r, g, b) => {
    return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join("");
  };

  const startDrawing = (e) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;

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

    const ctx = activeLayer.channels.main.ctx;
    beforePaintData.current = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;

    const activeLayer = layers?.find((l) => l.id === activeLayerId);
    if (!activeLayer || !activeLayer.visible) return;

    const canvas = mainCanvasRef.current;
    const currentPos = getMousePos(e, canvas);

    const layerCtx = activeLayer.channels.main.ctx;
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

  const stopDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    const activeLayer = layers?.find((l) => l.id === activeLayerId);

    if (activeLayer && saveHistoryAction && beforePaintData.current) {
      const ctx = activeLayer.channels.main.ctx;
      const afterPaintData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      saveHistoryAction(activeLayerId, beforePaintData.current, afterPaintData);
      beforePaintData.current = null;
    }

    if (onPaintEnd) onPaintEnd();
  };

  const downloadTexture = () => {
    const canvas = finalComposition.main?.canvas;
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `mesh_texture_albedo.png`;
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
        if (img.width !== CANVAS_SIZE || img.height !== CANVAS_SIZE) {
          console.warn(`Redimensionando textura importada para ${CANVAS_SIZE}x${CANVAS_SIZE}`);
        }
        importTemplate("main", event.target.result);
        setTriggerTextureUpdate((prev) => prev + 1);
        if (onPaintEnd) onPaintEnd();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <section style={glassPanelStyle} className="position-fixed shadow-lg overflow-hidden">
      <input
        type="file"
        ref={fileInputRef}
        className="d-none"
        accept="image/png, image/jpeg"
        onChange={handleFileChange}
      />

      {/* HEADER DA TEXTURA */}
      <div className="px-3 py-2 bg-black bg-opacity-30 d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-20">
        <span style={{ fontSize: '10px', fontWeight: '800', color: '#00E5FF', letterSpacing: '1.5px' }}>
          TEXTURE PREVIEW
        </span>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00E5FF', boxShadow: '0 0 8px #00E5FF' }}></div>
      </div>

      {/* ÁREA DO CANVAS (CHECKERBOARD) */}
      <div className="p-2 flex-grow-1 overflow-auto custom-scrollbar-y">
        <div style={checkerboardStyle}>
          <canvas
            ref={mainCanvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="w-100 d-block"
            style={{
              cursor: isEyedropper ? "copy" : "crosshair",
              touchAction: "none",
              maxHeight: "35vh",
              objectFit: "contain",
            }}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
          />
        </div>
      </div>

      {/* BOTÕES DE AÇÃO */}
      <div className="p-2 d-flex gap-2 border-top border-secondary border-opacity-10">
        <button
          onClick={handleImportClick}
          className="btn btn-sm flex-fill fw-bold rounded-3"
          style={{
            fontSize: '11px',
            color: '#00E5FF',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            background: 'rgba(0, 229, 255, 0.05)'
          }}
        >
          Import
        </button>
        <button
          onClick={downloadTexture}
          className="btn btn-sm flex-fill fw-bold rounded-3 text-black"
          style={{
            fontSize: '11px',
            background: '#00E5FF',
            boxShadow: '0 0 10px rgba(0, 229, 255, 0.2)'
          }}
        >
          Export PNG
        </button>
      </div>

      <style>{`
        .custom-scrollbar-y::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar-y::-webkit-scrollbar-thumb { background: rgba(0, 229, 255, 0.2); border-radius: 10px; }
      `}</style>
    </section>
  );
};

export default MeshPreview;