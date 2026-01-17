import './Toolbar.css'; 

const Toolbar = ({ 
    activeChannel, setActiveChannel,
    brushColor, setBrushColor,
    brushSize, setBrushSize,
    brushOpacity, setBrushOpacity, 
    isEraser, setIsEraser,         
    setUploadedModel,setBrushTexture,
    handleClear,handleDownload,
    handleAutoUV, handleUndo,                    
    handleRedo, isPaintMode,
    toggleMode,showWireframe,
    faceLockMode,setFaceLockMode,setShowWireframe 
}) => {
    
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if(file) setBrushTexture(URL.createObjectURL(file));
    };

    const handleModelUpload = (e) => {
        if(e.target.files[0]) setUploadedModel(e.target.files[0]);
    };

    return (
        <>
            <div className="mode-switcher">
                <button className={!isPaintMode ? 'active' : ''} onClick={() => toggleMode(false)}>📷 Câmera [TAB]</button>
                <button className={isPaintMode ? 'active' : ''} onClick={() => toggleMode(true)}>🖌️ Pintura [TAB]</button>
            </div>

            

            <div className="ui-panel">
                <h3>Ferramentas Pro</h3>

                <div className="group">
                    <label>1. Arquivo (GLB, FBX, OBJ)</label>
                    <input type="file" accept=".glb,.obj,.fbx" onChange={handleModelUpload} />
                    <div style={{display:'flex', gap:'5px', marginTop:'5px'}}>
                        <button onClick={handleAutoUV} style={{background:'#E91E63', fontSize:'10px'}}>BAKE</button>
                        <button onClick={handleDownload} style={{background:'#2196F3', fontSize:'10px'}}>💾 Salvar</button>
                    </div>
                </div>

                <div className="group">
                <label>Visualização</label>
                <button 
                    onClick={() => setShowWireframe(!showWireframe)}
                    style={{
                        background: showWireframe ? '#4CAF50' : '#444',
                        fontSize: '11px'
                    }}
                >
                    {showWireframe ? '🕸️ Ocultar Malha UV' : '🕸️ Mostrar Malha UV'}
                </button>
            </div>
                
                <div className="group">
                    <label>2. Pincel</label>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                        <label style={{fontSize:'10px', color:'#888'}}>Tamanho: {brushSize}px</label>
                    </div>
                    <input type="range" min="1" max="500" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} />

                    <div style={{display:'flex', justifyContent:'space-between', marginTop:'5px'}}>
                        <label style={{fontSize:'10px', color:'#888'}}>Força: {Math.round(brushOpacity * 100)}%</label>
                    </div>
                    <input type="range" min="0.01" max="1" step="0.01" value={brushOpacity} onChange={(e) => setBrushOpacity(parseFloat(e.target.value))} />
                </div>

                <div className="group">
                    <label>3. Estilo</label>
                    
                    <button 
                        onClick={() => setIsEraser(!isEraser)}
                        style={{
                            background: isEraser ? '#ffeb3b' : '#444', 
                            color: isEraser ? '#000' : '#fff',
                            marginBottom: '10px'
                        }}
                    >
                        {isEraser ? '🧽 Borracha ATIVA' : '🖌️ Pincel Normal'}
                    </button>

                    {!isEraser && (
                        <>
                            <input type="color" value={brushColor} onChange={(e) => { setBrushColor(e.target.value); setBrushTexture(null); }} />
                            <input type="file" accept="image/*" onChange={handleImageUpload} style={{marginTop:'5px'}}/>
                        </>
                    )}
                </div>
<div className="group" style={{borderBottom:'2px solid #444', paddingBottom:'10px', marginBottom:'10px'}}>
    <label>Canal de Pintura</label>
    <div style={{display:'flex', gap:'5px', marginTop:'5px', flexWrap: 'wrap'}}>
        <button 
            onClick={() => setActiveChannel('albedo')}
            style={{background: activeChannel === 'albedo' ? '#2196F3' : '#333', fontSize:'10px'}}
        >🎨 Cor</button>
        <button 
            onClick={() => setActiveChannel('roughness')}
            style={{background: activeChannel === 'roughness' ? '#FF9800' : '#333', fontSize:'10px'}}
        >✨ Brilho</button>
        <button 
            onClick={() => setActiveChannel('metallic')}
            style={{background: activeChannel === 'metallic' ? '#9C27B0' : '#333', fontSize:'10px'}}
        >⚙️ Metal</button>
                <button 
            onClick={() => setActiveChannel('normal')}
            style={{background: activeChannel === 'normal' ? '#673AB7' : '#333', fontSize:'10px'}}
        >🏔️ Normal (Relevo)</button>
    </div>
    <button onClick={() => setFaceLockMode(!faceLockMode)} style={{background: faceLockMode ? '#4CAF50' : '#444'}}>
   {faceLockMode ? '🎯 Trava de Face ON' : '🖌️ Livre'}
</button>
</div>

{activeChannel === 'normal' && <p style={{fontSize:'9px', color:'#673AB7'}}>Pinte com cores diferentes de #8080ff para criar relevo.</p>}

                <div className="group">
                    <label>Histórico</label>
                    <div style={{display:'flex', gap:'5px'}}>
                        <button onClick={handleUndo}>↩️ Undo (Ctrl+Z)</button>
                        <button onClick={handleRedo}>↪️ Redo (Ctrl+Y)</button>
                    </div>
                    <button onClick={handleClear} style={{marginTop:'5px', background:'#555'}}>Limpar Tudo</button>
                </div>
            </div>

        </>
    );
};

export default Toolbar;