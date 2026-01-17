// src/utils/paintHelper.js

/**
 * Função reutilizável que desenha no contexto 2D.
 * Usada tanto pelo Raycaster 3D quanto pelo Editor 2D.
 */
export const performPaint = (
    ctx,           // O Contexto 2D onde vamos desenhar
    x, y,          // Coordenadas centrais (em pixels, 0-1024)
    size,          // Tamanho do pincel
    color,         // Cor hexadecimal
    opacity,       // Força (0.0 - 1.0)
    isEraser,      // Modo borracha
    radius,
    brushTexture   // URL da imagem de textura (opcional)
) => {
    if (!ctx) return;

    ctx.save();
    ctx.beginPath();
    // Cria o círculo que limita a área de pintura
    ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
    ctx.clip();

    // Aplica a força (Opacidade)
    ctx.globalAlpha = opacity;

    if (isEraser) {
        // Modo Borracha: Pinta de branco (assumindo fundo branco)
        ctx.fillStyle = '#ffffff';
        // Se quiser transparência real, use: ctx.globalCompositeOperation = 'destination-out';
        ctx.fillRect(x - radius/2, y - radius/2, radius, radius);
    } else {
        ctx.globalCompositeOperation = 'source-over'; // Modo de mistura padrão
        
        if (brushTexture) {
            // Modo Textura
            const img = new Image();
            img.src = brushTexture;
            // Desenha a imagem centralizada no ponto
            ctx.drawImage(img, x - size/2, y - size/2, size, size);
        } else {
            // Modo Cor Sólida
            ctx.fillStyle = color;
            ctx.fillRect(x - size/2, y - size/2, size, size);
        }
    }

    ctx.restore();
};