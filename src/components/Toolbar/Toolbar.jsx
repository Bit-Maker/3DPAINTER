import { lightingProfiles, updateSceneLighting } from "../../utils/3DHelper";
import { shadings, setShader, getShader } from "../../utils/shadingHelper";

import { useState } from "react";
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
}) => {
  const [openShadingMenu, setOpenShadingMenu] = useState(false);

  const [, setSelectedShading] = useState("none"); // "none", "flat", "smooth"
  return (
    <>
      <header
        style={{ zIndex: 2000 }}
        className="position-fixed top-0 start-0 end-0"
      >
        <nav className="navbar navbar-dark bg-dark border-bottom border-secondary shadow-sm py-2">
          {/* Usamos flex-nowrap para impedir que os itens quebrem linha, 
      forçando-os a ficarem na mesma linha e permitindo o scroll horizontal.
    */}
          <div className="container-fluid flex-nowrap align-items-center gap-3 overflow-x-auto custom-scrollbar-x pb-1">
            {/* Branding / Logo - Fixo à esquerda */}
            <a
              className="navbar-brand d-flex align-items-center flex-shrink-0 m-0"
              href="/"
            >
              <span className="fs-6 fw-bold">Editor 3D</span>
            </a>

            {/* Container das Ferramentas - Rola horizontalmente no mobile */}
            <div className="d-flex align-items-center flex-nowrap gap-3 m-0 p-0 flex-grow-1">
              {/* Controle de Tamanho */}
              <div
                className="d-flex flex-column flex-shrink-0"
                style={{ width: "120px" }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <label
                    htmlFor="brushSize"
                    className="form-label small text-light opacity-75 mb-0"
                    style={{ fontSize: "11px" }}
                  >
                    Tamanho:
                  </label>
                  <output
                    className="badge bg-primary ms-1"
                    style={{ fontSize: "10px" }}
                  >
                    {brushSize}px
                  </output>
                </div>
                <input
                  type="range"
                  className="form-range custom-range-dark form-range-sm"
                  id="brushSize"
                  min="1"
                  max="500"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                />
              </div>

              {/* Controle de Opacidade */}
              <div
                className="d-flex flex-column flex-shrink-0"
                style={{ width: "120px" }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <label
                    htmlFor="brushOpacity"
                    className="form-label small text-light opacity-75 mb-0"
                    style={{ fontSize: "11px" }}
                  >
                    Opacidade:
                  </label>
                  <output
                    className="badge bg-primary ms-1"
                    style={{ fontSize: "10px" }}
                  >
                    {Math.round(brushOpacity * 100)}%
                  </output>
                </div>
                <input
                  type="range"
                  className="form-range form-range-sm"
                  id="brushOpacity"
                  min="0.01"
                  max="1"
                  step="0.01"
                  value={brushOpacity}
                  onChange={(e) => setBrushOpacity(parseFloat(e.target.value))}
                />
              </div>

              <div className="d-flex align-items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setOpenShadingMenu(!openShadingMenu)}
                  className={`btn btn-sm px-2 ${openShadingMenu ? "btn-warning" : "btn-outline-light"}`}
                  aria-label={"Sombreamento"}
                >
                  Sombreamento
                  {openShadingMenu && (
                    <div
                      className="position-fixed bg-dark border border-secondary rounded p-1 mt-4 col-2 overflow-y-auto h-50"
                      style={{ zIndex: 1000 }}
                    >
                      {shadings.map((fileUrl) =>
                        fileUrl === "none" ? (
                          <img
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedShading(
                                process.env.PUBLIC_URL + fileUrl,
                              );
                              setShader(process.env.PUBLIC_URL + fileUrl);
                              handleAutoUV();
                            }}
                            className={`img-thumbnail ${getShader() === fileUrl && "border-5 border-primary"}`} 
                            style={{ width: "100px", height: "100px" }}
                          ></img>
                        ) : (
                          <img
                            src={process.env.PUBLIC_URL + fileUrl}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedShading(
                                process.env.PUBLIC_URL + fileUrl,
                              );
                              setShader(process.env.PUBLIC_URL + fileUrl);
                              handleAutoUV();
                            }}
                            alt="Shading Option"
                            className={`img-thumbnail m-1 ${getShader() === fileUrl && "border-5 border-primary"}`}
                            style={{ width: "100px", cursor: "pointer" }}
                          />
                        ),
                      )}
                    </div>
                  )}
                </button>
              </div>

              {/* Divisor Visual (agora visível em todas as telas) */}
              <div className="vr text-secondary flex-shrink-0"></div>

              {/* Ações de Histórico e Limpeza */}
              <div className="d-flex gap-1 flex-shrink-0">
                <button
                  className="btn btn-outline-light btn-sm px-2"
                  onClick={handleUndo}
                  title="Desfazer"
                  aria-label="Desfazer"
                >
                  <span aria-hidden="true">↩️</span>
                </button>
                <button
                  className="btn btn-outline-light btn-sm px-2"
                  onClick={handleRedo}
                  title="Refazer"
                  aria-label="Refazer"
                >
                  <span aria-hidden="true">↪️</span>
                </button>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={handleClear}
                >
                  Limpar
                </button>
              </div>

              <div className="vr text-secondary flex-shrink-0"></div>

              {/* Lado Direito: Iluminação e Animação */}
              <div className="d-flex align-items-center gap-2 flex-shrink-0">
                <div
                  className="btn-group"
                  role="group"
                  aria-label="Modos de iluminação"
                >
                  {Object.keys(lightingProfiles).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        updateSceneLighting(
                          scene,
                          myAmbLight,
                          myDirLight,
                          mode,
                        );
                        setLightingMode(mode);
                      }}
                      className={`btn btn-sm btn-dark border-secondary px-2 ${mode === lightingMode ? "active border-primary" : ""}`}
                      title={`Modo ${mode}`}
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
                  className={`btn btn-sm px-2 ${isAnimating ? "btn-warning" : "btn-outline-warning"}`}
                  aria-label={isAnimating ? "Pausar" : "Play"}
                >
                  {isAnimating ? "⏸️" : "▶️"}
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Toolbar;
