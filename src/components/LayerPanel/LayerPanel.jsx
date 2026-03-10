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
    <div className={styles.uipanel}>
      <h3 className={styles.title}>Camadas</h3>
      <button onClick={addLayer} className={styles.addLayer}>
        + Nova Camada
      </button>

      <div style={{ display: "flex", flexDirection: "column-reverse", gap: "5px" }}>
        {layers.map((layer, index) => (
          <div
            key={layer.id}
            onClick={() => setActiveLayerId(layer.id)}
            className={styles.layer}
          >
            {/* Linha Superior: Preview e Opacidade */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <img 
                style={{ width: "30px", height: "30px", backgroundColor: "#fff", borderRadius: "2px", objectFit: "contain" }}
                src={layer.channels.shirt.canvas.toDataURL()} 
                alt="preview" 
              />
              <input 
                type="range" min="0" max="1" step="0.1" 
                value={layer.opacity}
                style={{ flex: 1 }}
                onClick={(e) => e.stopPropagation()} 
                onChange={(e) => updateOpacity(layer.id, parseFloat(e.target.value))}
              />
            </div>

            {/* Linha Inferior: Nome e Controles de Ordem */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", opacity: 0.8 }}>{layer.name}</span>
              
              <div style={{ display: "flex", gap: "5px" }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}
                  className={styles.btnStyle}
                >
                  X
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); moveLayer(index, -1); }}
                  disabled={index === 0}
                  className={styles.btnStyle}
                >
                  ▼
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); moveLayer(index, 1); }}
                  disabled={index === layers.length - 1}
                  className={styles.btnStyle}
                >
                  ▲
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayerPanel;