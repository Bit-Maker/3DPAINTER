const LeftToolbar = ({
  brushColor,
  setBrushColor,
  isEraser,
  isBucketMode,
  bodyColor,
  setBodyColor,
  setIsEraser,
  isWrapMode,
  setWrapMode,
  setIsBucketMode,
  setBrushTexture,
  setIsMirrorEnabled,
  isMirrorEnabled,
  isEyedropper,
  setIsEyedropper,
  isPaintMode,
  setIsPaintMode,
}) => {
  
  // Estilo do painel lateral (Glassmorphism)
  const glassSidebarStyle = {
    width: "70px",
    background: "rgba(10, 10, 10, 0.8)",
    backdropFilter: "blur(12px)",
    borderRight: "1px solid rgba(255, 255, 255, 0.1)",
    zIndex: 1030,
    top: "56px", // Alinhado logo abaixo da Toolbar superior
    paddingTop: "20px"
  };

  // Helper para padronizar os botões de ferramentas
  const toolBtnStyle = (active, color = "#00E5FF") => ({
    width: "42px",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px", // Squircle look
    border: `1px solid ${active ? color : "rgba(255,255,255,0.05)"}`,
    backgroundColor: active ? `${color}1A` : "rgba(255,255,255,0.02)",
    color: active ? color : "#fff",
    transition: "all 0.3s ease",
    boxShadow: active ? `0 0 12px ${color}44` : "none",
    fontSize: "18px",
    cursor: "pointer"
  });

  // Helper para os seletores de cor customizados
  const colorPickerWrapperStyle = (colorValue) => ({
    width: "38px", 
    height: "38px",
    backgroundColor: colorValue,
    border: "2px solid rgba(255,255,255,0.2)",
    boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
    position: "relative",
    overflow: "hidden",
    cursor: "pointer"
  });

  return (
    <aside
      className="position-fixed start-0 vh-100 d-flex flex-column align-items-center overflow-y-auto custom-scrollbar-y"
      style={glassSidebarStyle}
      aria-label="Paint Tool Bar"
    >
      <nav className="d-flex flex-column gap-4 w-100 align-items-center pb-4" role="toolbar">
        
        {/* GRUPO 1: PINTURA E PREENCHIMENTO */}
        <div className="d-flex flex-column gap-2 w-100 align-items-center position-relative">
          <button
            type="button"
            style={toolBtnStyle(isPaintMode, "#00E5FF")}
            onClick={() => {
              setIsPaintMode(!isPaintMode);
              setIsBucketMode(false);
              setWrapMode(false);
            }}
            title="Brush (B)"
          >
            <span className="fw-bold fs-6">B</span>
          </button>

          <button
            type="button"
            style={toolBtnStyle(isBucketMode, "#00E5FF")}
            onClick={() => {
              setIsBucketMode(!isBucketMode);
              setIsPaintMode(false);
              setWrapMode(false);
            }}
            title="Color Fill"
          >
            🎨
          </button>

          <button
            type="button"
            style={toolBtnStyle(isWrapMode, "#7928CA")}
            onClick={() => {
              setWrapMode(!isWrapMode);
              setIsPaintMode(false);
              setIsBucketMode(false);
            }}
            title="Wrap Mode"
          >
            ↔️
          </button>
          
          {/* Divisória sutil */}
          <div className="w-50 border-bottom border-secondary opacity-25 mt-2"></div>
        </div>

        {/* GRUPO 2: SELETORES DE CORES */}
        <div className="d-flex flex-column gap-3 w-100 align-items-center">
          
          {/* Brush Color */}
          <div className="d-flex flex-column align-items-center">
            <div className="rounded-circle" style={colorPickerWrapperStyle(brushColor)} title="Brush Color">
              <input
                type="color"
                value={brushColor}
                onChange={(e) => {
                  setBrushColor(e.target.value);
                  setBrushTexture(null);
                }}
                className="position-absolute w-100 h-100"
                style={{ opacity: 0, top: 0, left: 0, cursor: "pointer" }}
              />
            </div>
            <span className="text-white opacity-50 mt-1 fw-bold" style={{ fontSize: "9px", letterSpacing: "1px" }}>BRUSH</span>
          </div>

          {/* Body Color */}
          <div className="d-flex flex-column align-items-center">
            <div className="rounded-circle" style={colorPickerWrapperStyle(bodyColor)} title="Body Color">
              <input
                type="color"
                value={bodyColor}
                onChange={(e) => setBodyColor(e.target.value)}
                className="position-absolute w-100 h-100"
                style={{ opacity: 0, top: 0, left: 0, cursor: "pointer" }}
              />
            </div>
            <span className="text-white opacity-50 mt-1 fw-bold" style={{ fontSize: "9px", letterSpacing: "1px" }}>BODY</span>
          </div>

          {/* Divisória sutil */}
          <div className="w-50 border-bottom border-secondary opacity-25 mt-1"></div>
        </div>

        {/* GRUPO 3: UTILITÁRIOS E MODIFICADORES */}
        <div className="d-flex flex-column gap-2 w-100 align-items-center">
          <button
            type="button"
            style={toolBtnStyle(isEraser, "#FF007A")} // Rosa neon para a borracha
            onClick={() => setIsEraser(!isEraser)}
            title="Eraser (E)"
          >
            <span className="fw-bold fs-6">E</span>
          </button>

          <button
            type="button"
            style={toolBtnStyle(isMirrorEnabled, "#7928CA")} // Roxo neon
            onClick={() => setIsMirrorEnabled(!isMirrorEnabled)}
            title="Mirror Mode"
          >
            🪞
          </button>

          <button
            type="button"
            style={toolBtnStyle(isEyedropper, "#00E5FF")}
            onClick={() => {
              setIsEyedropper(!isEyedropper);
              setIsEraser(false);
              setIsBucketMode(false);
            }}
            title="Eye Dropper"
          >
            💉
          </button>
        </div>

      </nav>

      {/* CSS embutido para esconder a scrollbar lateral e manter o visual limpo */}
      <style>{`
        .custom-scrollbar-y::-webkit-scrollbar { width: 0px; background: transparent; }
      `}</style>
    </aside>
  );
};

export default LeftToolbar;