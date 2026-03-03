const imageCache = {};
export const performPaint = (
    ctx,           
    x, y,          
    size,          
    color,         
    opacity,       
    isEraser,      
    brushTexture   
) => {
    if (!ctx) return;

    const calibratedSize = (size * 582) * 0.0007;
    const radius = calibratedSize / 2;

    ctx.save();
    ctx.globalAlpha = opacity;

    if (isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill(); 
    } else {
        ctx.globalCompositeOperation = 'source-over'; 
        
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
                    calibratedSize
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