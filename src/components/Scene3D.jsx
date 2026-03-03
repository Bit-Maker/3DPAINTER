import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { performPaint } from "../utils/paintHelper";
import { extractUVLines } from "../utils/uvHelper";
import { loadTemplateToCanvas } from "../utils/canvasHelpers";
const Scene3D = ({
  brushColor,
  brushSize,
  brushOpacity,
  isEraser,
  uploadedModel,
  brushTexture,
  finalComposition,
  activeLayerId,
  layers,
  onPaintEnd,
  onUVsExtracted,
  onDownloadTexture,
  faceLockMode = false,
  triggerTextureUpdate,
}) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const materialRef = useRef(null);
  const modelRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const requestRef = useRef(null);
  const textureRef = useRef(null);
  const updateUVOverlay = (sceneObject) => {
    if (!onUVsExtracted) return;
    const allLines = [];
    sceneObject.traverse((child) => {
      if (child.isMesh && child.geometry) {
        const meshLines = extractUVLines(child.geometry);
        allLines.push(...meshLines);
      }
    });
    onUVsExtracted(allLines);
  };

  const applyTexturesToModel = () => {
    if (!modelRef.current || !finalComposition) return;

    const shirtTexture = new THREE.CanvasTexture(finalComposition.shirt.canvas);
    const pantsTexture = new THREE.CanvasTexture(finalComposition.pants.canvas);

    [shirtTexture, pantsTexture].forEach((tex) => {
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      tex.flipY = true;
      tex.needsUpdate = true;
    });

    modelRef.current.traverse((child) => {
      if (child.isMesh) {
        const name = child.name.toLowerCase();
        if (child.material) {
          child.material = child.material.clone();
        }

        const isPants = name.includes("leg") || name.includes("foot");

        if (isPants) {
          child.material.map = pantsTexture;
        } else {
          child.material.map = shirtTexture;
        }

        child.material.transparent = true;
        child.material.alphaTest = 0.5;
        child.material.needsUpdate = true;
      }
    });
  };

  useEffect(() => {
    applyTexturesToModel();
    // eslint-disable-next-line
  }, [triggerTextureUpdate, finalComposition]);

  const fitCameraToObject = (object) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = cameraRef.current.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5;
    const direction = new THREE.Vector3(0, 0, 1).applyQuaternion(
      cameraRef.current.quaternion,
    );
    cameraRef.current.position
      .copy(center)
      .add(direction.multiplyScalar(cameraZ));
    controlsRef.current.target.copy(center);
    controlsRef.current.update();
  };

  // 1. Inicialização da Cena (Roda apenas uma vez)
  useEffect(() => {
    const mountNode = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 0, 4);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountNode.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.mouseButtons = {
      LEFT: null, // Desativa o botão esquerdo para a câmera
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE,
    };
    controlsRef.current = controls;

    // Iluminação forte e plana para ver as texturas claramente
    scene.add(new THREE.AmbientLight(0xffffff, 1.2));

    // Material Simples (MeshBasicMaterial = Sem sombras/reflexos, ideal para 2D clássico)
    materialRef.current = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
    });

    if (layers.length > 1) {
      const baseLayer = layers[0];

      // Carrega o template de Camisa no canal shirt
      if (baseLayer.channels.shirt?.ctx) {
        loadTemplateToCanvas(
          baseLayer.channels.shirt.ctx,
          "/templates/TemplateShirt.png",
        );
      }

      // Carrega o template de Calça no canal pants
      if (baseLayer.channels.pants?.ctx) {
        loadTemplateToCanvas(
          baseLayer.channels.pants.ctx,
          "/templates/TemplatePants.png",
        );
      }
    }

    // Loop de Animação
    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);

      if (controlsRef.current) controlsRef.current.update();

      // ATUALIZAÇÃO 60FPS: Se o modo pintura estiver ativo e a textura existir, força o update
      if (textureRef.current) {
        textureRef.current.needsUpdate = true;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(requestRef.current);
      renderer.dispose();
      if (mountNode && renderer.domElement) {
        mountNode.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line
  }, []);

  // 2. Atualização da Textura Baseada no Canvas
  useEffect(() => {
    if (!finalComposition?.albedo || !materialRef.current) return;

    const canvas = finalComposition.albedo.canvas;

    if (!textureRef.current) {
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      textureRef.current = tex;
      materialRef.current.map = tex;
    } else {
      // Se a referência do canvas mudar, atualizamos a imagem e forçamos o update
      if (textureRef.current.image !== canvas) {
        textureRef.current.image = canvas;
      }
      textureRef.current.needsUpdate = true;
    }
    materialRef.current.needsUpdate = true;
  }, [finalComposition]);

  // 3. Carregamento do Modelo
  useEffect(() => {
    if (sceneRef.current && !uploadedModel) {
      const loader = new OBJLoader();
      const modelPath = "/models/avatar.obj"; // Certifique-se que o arquivo está em public/models/

      loader.load(
        modelPath,
        (object) => {
          if (modelRef.current) sceneRef.current.remove(modelRef.current);

          const box = new THREE.Box3().setFromObject(object);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());

          object.position.sub(center);
          const maxAxis = Math.max(size.x, size.y, size.z);
          const scale = 2.0 / maxAxis;
          object.scale.set(scale, scale, scale);
          setTimeout(() => {
            object.traverse((child) => {
              if (
                child.isMesh &&
                finalComposition &&
                finalComposition.shirt &&
                finalComposition.pants
              ) {
                const name = child.name.toLowerCase();

                const shirtTex = new THREE.CanvasTexture(
                  finalComposition.shirt.canvas,
                );
                const pantsTex = new THREE.CanvasTexture(
                  finalComposition.pants.canvas,
                );
                console.log("Aplicando texturas:", name);
                if (name.includes("leg") || name.includes("foot")) {
                  child.material.map = pantsTex;
                } else {
                  child.material.map = shirtTex;
                }

                child.material.map.magFilter = THREE.NearestFilter;
                child.material.map.minFilter = THREE.NearestFilter;
                child.material.needsUpdate = true;
              }
            });
          }, 1000);

          modelRef.current = object;
          sceneRef.current.add(object);
          fitCameraToObject(object);
          updateUVOverlay(object);
        },
        undefined,
        (error) => console.error("Erro ao carregar avatar.obj:", error),
      );
    }
    // eslint-disable-next-line
  }, [uploadedModel]);

  const paint = (e) => {
    if (!modelRef.current || !activeLayerId) return;

    const targetLayer = layers.find((l) => l.id === activeLayerId);
    if (!targetLayer || !targetLayer.channels) return;

    mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

    const intersects = raycasterRef.current.intersectObject(
      modelRef.current,
      true,
    );

    if (intersects.length > 0 && intersects[0].uv) {
      const intersect = intersects[0];
      const meshName = intersect.object.name.toLowerCase();

      let targetChannel = "shirt";
      if (meshName.includes("leg")) {
        targetChannel = "pants";
      }
      console.log(meshName, targetChannel, intersect.uv.y);

      const channelData = targetLayer.channels[targetChannel];
      if (!channelData) return;
      const layerCtx = channelData.ctx;

      const CANVAS_W = 585;
      const CANVAS_H = 559;

      const x = intersect.uv.x * 585;
      const y = (1 - intersect.uv.y) * 559;

      // 4. Face Lock (Recorte UV)
      if (faceLockMode && intersect.face) {
        layerCtx.save();
        const uvAttr = intersect.object.geometry.attributes.uv;
        const face = intersect.face;
        const uvA = new THREE.Vector2().fromBufferAttribute(uvAttr, face.a);
        const uvB = new THREE.Vector2().fromBufferAttribute(uvAttr, face.b);
        const uvC = new THREE.Vector2().fromBufferAttribute(uvAttr, face.c);

        layerCtx.beginPath();
        layerCtx.moveTo(uvA.x * CANVAS_W, (1 - uvA.y) * CANVAS_H);
        layerCtx.lineTo(uvB.x * CANVAS_W, (1 - uvB.y) * CANVAS_H);
        layerCtx.lineTo(uvC.x * CANVAS_W, (1 - uvC.y) * CANVAS_H);
        layerCtx.closePath();
        layerCtx.clip();
      }

      const hit = intersects[0];
      const distance = hit.distance;
      const distanceFactor = distance * 0.3;

      // 5. Pintura
      performPaint(
        layerCtx,
        x,
        y,
        brushSize * distanceFactor,
        brushColor,
        brushOpacity,
        isEraser,
        brushTexture,
      );

      if (faceLockMode) layerCtx.restore();
    }
  };

  // 5. Gerenciamento de Eventos de Mouse/Touch
  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    paint(e); // Pinta o ponto inicial imediatamente

    const onPointerMove = (ev) => {
      if(ev.buttons !== 1) return; // Verifica se o botão esquerdo ainda está pressionado
      paint(ev);
      onPaintEnd(); // Salva o histórico ou compõe as camadas
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      onPaintEnd(); // Salva o histórico ou compõe as camadas
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  // 6. Download da Textura
  useEffect(() => {
    if (onDownloadTexture && finalComposition) {
      onDownloadTexture.current = () => {
        const link = document.createElement("a");
        link.download = `textura_albedo.png`;
        link.href = finalComposition.albedo.canvas.toDataURL();
        link.click();
      };
    }
  }, [onDownloadTexture, finalComposition]);

  return (
    <div
      ref={mountRef}
      onPointerDown={handlePointerDown}
      style={{
        width: "100vw",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        cursor: "crosshair",
        touchAction: "none", // Previne scroll ao pintar no mobile
      }}
    />
  );
};

export default Scene3D;
