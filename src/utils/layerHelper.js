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

export const composeLayers = (layers, destinationChannels, templates) => {
  const types = ["shirt", "pants"];

  types.forEach((type) => {
    const destChannel = destinationChannels[type];
    if (!destChannel || !destChannel.ctx) return;
    const ctx = destChannel.ctx;

    ctx.clearRect(0, 0, 585, 559);

    if (templates && templates[type]) {
      ctx.drawImage(templates[type], 0, 0, 585, 559);
    }

    layers.forEach((layer) => {
      if (layer.visible && layer.channels[type]) {
        ctx.globalAlpha = layer.opacity;
        ctx.drawImage(layer.channels[type].canvas, 0, 0);
      }
    });
    ctx.globalAlpha = 1.0;
  });
};
