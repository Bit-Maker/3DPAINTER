import styles from './BodyPartsPanel.module.scss'
import { useState } from 'react';
const BodyPartsPanel = ({ visibilityState, togglePart }) => {
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  return (
 
  <section 
  className="body-visibility-panel position-fixed bottom-0 m-3 shadow-lg" 
  style={{ left: '70px', zIndex: 1040, width: '220px' }}
  aria-label="Configurações de visibilidade do corpo"
>
  <div className="card bg-dark border-secondary text-light">
    {/* Botão de Controle (Header do Painel) */}
    <button 
      className="card-header border-secondary bg-black bg-opacity-50 d-flex justify-content-between align-items-center w-100 py-2 text-light"
      type="button"
      onClick={() => setIsPanelExpanded(!isPanelExpanded)}
      aria-expanded={isPanelExpanded}
      aria-controls="bodyPartsCollapse"
      style={{ border: 'none', cursor: 'pointer' }}
    >
      <span className="fw-bold small text-uppercase" style={{ letterSpacing: '0.5px' }}>
        Corpo / Visibilidade
      </span>
      <span>{isPanelExpanded ? '▼' : '▲'}</span>
    </button>

    {/* Conteúdo Expansível */}
    <div 
      className={`collapse ${isPanelExpanded ? 'show' : ''}`} 
      id="bodyPartsCollapse"
    >
      <div className="card-body p-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
        <ul className="list-group list-group-flush bg-transparent" role="group">
          {Object.entries(visibilityState).map(([partName, isVisible]) => (
            <li 
              key={partName} 
              className={`list-group-item bg-transparent border-secondary d-flex justify-content-between align-items-center p-2 transition-all ${isVisible ? 'text-light' : 'text-muted'}`}
              style={{ borderBottomWidth: '1px' }}
            >
              <span className="small text-capitalize" style={{ fontSize: '12px' }}>
                {partName.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              
              <button 
                className={`btn btn-sm p-0 border-0 ${isVisible ? 'text-primary' : 'text-danger opacity-50'}`}
                onClick={() => togglePart(partName)}
                title={isVisible ? `Esconder ${partName}` : `Mostrar ${partName}`}
                aria-pressed={isVisible}
              >
                <span style={{ fontSize: '1.2rem' }}>{isVisible ? '👁️' : '🚫'}</span>
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