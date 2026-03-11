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
     <aside  
  className="bg-dark border-end border-secondary d-flex flex-column align-items-center py-4 vh-100 position-fixed start-1" 
  style={{ zIndex: 1030,top: '56px' }}
  aria-label="Barra de Ferramentas de Desenho"
>
  <nav className="d-flex flex-column gap-3 w-100 px-2" role="toolbar" aria-orientation="vertical">
    
    {/* Grupo de Ferramentas de Pintura */}
    <div className="d-flex flex-column gap-2 border-bottom border-secondary pb-3" role="group" aria-label="Modos de Pintura">
      <button
        type="button"
        className={`btn btn-sm ${isPaintMode ? 'btn-primary' : 'btn-outline-light'}`}
        onClick={() => {
          setIsPaintMode(!isPaintMode);
          setIsBucketMode(false);
        }}
        title="Pincel (P)"
        aria-pressed={isPaintMode}
      >
        <span className="fw-bold">Pi</span>
      </button>

      <button
        type="button"
        className={`btn btn-sm ${isEraser ? 'btn-primary' : 'btn-outline-light'}`}
        onClick={() => setIsEraser(!isEraser)}
        title="Borracha (B)"
        aria-pressed={isEraser}
      >
        <span className="fw-bold">B</span>
      </button>

      <button
        type="button"
        className={`btn btn-sm ${isBucketMode ? 'btn-primary' : 'btn-outline-light'}`}
        onClick={() => {
          setIsBucketMode(!isBucketMode);
          setIsPaintMode(false);
        }}
        title="Balde de Tinta"
        aria-pressed={isBucketMode}
      >
        🎨
      </button>
    </div>

    {/* Seletores de Cores */}
    <div className="d-flex flex-column gap-2 border-bottom border-secondary pb-3 align-items-center">
      <div className="text-center">
        <label htmlFor="brushColor" className="visually-hidden">Cor do Pincel</label>
        <input
          type="color"
          className="form-control form-control-color bg-transparent border-0"
          id="brushColor"
          value={brushColor}
          title="Cor do Pincel"
          onChange={(e) => {
            setBrushColor(e.target.value);
            setBrushTexture(null);
          }}
        />
        <small className="text-light opacity-50" style={{ fontSize: '10px' }}>Pincel</small>
      </div>

      <div className="text-center">
        <label htmlFor="bodyColor" className="visually-hidden">Cor do Corpo</label>
        <input
          type="color"
          className="form-control form-control-color bg-transparent border-0"
          id="bodyColor"
          value={bodyColor}
          title="Cor de Fundo/Corpo"
          onChange={(e) => setBodyColor(e.target.value)}
        />
        <small className="text-light opacity-50" style={{ fontSize: '10px' }}>Corpo</small>
      </div>
    </div>

    {/* Utilitários e Modificadores */}
    <div className="d-flex flex-column gap-2" role="group" aria-label="Utilitários">
      <button
        type="button"
        className={`btn btn-sm ${isMirrorEnabled ? 'btn-info' : 'btn-outline-light'}`}
        onClick={() => setIsMirrorEnabled(!isMirrorEnabled)}
        title="Modo Espelhamento"
        aria-pressed={isMirrorEnabled}
      >
        🪞
      </button>

      <button
        type="button"
        className={`btn btn-sm ${isWrapMode ? 'btn-info' : 'btn-outline-light'}`}
        onClick={() => setWrapMode(!isWrapMode)}
        title="Modo Wrap (Envolver)"
        aria-pressed={isWrapMode}
      >
        ↔️
      </button>

      <button
        type="button"
        className={`btn btn-sm ${isEyedropper ? 'btn-info' : 'btn-outline-light'}`}
        onClick={() => {
          setIsEyedropper(!isEyedropper);
          setIsEraser(false);
          setIsBucketMode(false);
        }}
        title="Conta-gotas (Extrair Cor)"
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
