import styles from "./LeftToolbar.module.scss";
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
  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.group}>
          <button
            className={
              styles.toolBtn + " " + (isPaintMode ? styles.active : "")
            }
            onClick={() => {
              setIsPaintMode(!isPaintMode);
              setIsBucketMode(false);
            }}
          >
            Pi
          </button>
          <button
            onClick={() => {
              setIsEraser(!isEraser);
            }}
            className={styles.toolBtn + " " + (isEraser ? styles.active : "")}
          >
            B
          </button>
          <button
            onClick={() => {
              setIsBucketMode(!isBucketMode);
              setIsPaintMode(false);
            }}
            className={
              styles.toolBtn + " " + (isBucketMode ? styles.active : "")
            }
          >
            🎨
          </button>

          <>
            <input
                      className={styles.colorInput}

              type="color"
              value={brushColor}
              onChange={(e) => {
                setBrushColor(e.target.value);
                setBrushTexture(null);
              }}
            />
          </>

          <input
          className={styles.colorInput}
            type="color"
            value={bodyColor}
            onChange={(e) => {
              setBodyColor(e.target.value);
            }}
          />
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

        <button
          onClick={() => setIsMirrorEnabled(!isMirrorEnabled)}
          className={
            styles.toolBtn + " " + (isMirrorEnabled ? styles.active : "")
          }
        >
          🪞
        </button>
        <button
          onClick={() => setWrapMode(!isWrapMode)}
          className={styles.toolBtn + " " + (isWrapMode ? styles.active : "")}
        >
          -
        </button>
        <button
          className={styles.toolBtn + " " + (isEyedropper ? styles.active : "")}
          onClick={() => {
            setIsEyedropper(!isEyedropper);
            setIsEraser(false);
            setIsBucketMode(false);
          }}
          title="Conta-gotas (Copiar Cor)"
        >
          💉
        </button>
          </div>
      </div>
    </>
  );
};

export default LeftToolbar;
