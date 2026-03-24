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
  shadingOpacity,
  setShadingOpacity,
  NewTemplate,
}) => {
  const [openShadingMenu, setOpenShadingMenu] = useState(false);

  const [, setSelectedShading] = useState("none");
  return (
    <>
      <header
        style={{ zIndex: 2000 }}
        className="position-fixed top-0 start-0 end-0"
      >
        <nav className="navbar navbar-dark bg-dark border-bottom border-secondary shadow-sm py-2">
          <div className="container-fluid flex-nowrap align-items-center gap-3 overflow-x-auto custom-scrollbar-x pb-1">
            <a
              className="navbar-brand d-flex align-items-center flex-shrink-0 m-0"
              href="/"
            ></a>

            <div className="d-flex align-items-center flex-nowrap gap-3 m-0 p-0 flex-grow-1">
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
                    Size:
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
                    Opacity:
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

              <div className="vr text-secondary flex-shrink-0"></div>

              <div className="d-flex gap-1 flex-shrink-0">
                <button
                  className="btn btn-outline-light btn-sm px-2"
                  onClick={handleUndo}
                  title="Undo"
                  aria-label="Undo"
                >
                  <span aria-hidden="true">↩️</span>
                </button>
                <button
                  className="btn btn-outline-light btn-sm px-2"
                  onClick={handleRedo}
                  title="Redo"
                  aria-label="Redo"
                >
                  <span aria-hidden="true">↪️</span>
                </button>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={handleClear}
                >
                  Clear
                </button>
                <button
                  className="btn btn-outline-warning btn-sm"
                  onClick={NewTemplate}
                >
                  New Template
                </button>
                <div className="import-section">
                  <button
                  className="btn btn-outline-primary"
                    style={{ zIndex: "10000", position: "absolute" }}
                    onClick={() =>
                      document.getElementById("model-upload").click()
                    }
                  >
                    Carregar Modelo (.OBJ / .FBX)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Toolbar;
