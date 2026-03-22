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
  isTextMode,
  setIsTextMode
}) => {
  return (
    <>
      <aside
        className="bg-dark border-end border-secondary d-flex flex-column align-items-center py-4 vh-100 position-fixed start-1 overflow-auto"
        style={{ zIndex: 1030, top: "56px" }}
        aria-label="Paint Tool Bar"
      >
        <nav
          className="d-flex flex-column gap-3 w-100 px-2"
          role="toolbar"
          aria-orientation="vertical"
        >
          {/* Grupo de Ferramentas de Pintura */}
          <div
            className="d-flex flex-column gap-2 border-bottom border-secondary pb-3"
            role="group"
            aria-label="Painting Modes"
          >
            <button
              type="button"
              className={`btn btn-sm ${isPaintMode ? "btn-primary" : "btn-outline-light"}`}
              onClick={() => {
                setIsPaintMode(!isPaintMode);
                setIsBucketMode(false);
                setWrapMode(false);
                setIsTextMode(false);
              }}
              title="Brush(B)"
              aria-pressed={isPaintMode}
            >
              <span className="fw-bold">B</span>
            </button>

            <button
              type="button"
              className={`btn btn-sm ${isBucketMode ? "btn-primary" : "btn-outline-light"}`}
              onClick={() => {
                setIsBucketMode(!isBucketMode);
                setIsPaintMode(false);
                setWrapMode(false);
                setIsTextMode(false);
              }}
              title="Color Fill"
              aria-pressed={isBucketMode}
            >
              🎨
            </button>
            <button
              type="button"
              className={`btn btn-sm ${isWrapMode ? "btn-info" : "btn-outline-light"}`}
              onClick={() => {
                setWrapMode(!isWrapMode);
                setIsPaintMode(false);
                setIsBucketMode(false);
                setIsTextMode(false);
              }}
              title="Wrap Mode"
              aria-pressed={isWrapMode}
            >
              ↔️
            </button>
            <button
              type="button"
              className={`btn btn-sm ${isTextMode ? "btn-info" : "btn-outline-light"}`}
              onClick={() => {
                setIsTextMode(!isTextMode)
                setWrapMode(false);
                setIsPaintMode(false);
                setIsBucketMode(false);
              }}
              title="Text Mode"
              aria-pressed={isTextMode}
            >
              T
            </button>
          </div>

          {/* Seletores de Cores */}
          <div className="d-flex flex-column gap-2 border-bottom border-secondary pb-3 align-items-center">
            <div className="text-center">
              <label htmlFor="brushColor" className="visually-hidden">
                Brush Color
              </label>
              <input
                type="color"
                className="form-control form-control-color bg-transparent border-0"
                id="brushColor"
                value={brushColor}
                title="Brush Color"
                onChange={(e) => {
                  setBrushColor(e.target.value);
                  setBrushTexture(null);
                }}
              />
              <small
                className="text-light opacity-50"
                style={{ fontSize: "10px" }}
              >
                Brush
              </small>
            </div>

            <div className="text-center">
              <label htmlFor="bodyColor" className="visually-hidden">
                Body Color
              </label>
              <input
                type="color"
                className="form-control form-control-color bg-transparent border-0"
                id="bodyColor"
                value={bodyColor}
                title="Body Color"
                onChange={(e) => setBodyColor(e.target.value)}
              />
              <small
                className="text-light opacity-50"
                style={{ fontSize: "10px" }}
              >
                Body
              </small>
            </div>
          </div>

          {/* Utilitários e Modificadores */}
          <button
            type="button"
            className={`btn btn-sm ${isEraser ? "btn-primary" : "btn-outline-light"}`}
            onClick={() => setIsEraser(!isEraser)}
            title="Eraser (E)"
            aria-pressed={isEraser}
          >
            <span className="fw-bold">E</span>
          </button>
          <div
            className="d-flex flex-column gap-2"
            role="group"
            aria-label="Utilitaries"
          >
            <button
              type="button"
              className={`btn btn-sm ${isMirrorEnabled ? "btn-info" : "btn-outline-light"}`}
              onClick={() => setIsMirrorEnabled(!isMirrorEnabled)}
              title="Mirror Mode"
              aria-pressed={isMirrorEnabled}
            >
              🪞
            </button>

            <button
              type="button"
              className={`btn btn-sm ${isEyedropper ? "btn-info" : "btn-outline-light"}`}
              onClick={() => {
                setIsEyedropper(!isEyedropper);
                setIsEraser(false);
                setIsBucketMode(false);
              }}
              title="Eye Dropper"
              aria-pressed={isEyedropper}
            >
              💉
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default LeftToolbar;
