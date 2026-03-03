import React, { useEffect, useState, useRef } from 'react';
import styles from './Preview.module.scss';

const Preview = ({ finalComposition, triggerTextureUpdate, setTriggerTextureUpdate }) => {
  const [images, setImages] = useState({ shirt: null, pants: null });
  
  const fileInputRef = useRef(null);
  const activeType = useRef('shirt');

  useEffect(() => {
    if (finalComposition && finalComposition.shirt && finalComposition.pants) {
      setImages({
        shirt: finalComposition.shirt.canvas.toDataURL(),
        pants: finalComposition.pants.canvas.toDataURL()
      });
    }
  }, [finalComposition, triggerTextureUpdate]);

  const downloadTexture = (type) => {
    const canvas = finalComposition[type]?.canvas;
    if (!canvas) {
      console.error(`Canvas de ${type} não encontrado.`);
      return;
    }

    const imageURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imageURL;
    link.download = `roblox_${type}_template.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = (type) => {
    activeType.current = type;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (img.width !== 585 || img.height !== 559) {
          alert(`Erro: A imagem deve ter exatamente 585x559 pixels.\nDetectado: ${img.width}x${img.height}`);
          return;
        }

        const targetCanvas = finalComposition[activeType.current].canvas;
        const ctx = targetCanvas.getContext('2d');
        
        ctx.clearRect(0, 0, 585, 559);
        ctx.drawImage(img, 0, 0);

        setTriggerTextureUpdate(prev => prev + 1);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = ""; 
  };

  if (!images.shirt || !images.pants) {
    return (
      <div className={styles.Preview}>
        <p>Aguardando renderização dos canais...</p>
      </div>
    );
  }

  return (
    <div className={styles.Preview}>
      <h3>ROBLOX CLASSIC</h3>

      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/png, image/jpeg"
        onChange={handleFileChange}
      />

      <div className={styles.gridContainer}>
        <div className={styles.previewBox}>
          <span className={styles.label}>SHIRT TEMPLATE</span>
          <div className={styles.imageWrapper}>
            <img src={images.shirt} alt="Shirt Preview" className={styles.previewImage} />
            <div className={styles.overlayActions}>
               <button onClick={() => handleImportClick('shirt')}>Importar</button>
            </div>
          </div>
          <button 
            className={styles.downloadBtn} 
            onClick={() => downloadTexture('shirt')}
          >
            Baixar Camisa
          </button>
        </div>

        <div className={styles.previewBox}>
          <span className={styles.label}>PANTS TEMPLATE</span>
          <div className={styles.imageWrapper}>
            <img src={images.pants} alt="Pants Preview" className={styles.previewImage} />
            <div className={styles.overlayActions}>
               <button onClick={() => handleImportClick('pants')}>Importar</button>
            </div>
          </div>
          <button 
            className={styles.downloadBtn} 
            onClick={() => downloadTexture('pants')}
          >
            Baixar Calça
          </button>
        </div>
      </div>

      <div className={styles.infoFooter}>
        <p>Resolução Padrão: 585 x 559 px</p>
      </div>
    </div>
  );
};

export default Preview;