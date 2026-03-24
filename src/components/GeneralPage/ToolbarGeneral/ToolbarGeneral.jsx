import { lightingProfiles, updateSceneLighting } from "../../../utils/3DHelper";
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
  lightingMode,
  setLightingMode,
}) => {

  // Estilos reutilizáveis para manter o código limpo
  const glassStyle = {
    background: "rgba(10, 10, 10, 0.8)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    zIndex: 2000
  };
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
            <button
                  className="btn btn-sm px-3 rounded-pill fw-bold btn-outline-primary border-opacity-25"
                    onClick={() =>
                      document.getElementById("model-upload").click()
                    }
                  >
                    Carregar Modelo (.OBJ / .FBX)
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