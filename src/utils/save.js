// Função para transformar o estado das camadas em uma string salvável
export const serializeLayers = (layers) => {
  return layers.map(layer => ({
    id: layer.id,
    name: layer.name,
    visible: layer.visible,
    opacity: layer.opacity,
    // Convertemos o conteúdo do canvas de cada canal para string
    images: {
      shirt: layer.channels.shirt.canvas.toDataURL(),
      pants: layer.channels.pants.canvas.toDataURL()
    }
  }));
};