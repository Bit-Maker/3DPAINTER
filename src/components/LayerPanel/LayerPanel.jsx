import React from "react";
import ReactDOM from "react-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import styles from "./LayerPanel.module.scss";
const LayerPanel = ({
  layers,
  activeLayerId,
  setLayers,
  setActiveLayerId,
  addLayer,
  updateOpacity
}) => {
const portal = document.getElementById("portal-root");

  const onDragEnd = (result) => {
    if (!result.destination) return;

    // Criamos uma cópia do array
    const items = Array.from(layers);
    
    // Como a lista visual está de cabeça para baixo, precisamos inverter o índice do cálculo
    // MAS, a melhor forma é remover o 'column-reverse' e inverter o array antes do map.
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLayers(items);
  };
// eslint-disable-next-line
  const toggleVisibility = (id) => {
    setLayers(layers.map((l) => l.id === id ? { ...l, visible: !l.visible } : l));
  };
// eslint-disable-next-line
  const deleteLayer = (id) => {
    if (layers.length <= 1) return;
    const newLayers = layers.filter((l) => l.id !== id);
    setLayers(newLayers);
    if (activeLayerId === id) setActiveLayerId(newLayers[newLayers.length - 1].id);
  };

  return (
    <div className={styles.uipanel} style={{
      position: "absolute", right: "10px", top: "45vh", height: "50vh", 
      width: "250px", overflowY: "auto", backgroundColor: "#2a2a2a", 
      padding: "10px", borderRadius: "8px", color: "white"
    }}>
      <h3>Camadas</h3>
      <button onClick={addLayer} style={{ marginBottom: "10px", width: "100%", padding: "8px", background: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
        + Nova Camada
      </button>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="layers-list">
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef}
              style={{ display: "flex", flexDirection: "column-reverse", gap: "5px" }}
            >
              {layers.map((layer, index) => (
                <Draggable key={layer.id} draggableId={layer.id.toString()} index={index}>
                  {(provided, snapshot) => {
                    // LÓGICA DO PORTAL:
                    const child = (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                          padding: "10px",
                          backgroundColor: snapshot.isDragging ? "#555" : (activeLayerId === layer.id ? "#444" : "#333"),
                          border: activeLayerId === layer.id ? "1px solid #4CAF50" : "1px solid transparent",
                          borderRadius: "6px",
                          marginBottom: "5px",
                          zIndex: snapshot.isDragging ? 9999 : 1 // Garante que fique em cima
                        }}
                        onClick={() => setActiveLayerId(layer.id)}
                      >
                        {/* Conteúdo da sua camada (Nome, Visibilidade, Preview) */}
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img 
                          style={{ width: "30px", height: "30px", backgroundColor: "#fff", borderRadius: "2px" }}
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
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                           <span style={{ fontSize: "11px" }}>{layer.name}</span>
                           <span style={{ opacity: 0.5 }}>{index + 1}</span>
                        </div>
                      </div>
                    );

                    // Se estiver arrastando, joga para o Portal fora do painel lateral
                    if (snapshot.isDragging) {
                      return ReactDOM.createPortal(child, portal);
                    }

                    return child;
                  }}

                  
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default LayerPanel;