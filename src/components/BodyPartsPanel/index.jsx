import { useState } from 'react';
const BodyPartsPanel = ({ visibilityState, togglePart }) => {
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  return (
 <section 
  className="body-visibility-panel position-fixed m-3 shadow-lg" 
  style={{ 
    left: '55px', 
    top: '10vh', // Posicionado próximo ao chão para não flutuar no meio da tela
    zIndex: 1040, 
    width: '200px',
    maxWidth: '15vw', 
    // Garante que o painel inteiro não passe de 25% da altura da tela
    maxHeight: '10vh', 
    display: 'flex', 
    flexDirection: 'column' 
  }}
  aria-label="Configurações de visibilidade do corpo"
>
  <div className="card bg-dark border-secondary text-light h-100 d-flex flex-column shadow-sm">
    {/* Cabeçalho Fixo */}
    <button 
      className="card-header border-secondary bg-black bg-opacity-50 d-flex justify-content-between align-items-center w-100 py-2 text-light flex-shrink-0"
      type="button"
      onClick={() => setIsPanelExpanded(!isPanelExpanded)}
      aria-expanded={isPanelExpanded}
      style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
    >
      <span className="fw-bold" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
        VISIBILITY
      </span>
      <span className="small">{isPanelExpanded ? '▼' : '▲'}</span>
    </button>

    {/* Conteúdo com Rolagem Interna */}
    <div 
      className={`collapse ${isPanelExpanded ? 'show' : ''} flex-grow-1 overflow-hidden`} 
      id="bodyPartsCollapse"
      style={{ display: isPanelExpanded ? 'flex' : 'none', flexDirection: 'column' }}
    >
      <div 
        className="card-body p-0 overflow-auto custom-scrollbar" 
        style={{ 
          backgroundColor: 'rgba(0,0,0,0.2)'
        }}
      >
        <ul className="list-group list-group-flush bg-transparent m-0" role="group">
          {Object.entries(visibilityState).map(([partName, isVisible]) => (
            <li 
              key={partName} 
              className="list-group-item bg-transparent border-secondary d-flex justify-content-between align-items-center px-3 py-2"
              style={{ borderBottomWidth: '1px' }}
            >
              <span className="small text-capitalize text-light opacity-75" style={{ fontSize: '11px' }}>
                {partName.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              
              <button 
                className={`btn btn-sm p-0 border-0 ${isVisible ? 'text-info' : 'text-danger opacity-50'}`}
                onClick={() => togglePart(partName)}
                aria-pressed={isVisible}
              >
                <span>{isVisible ? '👁️' : '🚫'}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
</section>
  );
};

export default BodyPartsPanel;