import { useState } from 'react';

const BodyPartsPanel = ({ visibilityState, togglePart }) => {
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);

  const glassPanelStyle = {
    left: '85px', // Offset para ficar ao lado da LeftToolbar (70px + respiro)
    top: '80px',   // Logo abaixo da Toolbar superior
    zIndex: 1040,
    width: '200px',
    background: 'rgba(10, 10, 10, 0.75)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    maxHeight: isPanelExpanded ? '60vh' : '42px', // Altura dinâmica
  };

  const headerStyle = {
    cursor: 'pointer',
    background: isPanelExpanded ? 'rgba(0, 229, 255, 0.05)' : 'transparent',
    borderBottom: isPanelExpanded ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
    padding: '10px 15px',
    borderRadius: isPanelExpanded ? '16px 16px 0 0' : '16px',
    transition: 'background 0.3s ease'
  };

  const itemStyle = (isVisible) => ({
    padding: '8px 15px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    backgroundColor: isVisible ? 'transparent' : 'rgba(255, 0, 0, 0.02)',
    transition: 'all 0.2s ease'
  });

  const visibilityButtonStyle = (isVisible) => ({
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isVisible ? 'rgba(0, 229, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
    color: isVisible ? '#00E5FF' : 'rgba(255, 255, 255, 0.2)',
    boxShadow: isVisible ? '0 0 10px rgba(0, 229, 255, 0.2)' : 'none',
    transition: 'all 0.2s ease',
    fontSize: '12px'
  });

  return (
    <section 
      className="position-fixed shadow-lg overflow-hidden" 
      style={glassPanelStyle}
      aria-label="Visibility settings"
    >
      {/* HEADER / TOGGLE EXPAND */}
      <div 
        style={headerStyle}
        onClick={() => setIsPanelExpanded(!isPanelExpanded)}
        className="d-flex justify-content-between align-items-center"
      >
        <span className="fw-bold text-white" style={{ fontSize: '10px', letterSpacing: '1.5px', opacity: 0.8 }}>
          BODY PARTS
        </span>
        <span style={{ color: '#00E5FF', fontSize: '10px', transition: 'transform 0.3s', transform: isPanelExpanded ? 'rotate(0deg)' : 'rotate(180deg)' }}>
          {isPanelExpanded ? '▼' : '▲'}
        </span>
      </div>

      {/* LISTA DE PARTES (COLLAPSIBLE) */}
      <div 
        className="overflow-auto custom-scrollbar" 
        style={{ 
          height: isPanelExpanded ? 'auto' : '0',
          maxHeight: '50vh',
          opacity: isPanelExpanded ? 1 : 0,
          transition: 'all 0.3s ease'
        }}
      >
        <div className="py-1">
          {Object.entries(visibilityState).map(([partName, isVisible]) => (
            <div 
              key={partName} 
              style={itemStyle(isVisible)}
              className="d-flex justify-content-between align-items-center"
            >
              <span 
                className="text-capitalize" 
                style={{ 
                  fontSize: '11px', 
                  color: isVisible ? '#fff' : 'rgba(255,255,255,0.3)',
                  fontWeight: isVisible ? '500' : '400'
                }}
              >
                {partName.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              
              <button 
                style={visibilityButtonStyle(isVisible)}
                onClick={() => togglePart(partName)}
                title={isVisible ? "Hide Part" : "Show Part"}
              >
                {isVisible ? '👁️' : '🚫'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Estilo para a scrollbar interna */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 229, 255, 0.2); border-radius: 10px; }
      `}</style>
    </section>
  );
};

export default BodyPartsPanel;