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

    
  <header style={{zIndex: 2000}} className="position-fixed top-0 start-0 end-0">
  <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary shadow-sm py-2">
    <div className="container-fluid">
      {/* Branding / Logo (Opcional para SEO) */}
      <a className="navbar-brand d-flex align-items-center" href="/">
        <span className="fs-5 fw-bold">Editor 3D</span>
      </a>

      {/* Botão para Mobile (Toggle) */}
      <button 
        className="navbar-toggler" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#toolbarNavbar" 
        aria-controls="toolbarNavbar" 
        aria-expanded="false" 
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      {/* Conteúdo da Navbar */}
      <div className="collapse navbar-collapse" id="toolbarNavbar">
        <ul className="navbar-nav me-auto mb-2 mb-lg-0 align-items-lg-center gap-lg-4">
          
          {/* Controle de Tamanho */}
          <li className="nav-item">
            <div className="d-flex flex-column" style={{ minWidth: '150px' }}>
              <div className="d-flex justify-content-between align-items-center">
                <label htmlFor="brushSize" className="form-label small text-light opacity-75 mb-0">
                  Tamanho:
                </label>
                <output className="badge bg-primary ms-2">{brushSize}px</output>
              </div>
              <input
                type="range"
                className="form-range custom-range-dark"
                id="brushSize"
                min="1"
                max="500"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
              />
            </div>
          </li>

          {/* Controle de Opacidade */}
          <li className="nav-item">
            <div className="d-flex flex-column" style={{ minWidth: '150px' }}>
              <div className="d-flex justify-content-between align-items-center">
                <label htmlFor="brushOpacity" className="form-label small text-light opacity-75 mb-0">
                  Opacidade:
                </label>
                <output className="badge bg-primary ms-2">{Math.round(brushOpacity * 100)}%</output>
              </div>
              <input
                type="range"
                className="form-range"
                id="brushOpacity"
                min="0.01"
                max="1"
                step="0.01"
                value={brushOpacity}
                onChange={(e) => setBrushOpacity(parseFloat(e.target.value))}
              />
            </div>
          </li>

          {/* Divisor Visual no Desktop */}
          <li className="vr d-none d-lg-block text-secondary mx-2"></li>

          {/* Ações de Histórico e Limpeza */}
          <li className="nav-item d-flex gap-2">
            <button className="btn btn-outline-light btn-sm" onClick={handleUndo} title="Desfazer" aria-label="Desfazer">
              <span aria-hidden="true">↩️</span>
            </button>
            <button className="btn btn-outline-light btn-sm" onClick={handleRedo} title="Refazer" aria-label="Refazer">
              <span aria-hidden="true">↪️</span>
            </button>
            <button className="btn btn-outline-danger btn-sm" onClick={handleClear}>
              Limpar
            </button>
          </li>
        </ul>

        {/* Lado Direito: Iluminação e Animação */}
        <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
          <span className="small text-light opacity-50 d-none d-xl-inline me-2">Iluminação:</span>
          <div className="btn-group" role="group" aria-label="Modos de iluminação">
            {Object.keys(lightingProfiles).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  updateSceneLighting(scene, myAmbLight, myDirLight, mode);
                  setLightingMode(mode);
                }}
                className={`btn btn-sm btn-dark border-secondary ${mode === lightingMode ? 'active border-primary' : ''}`}
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
            className={`btn btn-sm ${isAnimating ? 'btn-warning' : 'btn-outline-warning'} ms-lg-2`}
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
