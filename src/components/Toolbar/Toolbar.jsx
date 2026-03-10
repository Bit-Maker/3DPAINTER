import styles from "./Toolbar.module.scss";
import { lightingProfiles, updateSceneLighting } from "../../utils/3DHelper";
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
}) => {
  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.group}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <label style={{ fontSize: "10px", color: "#888" }}>
              Tamanho: {brushSize}px
            </label>
          </div>
          <input
            className={styles.input}
            type="range"
            min="1"
            max="500"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
          />
        </div>

            <div className={styles.group}>
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
            className={styles.input}
            type="range"
            min="0.01"
            max="1"
            step="0.01"
            value={brushOpacity}
            onChange={(e) => setBrushOpacity(parseFloat(e.target.value))}
          />
        </div>

        <div className={styles.group}>
          <div style={{ display: "flex", gap: "5px" }}>
            <button className={styles.toolBtn} onClick={handleUndo}>
              ↩️
            </button>
            <button className={styles.toolBtn} onClick={handleRedo}>
              ↪️
            </button>
          </div>
        </div>

        <div className={styles.group}>
          <button className={styles.toolBtn} onClick={handleClear}>
            Clear
          </button>
        </div>
        {/*    <div className="import-roblox">
          <input
            placeholder="ID da Roupa (Ex: 123456)"
            value={robloxInput}
            onChange={(e) => setRobloxInput(e.target.value)}
          />
          <button onClick={() => importRobloxTemplate(robloxInput)}>
            Importar do Roblox
          </button>
        </div>
        */}
        <div className={styles.lightingtoolbar}>
          {Object.keys(lightingProfiles).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                updateSceneLighting(scene, myAmbLight, myDirLight, mode);
                setLightingMode(mode);
              }}
              className={
                styles.toolBtn +
                " " +
                (mode === lightingMode ? styles.active : "")
              }
              title={`Testar em modo ${mode}`}
            >
              {mode === "midday" && "☀️"}
              {mode === "sunset" && "🌅"}
              {mode === "night" && "🌑"}
              {mode === "studio" && "🛠️"}
            </button>
          ))}
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className={
              styles.toolBtn + " " + (isAnimating ? styles.active : "")
            }
          >
            {isAnimating ? "⏸️" : "▶️"}
          </button>
        </div>
      </div>
    </>
  );
};

export default Toolbar;
