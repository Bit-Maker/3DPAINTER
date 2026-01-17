// src/utils/layerHelper.js
import { createNewCanvas } from './canvasHelpers';

export const createLayer = (id, name = 'Nova Camada') => {
    return {
        id: id,
        name: name,
        visible: true,
        opacity: 1.0,
        // Cada camada tem seus próprios 4 canais PBR
        channels: {
            albedo: createNewCanvas('rgba(0,0,0,0)'),    // Transparente
            roughness: createNewCanvas('rgba(0,0,0,0)'), // Transparente
            metallic: createNewCanvas('rgba(0,0,0,0)'),  // Transparente
            normal: createNewCanvas('rgba(0,0,0,0)')     // Transparente
        }
    };
};

// Esta função pega todas as camadas e desenha uma em cima da outra
export const composeLayers = (layers, destinationChannels) => {
    const types = ['albedo', 'roughness', 'metallic', 'normal'];
    const size = 1024;

    types.forEach(type => {
        const destCtx = destinationChannels[type].ctx;
        
        // 1. Limpa o canvas final (destino)
        destCtx.clearRect(0, 0, size, size);

        // 2. Preenche com a cor base padrão (fundo)
        if (type === 'albedo') { destCtx.fillStyle = '#ffffff'; destCtx.fillRect(0,0,size,size); }
        else if (type === 'normal') { destCtx.fillStyle = '#8080ff'; destCtx.fillRect(0,0,size,size); }
        else if (type === 'roughness') { destCtx.fillStyle = '#808080'; destCtx.fillRect(0,0,size,size); }
        else if (type === 'metallic') { destCtx.fillStyle = '#000000'; destCtx.fillRect(0,0,size,size); }

        // 3. Empilha as camadas (de baixo para cima)
        layers.forEach(layer => {
            if (layer.visible) {
                destCtx.globalAlpha = layer.opacity;
                // Desenha o canvas da camada sobre o destino
                destCtx.drawImage(layer.channels[type].canvas, 0, 0);
            }
        });
        
        // Reseta alpha
        destCtx.globalAlpha = 1.0;
    });
};