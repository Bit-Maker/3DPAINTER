const LayerPanel = ({ layers, activeLayerId, setLayers, setActiveLayerId, onUpdate }) => {
    
    const addLayer = () => {
        const newId = Date.now();
        window.dispatchEvent(new CustomEvent('add-layer', { detail: { id: newId } }));
    };

    const toggleVisibility = (id) => {
        const newLayers = layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l);
        setLayers(newLayers);
        onUpdate();
    };

    const changeOpacity = (id, val) => {
        const newLayers = layers.map(l => l.id === id ? { ...l, opacity: parseFloat(val) } : l);
        setLayers(newLayers);
        onUpdate(); 
    };

    const deleteLayer = (id) => {
        if (layers.length <= 1) return; 
        const newLayers = layers.filter(l => l.id !== id);
        setLayers(newLayers);
        setActiveLayerId(newLayers[newLayers.length - 1].id);
        onUpdate();
    };

    return (
        <div className="ui-panel" style={{right: '10px', left: 'auto', top: '45vh', height: 'auto', height:'50vh', overflowY:'auto'}}>
            <h3>Camadas</h3>
            <button onClick={addLayer} style={{marginBottom: '10px', width: '100%', background: '#4CAF50'}}>+ Nova Camada</button>
            
            <div style={{display:'flex', flexDirection:'column-reverse', gap:'5px'}}>
                {layers.map((layer) => (
                    <div 
                        key={layer.id}
                        onClick={() => setActiveLayerId(layer.id)}
                        style={{
                            background: activeLayerId === layer.id ? '#2196F3' : '#333',
                            padding: '10px', borderRadius: '4px', border: '1px solid #555',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <span style={{fontWeight:'bold', fontSize:'12px'}}>{layer.name}</span>
                            <div style={{display:'flex', gap:'5px'}}>
                                <button onClick={(e) => { e.stopPropagation(); toggleVisibility(layer.id); }} style={{padding:'2px 5px', fontSize:'10px'}}>
                                    {layer.visible ? '👁️' : '🚫'}
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }} style={{padding:'2px 5px', fontSize:'10px', background:'#f44336'}}>
                                    🗑️
                                </button>
                            </div>
                        </div>
                        
                        <div style={{marginTop:'5px', display:'flex', alignItems:'center', gap:'5px'}}>
                            <span style={{fontSize:'10px'}}>Opacidade:</span>
                            <input 
                                type="range" min="0" max="1" step="0.01" 
                                value={layer.opacity}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => changeOpacity(layer.id, e.target.value)}
                                style={{width:'80px'}}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LayerPanel;