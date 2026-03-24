const LayerPanel = ({
  layers,
  activeLayerId,
  setLayers,
  setActiveLayerId,
  addLayer,
  deleteLayer,
  updateOpacity
}) => {
  
  const moveLayer = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= layers.length) return;
    const newLayers = [...layers];
    const item = newLayers[index];
    newLayers.splice(index, 1);
    newLayers.splice(newIndex, 0, item);
    setLayers(newLayers);
  };

  const glassPanelStyle = {
    bottom: '20px',
    right: '20px',
    width: '280px',
    zIndex: 1040,
    background: 'rgba(10, 10, 10, 0.8)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '40vh'
  };

  const activeLayerStyle = {
    border: '1px solid #00E5FF',
    background: 'rgba(0, 229, 255, 0.05)',
    boxShadow: '0 0 10px rgba(0, 229, 255, 0.1)'
  };

  const inactiveLayerStyle = {
    border: '1px solid rgba(255, 255, 255, 0.05)',
    background: 'rgba(255, 255, 255, 0.02)'
  };

  return (
    <section style={glassPanelStyle} className="position-fixed shadow-lg overflow-hidden">
      
      {/* HEADER DO PAINEL */}
      <div className="px-3 py-2 d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-25 bg-black bg-opacity-20">
        <span className="fw-bold text-white" style={{ fontSize: '10px', letterSpacing: '1.5px', opacity: 0.8 }}>
          LAYERS
        </span>
        <button 
          onClick={addLayer} 
          className="btn btn-sm px-2 py-0 fw-bold rounded-pill"
          style={{ backgroundColor: '#00E5FF', color: '#000', fontSize: '10px', height: '22px' }}
        >
          + ADD
        </button>
      </div>

      {/* LISTA DE CAMADAS */}
      <div className="p-2 overflow-auto custom-scrollbar-y flex-grow-1">
        <div className="d-flex flex-column-reverse gap-2">
          {layers.map((layer, index) => {
            const isActive = activeLayerId === layer.id;
            
            return (
              <div 
                key={layer.id}
                onClick={() => setActiveLayerId(layer.id)}
                className="p-2 rounded-3 transition-all"
                style={{ 
                  cursor: 'pointer',
                  ...(isActive ? activeLayerStyle : inactiveLayerStyle)
                }}
              >
                {/* Topo da Layer: Preview e Nome */}
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div 
                    className="rounded overflow-hidden border border-secondary border-opacity-50 bg-white" 
                    style={{ width: '36px', height: '36px', flexShrink: 0 }}
                  >
                    <img 
                      src={layer.channels.shirt?.canvas.toDataURL()} 
                      alt="Layer" 
                      className="w-100 h-100 object-fit-contain" 
                    />
                  </div>
                  
                  <div className="flex-grow-1 overflow-hidden">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                       <span className="text-white fw-medium text-truncate" style={{ fontSize: '11px' }}>
                        {layer.name}
                      </span>
                      <span style={{ fontSize: '9px', color: '#00E5FF' }}>{Math.round(layer.opacity * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      className="form-range custom-slider-mini" 
                      min="0" max="1" step="0.01" 
                      value={layer.opacity}
                      onClick={(e) => e.stopPropagation()} 
                      onChange={(e) => updateOpacity(layer.id, parseFloat(e.target.value))}
                    />
                  </div>
                </div>

                {/* Controles da Layer */}
                <div className="d-flex justify-content-end gap-1 pt-1 border-top border-secondary border-opacity-10">
                  <button 
                    onClick={(e) => { e.stopPropagation(); moveLayer(index, 1); }}
                    disabled={index === layers.length - 1}
                    className="btn btn-dark p-0 d-flex align-items-center justify-content-center rounded-circle"
                    style={{ width: '22px', height: '22px', fontSize: '10px', border: '1px solid rgba(255,255,255,0.1)' }}
                    title="Move Up"
                  >
                    ▲
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); moveLayer(index, -1); }}
                    disabled={index === 0}
                    className="btn btn-dark p-0 d-flex align-items-center justify-content-center rounded-circle"
                    style={{ width: '22px', height: '22px', fontSize: '10px', border: '1px solid rgba(255,255,255,0.1)' }}
                    title="Move Down"
                  >
                    ▼
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}
                    className="btn btn-dark p-0 d-flex align-items-center justify-content-center rounded-circle text-danger"
                    style={{ width: '22px', height: '22px', fontSize: '10px', border: '1px solid rgba(255,255,255,0.1)' }}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .custom-slider-mini { height: 4px; }
        .custom-slider-mini::-webkit-slider-runnable-track { background: rgba(255,255,255,0.1); height: 2px; border-radius: 2px; }
        .custom-slider-mini::-webkit-slider-thumb { 
          -webkit-appearance: none; height: 10px; width: 10px; border-radius: 50%; 
          background: #00E5FF; margin-top: -4px; cursor: pointer;
        }
        .custom-scrollbar-y::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar-y::-webkit-scrollbar-thumb { background: rgba(0, 229, 255, 0.3); border-radius: 10px; }
      `}</style>
    </section>
  );
};

export default LayerPanel;