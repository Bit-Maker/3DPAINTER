import "./Toolbar.css";
import { useState } from "react";
import { lightingProfiles, updateSceneLighting } from "../../utils/3DHelper";
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
 bodyColor,
 setBodyColor,
  setIsEraser,
  isWrapMode,
  setWrapMode,
  setIsBucketMode,
  setBrushTexture,
  setIsMirrorEnabled,
  isMirrorEnabled,
  handleClear,
  handleUndo,
  scene,
  myAmbLight,
  myDirLight,
  handleRedo,
  importRobloxTemplate,
  isEyedropper,
  setIsEyedropper,
}) => {
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setBrushTexture(URL.createObjectURL(file));
  };
  const [robloxInput, setRobloxInput] = useState("");

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
              Opacidade: {Math.round(brushOpacity * 100)}%
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
          <input
                type="color"
                value={bodyColor}
                onChange={(e) => {
                  setBodyColor(e.target.value);
                }}
              />
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
      <div className="import-roblox">
  <input 
    placeholder="ID da Roupa (Ex: 123456)" 
    value={robloxInput}
    onChange={(e) => setRobloxInput(e.target.value)}
  />
  <button onClick={() => importRobloxTemplate(robloxInput)}>
    Importar do Roblox
  </button>
</div>

<button 
  onClick={() => setIsMirrorEnabled(!isMirrorEnabled)}
  style={{
    backgroundColor: isMirrorEnabled ? '#4CAF50' : '#333',
    color: 'white',
    padding: '8px',
    borderRadius: '4px',
    cursor: 'pointer',
    border: 'none'
  }}
>  
    {isMirrorEnabled ? "Espelhamento Ativado" : "Espelhamento desativado"}

</button>
<button 
  onClick={() => setWrapMode(!isWrapMode)}
  style={{
    backgroundColor: isWrapMode ? '#4CAF50' : '#333',
    color: 'white',
    padding: '8px',
    borderRadius: '4px',
    cursor: 'pointer',
    border: 'none'
  }}
>
  {isWrapMode ? "🔄 Wrap Mode Ativo" : "Standard Mode"}
</button>
// Adicione junto com os botões de Pincel, Balde e Borracha
<button 
  className={`tool-btn ${isEyedropper ? 'active' : ''}`}
  onClick={() => {
    setIsEyedropper(!isEyedropper);
    setIsEraser(false);
    setIsBucketMode(false);
  }}
  style={{
    backgroundColor: isEyedropper ? '#4CAF50' : '#333',
    color: 'white',
    padding: '8px',
    borderRadius: '4px',
    cursor: 'pointer',
    border: 'none'
  }}
  title="Conta-gotas (Copiar Cor)"
>
  Pipeta 💉
</button>
<div className="lighting-toolbar">
  {Object.keys(lightingProfiles).map((mode) => (
    <button 
      key={mode} 
      onClick={() => updateSceneLighting(scene, myAmbLight, myDirLight, mode)}
      title={`Testar em modo ${mode}`}
    >
      {mode === 'midday' && '☀️'}
      {mode === 'sunset' && '🌅'}
      {mode === 'night' && '🌑'}
      {mode === 'studio' && '🛠️'}
    </button>
  ))}
</div>
      </div>
    </>
  );
};

export default Toolbar;
