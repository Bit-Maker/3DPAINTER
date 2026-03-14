import { createNewCanvas } from "./canvasHelpers";
import { loadShadingTemplate, getShaderOpacity } from "./shadingHelper";
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

export const composeLayers = async (layers, finalComposition)  => {
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

        const shader = 
                 await loadShadingTemplate()

                 if(!shader) return;

            const opacity = getShaderOpacity()
            if (opacity){
              shader.opacity = opacity
            }
           // const shaderCanvas = createNewCanvas("ffff",559,558)

          // shaderCanvas.ctx.drawImage(shadedShirt,0,0)
        //    shaderCanvas.ctx.globalAlpha = opacity
            finalComposition.shirt.canvas.getContext('2d').drawImage(shader,0,0)
            finalComposition.pants.canvas.getContext('2d').drawImage(shader,0,0)
     
};

export const clearLayers = (layers) => {
    layers.forEach(layer => {
        layer.channels.shirt.ctx.clearRect(0, 0, 585, 559);
        layer.channels.pants.ctx.clearRect(0, 0, 585, 559);
    });
};
