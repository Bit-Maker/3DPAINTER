import { createNewCanvas } from "./canvasHelpers";

export const createLayer = (id, name = "Nova Camada") => {
  return {
    id: id,
    name: name,
    visible: true,
    opacity: 1.0,
    channels: {
      shirt: createNewCanvas("rgba(0,0,0,0)", 585, 559), // Canal para Camisa
      pants: createNewCanvas("rgba(0,0,0,0)", 585, 559), // Canal para Calça
    },
  };
};

export const composeLayers = (layers, finalComposition) => {
    ['shirt', 'pants'].forEach(type => {
        const finalCtx = finalComposition[type].canvas.getContext('2d');
        
        // 1. Limpa o canvas final (fica transparente)
        finalCtx.clearRect(0, 0, 585, 559);
        
        // 2. Desenha cada camada por cima
        layers.forEach(layer => {
            if (layer.visible) {
                finalCtx.globalAlpha = layer.opacity;
                finalCtx.drawImage(layer.channels[type].canvas, 0, 0);
            }
        });
    });
};
