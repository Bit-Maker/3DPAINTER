import styles from "./LayerPanel.module.scss";

const LayerPanel = ({
  layers,
  activeLayerId,
  setLayers,
  setActiveLayerId,
  addLayer,
  deleteLayer,
  updateOpacity
}) => {
  
  // Função para mover a camada no array
  const moveLayer = (index, direction) => {
    const newIndex = index + direction;
    
    // Verifica se o movimento é possível (dentro dos limites do array)
    if (newIndex < 0 || newIndex >= layers.length) return;

    const newLayers = [...layers];
    const item = newLayers[index];
    
    // Remove o item e insere na nova posição
    newLayers.splice(index, 1);
    newLayers.splice(newIndex, 0, item);

    setLayers(newLayers);
  };

  return (
   <section 
  className="layers-panel card bg-dark text-light border-secondary shadow-lg position-fixed bottom-0 end-0 m-3" 
  style={{ width: '280px', zIndex: 1040, maxHeight: '400px', display: 'flex', flexDirection: 'column' }}
  aria-labelledby="layers-title"
>
  {/* Cabeçalho do Painel */}
  <div className="card-header border-secondary d-flex justify-content-between align-items-center py-2 bg-black bg-opacity-25">
    <h5 id="layers-title" className="mb-0 fs-6 fw-bold">Camadas</h5>
    <button 
      onClick={addLayer} 
      className="btn btn-primary btn-sm d-flex align-items-center gap-1"
      aria-label="Adicionar nova camada"
    >
      <span aria-hidden="true">+</span> Nova
    </button>
  </div>

  {/* Lista de Camadas */}
  <div className="card-body p-2 overflow-auto custom-scrollbar">
    <ul className="d-flex flex-column-reverse gap-2 list-unstyled mb-0" role="listbox" aria-label="Lista de camadas">
      {layers.map((layer, index) => (
        <li 
          key={layer.id}
          onClick={() => setActiveLayerId(layer.id)}
          className={`layer-item p-2 rounded border border-secondary transition-all ${activeLayerId === layer.id ? 'bg-primary bg-opacity-25 border-primary' : 'bg-secondary bg-opacity-10'}`}
          style={{ cursor: 'pointer' }}
          role="option"
          aria-selected={activeLayerId === layer.id}
        >
          {/* Linha Superior: Preview e Controle de Opacidade */}
          <div className="d-flex align-items-center gap-2 mb-2">
            <div className="preview-container bg-white rounded border border-light overflow-hidden" style={{ width: '32px', height: '32px', flexShrink: 0 }}>
              <img 
                src={layer.channels.shirt.canvas.toDataURL()} 
                alt={`Miniatura da camada ${layer.name}`} 
                className="w-100 h-100"
                style={{ objectFit: 'contain' }}
              />
            </div>
            
            <div className="flex-grow-1">
              <label htmlFor={`opacity-${layer.id}`} className="visually-hidden">Opacidade de {layer.name}</label>
              <input 
                type="range" 
                id={`opacity-${layer.id}`}
                className="form-range form-range-sm" 
                min="0" max="1" step="0.1" 
                value={layer.opacity}
                onClick={(e) => e.stopPropagation()} 
                onChange={(e) => updateOpacity(layer.id, parseFloat(e.target.value))}
              />
            </div>
          </div>

          {/* Linha Inferior: Nome e Ações */}
          <div className="d-flex justify-content-between align-items-center mt-1">
            <span className="small fw-medium text-truncate opacity-75" style={{ maxWidth: '120px' }}>
              {layer.name}
            </span>
            
            <div className="btn-group shadow-sm" role="group">
              <button 
                onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}
                className="btn btn-dark btn-xs border-secondary text-danger"
                title="Excluir camada"
              >
                ✕
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); moveLayer(index, -1); }}
                disabled={index === 0}
                className="btn btn-dark btn-xs border-secondary"
                title="Mover para baixo"
              >
                ▼
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); moveLayer(index, 1); }}
                disabled={index === layers.length - 1}
                className="btn btn-dark btn-xs border-secondary"
                title="Mover para cima"
              >
                ▲
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  </div>
</section>
  );
};

export default LayerPanel;