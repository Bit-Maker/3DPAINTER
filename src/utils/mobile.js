export const isMobile = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  // Verifica strings comuns de dispositivos móveis
  const mobileRegex = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  
  // Verifica se o dispositivo tem suporte a touch
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  return mobileRegex.test(userAgent) || (hasTouch && window.innerWidth <= 1024);
};