
const BodyPartsPanel = ({ visibilityState, togglePart }) => {
  return (
    <div className="ui-panel" style={{
      position: "absolute", left: "1vw", top: "60vh", 
      backgroundColor: "#2a2a2a", padding: "10px", 
      borderRadius: "8px", color: "white", width: "150px"
    }}>
      <h3 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>Partes do Corpo</h3>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        {Object.entries(visibilityState).map(([partName, isVisible]) => (
          <div 
            key={partName} 
            style={{ 
              display: "flex", justifyContent: "space-between", 
              alignItems: "center", padding: "5px",
              backgroundColor: "#333", borderRadius: "4px",
              cursor: "pointer", opacity: isVisible ? 1 : 0.5
            }}
            onClick={() => togglePart(partName)}
          >
            <span style={{ fontSize: "12px" }}>{partName}</span>
            <button style={{ background: "none", border: "none", cursor: "pointer" }}>
              {isVisible ? '👁️' : '🚫'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BodyPartsPanel;