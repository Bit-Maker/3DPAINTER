const imageCache = {};
export const performPaint = (
  ctx,
  x,
  y,
  size,
  color,
  opacity,
  isEraser,
  brushTexture,
) => {
  if (!ctx) return;

  const calibratedSize = size * 582 * 0.0007;
  const radius = calibratedSize / 2;

  ctx.save();
  ctx.globalAlpha = opacity;

 if (isEraser) {
    ctx.save(); // Protege o estado do contexto
   /* ctx.globalCompositeOperation = "destination-out";
    ctx.globalAlpha = 1.0; // Garante que vai apagar totalmente
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
    ctx.globalCompositeOperation = "source-over";*/
    ctx.clearRect(x - radius, y - radius, calibratedSize, calibratedSize);
    ctx.fillRect(x - radius, y - radius, calibratedSize, calibratedSize); // Garante que a área fica transparente
}
   else {
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    if (brushTexture) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.clip();

      if (imageCache[brushTexture]?.isLoaded) {
        ctx.drawImage(
          imageCache[brushTexture].img,
          x - radius,
          y - radius,
          calibratedSize,
          calibratedSize,
        );
      }
    } else {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
  ctx.restore();
};

/**
 * Pinta um triângulo (face) específico no canvas baseado nas coordenadas UV.
 */
export const performBucketFill = (ctx, face, geometry, color, opacity) => {
  if (!ctx || !face || !geometry) return;

  // 1. Pegar o atributo de UV da geometria
  const uvAttr = geometry.attributes.uv;

  // 2. Obter as coordenadas UV dos 3 vértices da face clicada
  const uvA = { x: uvAttr.getX(face.a), y: uvAttr.getY(face.a) };
  const uvB = { x: uvAttr.getX(face.b), y: uvAttr.getY(face.b) };
  const uvC = { x: uvAttr.getX(face.c), y: uvAttr.getY(face.c) };

  const CANVAS_W = 585;
  const CANVAS_H = 559;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  
  // Usamos 'source-over' para pintar por cima ou 'destination-out' se for balde-borracha
  ctx.globalCompositeOperation = "source-over";

  // 3. Desenhar o triângulo no Canvas
  ctx.beginPath();
  ctx.moveTo(uvA.x * CANVAS_W, (1 - uvA.y) * CANVAS_H);
  ctx.lineTo(uvB.x * CANVAS_W, (1 - uvB.y) * CANVAS_H);
  ctx.lineTo(uvC.x * CANVAS_W, (1 - uvC.y) * CANVAS_H);
  ctx.closePath();
  
  // 4. Preencher
  ctx.fill();

  ctx.restore();
};