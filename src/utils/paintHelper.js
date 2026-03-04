const imageCache = {};
export const performPaint = (ctx, x, y, lastX, lastY, size, color, opacity, isEraser, brushTexture) => {
  if (!ctx) return;

  const calibratedSize = Math.max(size * 0.2, size * 582 * 0.0007);
  const distancia = Math.sqrt(Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2));
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = calibratedSize;

  // --- CONFIGURAÇÃO DO SHADOWBLUR (MACIEZ) ---
  // O valor do blur geralmente fica entre 20% e 50% do tamanho do pincel
  ctx.shadowBlur = calibratedSize * 0.3; 
  ctx.shadowColor = isEraser ? "black" : color; // Cor da "névoa" do pincel
  
  if (isEraser) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "rgba(0,0,0,1)";
    ctx.beginPath();
    if (lastX !== null && lastY !== null) {
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
    } else {
      ctx.arc(x, y, calibratedSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.stroke();
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = opacity;

    if (brushTexture && imageCache[brushTexture]?.isLoaded) {
      // Para texturas, o shadowBlur cria uma aura ao redor da imagem
      //drawTexturedLine(ctx, lastX, lastY, x, y, calibratedSize, brushTexture);
    } else {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.beginPath();
      
      if (lastX !== null && lastY !== null && distancia < 70) {
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else {
        ctx.arc(x, y, calibratedSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
};
export const performBucketFill = (ctx, face, geometry, color, opacity,eraser) => {
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
  if(eraser) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.moveTo(uvA.x * CANVAS_W, (1 - uvA.y) * CANVAS_H);
    ctx.lineTo(uvB.x * CANVAS_W, (1 - uvB.y) * CANVAS_H);
    ctx.lineTo(uvC.x * CANVAS_W, (1 - uvC.y) * CANVAS_H);
    ctx.closePath();
    
    // 4. Apagar
    ctx.clear();

    ctx.restore();
  } else {
    ctx.beginPath();
    ctx.moveTo(uvA.x * CANVAS_W, (1 - uvA.y) * CANVAS_H);
    ctx.lineTo(uvB.x * CANVAS_W, (1 - uvB.y) * CANVAS_H);
    ctx.lineTo(uvC.x * CANVAS_W, (1 - uvC.y) * CANVAS_H);
    ctx.closePath();
    
    // 4. Preencher
    ctx.fill();

    ctx.restore();
  }
};