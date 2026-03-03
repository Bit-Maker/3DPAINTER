export const createNewCanvas = (color = '#ffffff', width, height) => {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = width || size;
    canvas.height = height || size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width || size, height || size);
    
    return { canvas, ctx };
};

export const loadTemplateToCanvas = (ctx, imageUrl) => {
  return new Promise((resolve, reject) => {
    if (!ctx) return reject("Sem contexto");
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 585, 559);
      resolve();
    };
    img.onerror = () => reject("Erro ao carregar template: " + imageUrl);
    img.src = imageUrl;
  });
};