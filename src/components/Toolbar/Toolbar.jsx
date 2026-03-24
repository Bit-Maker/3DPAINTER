import { lightingProfiles, updateSceneLighting } from "../../utils/3DHelper";
import { shadings, setShader, getShader, setShaderOpacity } from "../../utils/shadingHelper";
import { useState } from "react";
import { Link } from "react-router-dom";

const Toolbar = ({
  brushSize,
  setBrushSize,
  brushOpacity,
  setBrushOpacity,
  handleClear,
  handleUndo,
  scene,
  myAmbLight,
  myDirLight,
  handleRedo,
  isAnimating,
  setIsAnimating,
  lightingMode,
  setLightingMode,
  handleAutoUV,
  shadingOpacity,
  setShadingOpacity,
  NewTemplate
}) => {
  const [openShadingMenu, setOpenShadingMenu] = useState(false);
  const [, setSelectedShading] = useState("none");

  // Estilos reutilizáveis para manter o código limpo
  const glassStyle = {
    background: "rgba(10, 10, 10, 0.8)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    zIndex: 2000
  };

  const neonButtonStyle = (active, color = "#00E5FF") => ({
    border: `1px solid ${active ? color : "rgba(255,255,255,0.1)"}`,
    backgroundColor: active ? "rgba(0, 229, 255, 0.1)" : "transparent",
    color: active ? color : "#fff",
    transition: "all 0.3s ease",
    boxShadow: active ? `0 0 10px ${color}44` : "none"
  });

  return (
    <header style={glassStyle} className="position-fixed top-0 start-0 end-0">
      <nav className="navbar navbar-dark py-2">
        <div className="container-fluid flex-nowrap align-items-center gap-3 overflow-x-auto custom-scrollbar-x pb-1">
          
          {/* LOGO REDUZIDA PARA O EDITOR */}
          <Link className="navbar-brand fw-bold fs-5 m-0 p-0 text-white" to="/">
            Blox<span style={{ color: "#00E5FF" }}>Tailor</span>
          </Link>

          <div className="vr text-white opacity-25 mx-2"></div>

          {/* CONTROLES DE PINCEL */}
          <div className="d-flex align-items-center gap-4 flex-grow-1">
            
            {/* Tamanho do Pincel */}
            <div className="d-flex flex-column" style={{ minWidth: "140px" }}>
              <div className="d-flex justify-content-between mb-1">
                <label className="small text-uppercase fw-bold opacity-50" style={{ fontSize: "9px", letterSpacing: "1px" }}>Size</label>
                <span className="badge p-0" style={{ color: "#00E5FF", fontSize: "10px" }}>{brushSize}px</span>
              </div>
              <input
                type="range"
                className="form-range custom-slider"
                min="1" max="500"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
              />
            </div>

            {/* Opacidade do Pincel */}
            <div className="d-flex flex-column" style={{ minWidth: "140px" }}>
              <div className="d-flex justify-content-between mb-1">
                <label className="small text-uppercase fw-bold opacity-50" style={{ fontSize: "9px", letterSpacing: "1px" }}>Opacity</label>
                <span className="badge p-0" style={{ color: "#FF007A", fontSize: "10px" }}>{Math.round(brushOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                className="form-range custom-slider-pink"
                min="0.01" max="1" step="0.01"
                value={brushOpacity}
                onChange={(e) => setBrushOpacity(parseFloat(e.target.value))}
              />
            </div>

            {/* BOTÃO DE SHADING COM DROPDOWN CUSTOMIZADO */}
            <div className="position-relative">
              <button
                onClick={() => setOpenShadingMenu(!openShadingMenu)}
                className="btn btn-sm px-3 rounded-pill fw-bold"
                style={neonButtonStyle(openShadingMenu, "#7928CA")}
              >
                ✨ Shading
              </button>

              {openShadingMenu && (
                <div 
                  className="position-fixed mt-5 p-3 rounded-4 shadow-lg border"
                  style={{ 
                    background: "#0F0F0F", 
                    borderColor: "rgba(121, 40, 202, 0.5)",
                    width: "280px",
                    zIndex: 3000
                  }}
                >
                  <label className="small text-white opacity-50 mb-2 d-block">Select Template:</label>
                  <div className="d-grid grid-cols-3 gap-2 overflow-y-auto" style={{ maxHeight: "200px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
                    {shadings.map((fileUrl) => (
                      <div 
                        key={fileUrl}
                        onClick={(e) => {
                          e.stopPropagation();
                          const finalUrl = process.env.PUBLIC_URL + fileUrl;
                          setSelectedShading(finalUrl);
                          setShader(finalUrl);
                          handleAutoUV();
                        }}
                        className="rounded-3  overflow-hidden position-relative"
                        style={{ 
                          height: "60px", 
                          cursor: "pointer",
                          background: "white",
                          border: getShader() === fileUrl ? "2px solid #00E5FF" : "1px solid rgba(255,255,255,0.1)"
                        }}
                      >
                        {fileUrl === "none" ? (
                          <div className="w-100 h-100 d-flex align-items-center justify-content-center small text-muted">Empty</div>
                        ) : (
                          <img src={process.env.PUBLIC_URL + fileUrl} alt="Shader" className="w-100 h-100 object-fit-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-3 border-top pt-2 border-secondary">
                    <label className="small opacity-50 mb-1 d-block">Intensity:</label>
                    <input
                      type="range"
                      className="w-100 custom-slider"
                      min="0.01" max="1" step="0.01"
                      value={shadingOpacity}
                      onChange={(e) => {
                        setShadingOpacity(parseFloat(e.target.value));
                        setShaderOpacity(parseFloat(e.target.value));
                        handleAutoUV();
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AÇÕES (UNDO, REDO, CLEAR) */}
          <div className="d-flex align-items-center gap-2">
            <div className="btn-group bg-dark rounded-pill p-1 border border-secondary border-opacity-25">
              <button onClick={handleUndo} className="btn btn-sm btn-dark rounded-pill border-0 px-3" title="Undo">↩</button>
              <button onClick={handleRedo} className="btn btn-sm btn-dark rounded-pill border-0 px-3" title="Redo">↪</button>
            </div>
            
            <button onClick={handleClear} className="btn btn-sm px-3 rounded-pill fw-bold btn-outline-danger border-opacity-25" style={{ fontSize: "12px" }}>
              Clear
            </button>
            <button onClick={NewTemplate} className="btn btn-sm px-3 rounded-pill fw-bold text-black" style={{ background: "#00E5FF", fontSize: "12px" }}>
              New Template
            </button>
          </div>

          <div className="vr text-white opacity-25 mx-2"></div>

          {/* ILUMINAÇÃO E ANIMAÇÃO */}
          <div className="d-flex align-items-center gap-2">
            <div className="btn-group p-1 bg-dark rounded-pill border border-secondary border-opacity-25 shadow-sm">
              {Object.keys(lightingProfiles).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    updateSceneLighting(scene, myAmbLight, myDirLight, mode);
                    setLightingMode(mode);
                  }}
                  className={`btn btn-sm rounded-pill border-0 px-2 ${mode === lightingMode ? "bg-secondary bg-opacity-50" : ""}`}
                >
                  {mode === "midday" && "☀️"}
                  {mode === "sunset" && "🌅"}
                  {mode === "night" && "🌑"}
                  {mode === "studio" && "🛠️"}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center"
              style={{ 
                width: "32px", height: "32px", 
                backgroundColor: isAnimating ? "#FF007A" : "rgba(255,255,255,0.1)",
                color: "#fff", border: "none"
              }}
            >
              {isAnimating ? "⏸" : "▶"}
            </button>
          </div>
        </div>
      </nav>

      {/* CSS INLINE PARA CUSTOMIZAR OS SLIDERS (Importante!) */}
      <style>{`
        .custom-slider::-webkit-slider-runnable-track { background: rgba(255,255,255,0.1); height: 4px; border-radius: 2px; }
        .custom-slider::-webkit-slider-thumb { -webkit-appearance: none; height: 14px; width: 14px; border-radius: 50%; background: #00E5FF; margin-top: -5px; box-shadow: 0 0 8px #00E5FF; }
        
        .custom-slider-pink::-webkit-slider-runnable-track { background: rgba(255,255,255,0.1); height: 4px; border-radius: 2px; }
        .custom-slider-pink::-webkit-slider-thumb { -webkit-appearance: none; height: 14px; width: 14px; border-radius: 50%; background: #FF007A; margin-top: -5px; box-shadow: 0 0 8px #FF007A; }
      `}</style>
    </header>
  );
};

export default Toolbar;