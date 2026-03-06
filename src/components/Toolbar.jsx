import "./Toolbar.css";

const Toolbar = ({
  activeChannel,
  brushColor,
  setBrushColor,
  brushSize,
  setBrushSize,
  brushOpacity,
  setBrushOpacity,
  isEraser,
 isBucketMode,
  setIsEraser,
  setIsBucketMode,
  setBrushTexture,
  handleClear,
  handleUndo,
  handleRedo,
  model
}) => {
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setBrushTexture(URL.createObjectURL(file));
  };

  return (
    <>
      <div className="ui-panel">
        <h3>Cloths Maker</h3>
        <div className="group">
          <label>2. Pincel</label>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <label style={{ fontSize: "10px", color: "#888" }}>
              Tamanho: {brushSize}px
            </label>
          </div>
          <input
            type="range"
            min="1"
            max="500"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "5px",
            }}
          >
            <label style={{ fontSize: "10px", color: "#888" }}>
              Força: {Math.round(brushOpacity * 100)}%
            </label>
          </div>
          <input
            type="range"
            min="0.01"
            max="1"
            step="0.01"
            value={brushOpacity}
            onChange={(e) => setBrushOpacity(parseFloat(e.target.value))}
          />
        </div>

        <div className="group">
          <label>3. Estilo</label>

          <button
            onClick={() => setIsEraser(!isEraser)}
            style={{
              background: isEraser ? "#ffeb3b" : "#444",
              color: isEraser ? "#000" : "#fff",
              marginBottom: "10px",
            }}
          >
            {isEraser ? "🧽 Borracha ATIVA" : "🖌️ Pincel Normal"}
          </button>
          <button
            onClick={() => setIsBucketMode(!isBucketMode)}
            style={{
              background: isBucketMode ? "#ffeb3b" : "#444",
              color: isBucketMode ? "#000" : "#fff",
              marginBottom: "10px",
            }}
          >
            {isBucketMode ? "🎨 Balde de tinta ATIVO" : "🖌️ Balde de tinta DESATIVO"}
          </button>

          {!isEraser && (
            <>
              <input
                type="color"
                value={brushColor}
                onChange={(e) => {
                  setBrushColor(e.target.value);
                  setBrushTexture(null);
                }}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ marginTop: "5px" }}
              />
            </>
          )}
        </div>
        {activeChannel === "normal" && (
          <p style={{ fontSize: "9px", color: "#673AB7" }}>
            Pinte com cores diferentes de #8080ff para criar relevo.
          </p>
        )}

        <div className="group">
          <label>Histórico</label>
          <div style={{ display: "flex", gap: "5px" }}>
            <button onClick={handleUndo}>↩️ Undo (Ctrl+Z)</button>
            <button onClick={handleRedo}>↪️ Redo (Ctrl+Y)</button>
          </div>
          <button
            onClick={handleClear}
            style={{ marginTop: "5px", background: "#555" }}
          >
            Limpar Tudo
          </button>
        </div>
        <div className="bodyParts">
          <label>Partes do corpo</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {model?.name}
          </div>
        </div>
      </div>
    </>
  );
};

export default Toolbar;
