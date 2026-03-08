export const performPaint = (
  ctx,
  x,
  y,
  lastX,
  lastY,
  size,
  color,
  opacity,
  isEraser,
  brushTexture,
  isMirrorEnabled
) => {
  if (!ctx) return;

  // Função interna para evitar repetição de código
  const executeDraw = (currX, currY, prevX, prevY) => {
    const calibratedSize = Math.max(size * 0.2, size * 582 * 0.0007);
    const distancia = prevX !== null ? Math.sqrt(Math.pow(currX - prevX, 2) + Math.pow(currY - prevY, 2)) : 0;
    
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = calibratedSize;

    if (isEraser) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.beginPath();
      if (prevX !== null && prevY !== null) {
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(currX, currY);
      } else {
        ctx.arc(currX, currY, calibratedSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.stroke();
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.beginPath();

      if (prevX !== null && prevY !== null && distancia < 70) {
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(currX, currY);
        ctx.stroke();
      } else {
        ctx.arc(currX, currY, calibratedSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  };

  // 1. Desenho Normal
  executeDraw(x, y, lastX, lastY);

  // 2. Desenho Espelhado
  if (isMirrorEnabled) {
    const canvasWidth = ctx.canvas.width;
    const mirroredX = canvasWidth - x;
    const mirroredLastX = lastX !== null ? canvasWidth - lastX : null;
    
    executeDraw(mirroredX, y, mirroredLastX, lastY);
  }
};
export const performBucketFill = (
  ctx,
  face,
  geometry,
  color,
  opacity,
  eraser,
  x,
  y,
  isMirrorEnabled
) => {
  if (!ctx || !face || !geometry) return;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;

  // Usamos 'source-over' para pintar por cima ou 'destination-out' se for balde-borracha
  ctx.globalCompositeOperation = "source-over";

  // 3. Desenhar o triângulo no Canvas
  if (eraser) {
    ctx.globalCompositeOperation = "destination-out";
  }
  FloodFill(ctx, x, y, color, 32,eraser);
  if(isMirrorEnabled) FloodFill(ctx, ctx.canvas.width - x, y, color, 32,eraser);
  ctx.restore();
};

export const performWrapLine = (
  ctx,
  x,
  y, // Só precisamos do Y onde o usuário clicou
  size,
  color,
  opacity,
  isEraser,
  isMirrorEnabled
) => {
  if (!ctx) return;

  // 1. Descobre em qual parte do corpo o usuário clicou
  const zone = getZoneByY(x,y);
  
  if (!zone) return; // Se clicou fora de uma área válida, ignora

  const calibratedSize = Math.max(size * 0.2, size * 582 * 0.0007);

  ctx.save();
  ctx.lineCap = "square"; // "square" é melhor que "round" para as bordas conectarem certinho nas costuras
  ctx.lineJoin = "miter";
  ctx.lineWidth = calibratedSize;

  if (isEraser) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "rgba(0,0,0,1)";
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = color;
  }

  // 2. Desenha a linha reta de ponta a ponta na zona
  ctx.beginPath();
  ctx.moveTo(zone.minX, y);
  ctx.lineTo(zone.maxX, y);
  ctx.stroke();

  if (isMirrorEnabled) {
    ctx.beginPath();
    ctx.moveTo(ctx.canvas.width -zone.minX, y);
    ctx.lineTo(ctx.canvas.width -zone.maxX, y);
    ctx.stroke();
  }

  ctx.restore();
};


export const FloodFill = (ctx, x, y, fillColor, tolerance = 32, isEraser) => {
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;
  const colorToFill = isEraser
    ? { r: 0, g: 0, b: 0, a: 0 }
    : hexToRgb(fillColor);

  // Arredonda as coordenadas para evitar erros de índice
  const startX = Math.floor(x);
  const startY = Math.floor(y);

  const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  const data = imageData.data;

  const targetColor = getPixelColor(data, startX, startY, canvasWidth);

  // Se a cor que você clicou já é a cor que você quer pintar, para na hora
  if (colorsMatch(targetColor, colorToFill, 0)) return;

  // Uint8Array para marcar pixels visitados é muito mais rápido que um objeto
  const visited = new Uint8Array(canvasWidth * canvasHeight);
  const stack = [[startX, startY]];

  while (stack.length) {
    const [currX, currY] = stack.pop();
    const idx = currY * canvasWidth + currX;

    // Pula se estiver fora do canvas, se já visitou ou se a cor não bate
    if (
      currX < 0 ||
      currX >= canvasWidth ||
      currY < 0 ||
      currY >= canvasHeight ||
      visited[idx]
    )
      continue;

    const currentColor = getPixelColor(data, currX, currY, canvasWidth);

    if (colorsMatch(currentColor, targetColor, tolerance)) {
      setPixelColor(data, currX, currY, colorToFill, canvasWidth);
      visited[idx] = 1; // Marca como processado

      // Adiciona vizinhos
      stack.push([currX + 1, currY]);
      stack.push([currX - 1, currY]);
      stack.push([currX, currY + 1]);
      stack.push([currX, currY - 1]);
    }
  }

  ctx.putImageData(imageData, 0, 0);
};
const getPixelColor = (data, x, y, width) => {
  const index = (y * width + x) * 4;
  return {
    r: data[index],
    g: data[index + 1],
    b: data[index + 2],
    a: data[index + 3],
  };
};

const setPixelColor = (data, x, y, color, width) => {
  const index = (y * width + x) * 4;
  data[index] = color.r;
  data[index + 1] = color.g;
  data[index + 2] = color.b;
  data[index + 3] = color.a;
};

const colorsMatch = (c1, c2, tolerance = 0) => {
  return (
    Math.abs(c1.r - c2.r) <= tolerance &&
    Math.abs(c1.g - c2.g) <= tolerance &&
    Math.abs(c1.b - c2.b) <= tolerance &&
    Math.abs(c1.a - c2.a) <= tolerance
  );
};

const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b, a: 255 }; // Alpha 255 = 100% opaco
};


// Valores aproximados do template padrão do Roblox (585x559)
const ROBLOX_ZONES = [
  { id: "torso", minX: 163, maxX: 555, minY: 7, maxY: 270 },
  { id: "right_arm", minX: 17, maxX: 280, minY: 288, maxY: 500 },
  { id: "left_arm", minX: 305, maxX: 570, minY: 288, maxY: 500 },
  // Se for usar no canal de calças (Pants)
  { id: "right_leg", minX: 144, maxX: 404, minY: 72, maxY: 204 }, 
  { id: "left_leg", minX: 144, maxX: 404, minY: 224, maxY: 356 },
];

const getZoneByY = (x,y) => {
  // Retorna a zona em que o mouse clicou baseado na altura (Y)
  return ROBLOX_ZONES.find(zone => y >= zone.minY && y <= zone.maxY && zone.minX <= x && zone.maxX >= x);
};