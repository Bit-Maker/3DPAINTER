import styles from './BodyPartsPanel.module.scss'
const BodyPartsPanel = ({ visibilityState, togglePart }) => {
  return (
 
    <div className={styles.panel}>
      
      <div className={styles.bodyParts}>
        {Object.entries(visibilityState).map(([partName, isVisible]) => (
          <div 
            key={partName} 
            className={styles.bodyPart+" "+(isVisible ? styles.visible : styles.hidden)}
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