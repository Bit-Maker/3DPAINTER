// src/utils/canvasHelpers.js

export const createNewCanvas = (color = '#ffffff') => {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // Preenche com a cor inicial
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);
    
    return { canvas, ctx };
};