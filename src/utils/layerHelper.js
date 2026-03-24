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

export const composeLayers = async (layers, finalComposition) => {
  ["shirt", "pants"].forEach((type) => {
    const channel = finalComposition[type]? finalComposition[type] : finalComposition.main
    const finalCtx = channel.canvas.getContext("2d");

    finalCtx.clearRect(0, 0, 1024, 1024);

    layers.forEach((layer) => {
      if (layer.visible) {
        if(layer.channels.main) {
          finalCtx.globalAlpha = layer.opacity;
          finalCtx.drawImage(layer.channels.main.canvas, 0, 0);

        }else {
          finalCtx.globalAlpha = layer.opacity;
          finalCtx.drawImage(layer.channels[type].canvas, 0, 0);

        }
      }
    });
  });

  const shader = await loadShadingTemplate();
  if (!shader || finalComposition.main) return;
  const opacity = getShaderOpacity();

  finalComposition.shirt.canvas.getContext("2d").globalAlpha = opacity;
  finalComposition.pants.canvas.getContext("2d").globalAlpha = opacity;
  finalComposition.shirt.canvas.getContext("2d").drawImage(shader, 0, 0);
  finalComposition.pants.canvas.getContext("2d").drawImage(shader, 0, 0);
};

export const clearLayers = (layers) => {

  layers.forEach((layer) => {
    if (layer.channels.main) {
      layer.channels.main.ctx.clearRect(0,0,1024,1024)
      
    } else {
      layer.channels.shirt.ctx.clearRect(0, 0, 585, 559);
      layer.channels.pants.ctx.clearRect(0, 0, 585, 559);
    }
  });
};
