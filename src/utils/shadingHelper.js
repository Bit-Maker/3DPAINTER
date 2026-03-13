const shadingCache = {
};
let shader =  "/templates/Shading.png";

export const setShader = (newShader) => {
  shader = newShader;
}
export const getShader = () => {
  return shader;
}
// src/files.js
export const shadings = [
  process.env.PUBLIC_URL+'templates/shadings/shader1.png',
  process.env.PUBLIC_URL+'templates/shadings/shader2.png',
  process.env.PUBLIC_URL+'templates/shadings/shader3.png',
  process.env.PUBLIC_URL+'templates/shadings/shader4.png',
  process.env.PUBLIC_URL+'templates/shadings/shader5.png',
  process.env.PUBLIC_URL+'templates/shadings/shader6.png',
];

const loadShadingTemplate = () => {
  return new Promise((resolve) => {
    if (shadingCache[shader]) {
      resolve(shadingCache[shader]);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    // Caminho para a sua textura de sombra transparente (precisa ser 585x559)
    img.src = shader; 
    img.onload = () => {
      shadingCache[shader] = img;
      resolve(img);
    };
  });
};

export const applyAutomaticShading = async (sourceCanvas, opacity = 0.7) => {
  const shadingImg = await loadShadingTemplate();
  const shadedCanvas = document.createElement("canvas");
  shadedCanvas.width = sourceCanvas.width; // 585
  shadedCanvas.height = sourceCanvas.height; // 559
  const ctx = shadedCanvas.getContext("2d");

  ctx.drawImage(sourceCanvas, 0, 0);
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = opacity; 
  ctx.drawImage(shadingImg, 0, 0, shadedCanvas.width, shadedCanvas.height);

  // 4. (Opcional) Brilho e Destaque
  // Se a sua textura de sombra tiver partes muito brancas para simular brilho:
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = opacity * 0.5; // Brilho costuma ser mais sutil
  ctx.drawImage(shadingImg, 0, 0, shadedCanvas.width, shadedCanvas.height);

  // Reseta o contexto
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1.0;

  return shadedCanvas;
};