import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import {
  performPaint,
  performBucketFill,
  performWrapLine,
} from "../utils/paintHelper";
import { extractUVLines } from "../utils/uvHelper";
import { createNewCanvas, loadTemplateToCanvas } from "../utils/canvasHelpers";
import { applyAutomaticShading } from "../utils/shadingHelper";
import { isMobile } from "../utils/mobile";
const General3D = ({
  brushColor,
  brushSize,
  brushOpacity,
  isEraser,
  uploadedModel,
  brushTexture,
  finalComposition,
  activeLayerId,
  setModel,
  handleModelLoaded,
  isWrapMode = true,
  layers,
  saveHistoryAction,
  onPaintEnd,
  activeChannel,
  bodyColor,
  setScene,
  setAmbientLight,
  setDirLight,
  bodyPartsVisibility,
  onUVsExtracted,
  isMirrorEnabled,
  onModelLoaded,
  onDownloadTexture,
  faceLockMode = false,
  triggerTextureUpdate,
  isBucketMode,
  setActiveChannel,
  isAnimating,
  isPaintMode,
  setBrushColor,
  isEyedropper,
  setIsEyedropper,
  triggerAutoUV,
  shadingOpacity,
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
  const lastPaintTarget = useRef({ x: null, y: null, objectId: null });
  const lastPaintTargetM = useRef({ x: null, y: null, objectId: null });
  const mixerRef = useRef(null); // Controla as animações
  const clockRef = useRef(new THREE.Clock()); // Necessário para calcular o tempo da animação
  const beforeData = useRef(null);

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

  // Receba bodyPartsVisibility como prop no Scene3D
  useEffect(() => {
    if (modelRef.current && bodyPartsVisibility) {
      modelRef.current.traverse((child) => {
        if (child.isMesh && bodyPartsVisibility[child.name] !== undefined) {
          // Liga ou desliga a visibilidade do mesh no Three.js
          child.visible = bodyPartsVisibility[child.name];
        }
      });
    }
  }, [bodyPartsVisibility]); // Executa sempre que você clica no olhinho na interface

  const applyTexturesToModel = async () => {
    if (!modelRef.current || !finalComposition || !finalComposition.main) return;

    // Se você for usar shading, aplique no canvas main
    // const shadedCanvas = await applyAutomaticShading(finalComposition.main.canvas, shadingOpacity);
    
    // Cria a textura a partir da composição final atualizada
    const mainTexture = new THREE.CanvasTexture(finalComposition.main.canvas);
    mainTexture.magFilter = THREE.NearestFilter;
    mainTexture.minFilter = THREE.NearestFilter;
    mainTexture.flipY = true;
    mainTexture.needsUpdate = true;

    modelRef.current.traverse((child) => {
      if (child.isMesh) {
        // Preserva o material original se existir, caso contrário cria um novo
        child.material = new THREE.MeshBasicMaterial({
          map: mainTexture,
          side: THREE.DoubleSide,
          transparent: true,
          alphaTest: 0.05,
        });
        child.material.needsUpdate = true;
      }
    });
  };
  useEffect(() => {
    if (controlsRef.current) {
      if (!isPaintMode && !isBucketMode && !isEraser && !isWrapMode) {
        // MODO CÂMERA: 1 dedo rotaciona, Mouse Esquerdo rotaciona
        controlsRef.current.touches.ONE = THREE.TOUCH.ROTATE;
        controlsRef.current.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
      } else {
        // MODO PINTURA: 1 dedo NÃO move a câmera, Mouse Esquerdo NÃO move a câmera
        controlsRef.current.touches.ONE = null;
        controlsRef.current.mouseButtons.LEFT = null;
      }
    }
    // eslint-disable-next-line
  }, [isPaintMode, isBucketMode, isEraser]);

  useEffect(() => {
    applyTexturesToModel();
    // eslint-disable-next-line
  }, [
    triggerTextureUpdate,
    finalComposition,
    bodyColor,
    triggerAutoUV,
    shadingOpacity,
  ]);

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

  const animate = () => {
    requestRef.current = requestAnimationFrame(animate);
    // Atualiza controles de câmera (OrbitControls)
    if (controlsRef.current) {
      controlsRef.current.update();
    }

    // Força atualização da textura se houver pintura ativa
    if (textureRef.current) {
      textureRef.current.needsUpdate = true;
    }

    // Renderiza a cena final
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  // 1. Inicialização da Cena (Roda apenas uma vez)
  useEffect(() => {
    const mountNode = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);
    sceneRef.current = scene;
    raycasterRef.firstHitOnly = true;
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
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    mountNode.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.mouseButtons = {
      LEFT: null,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE,
    };
    controlsRef.current = controls;

    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    setScene(scene);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(0, 0, 10);
    scene.add(dirLight);
    setAmbientLight(scene.children.find((c) => c.isAmbientLight));
    setDirLight(dirLight);

    materialRef.current = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      transparent: true,
    });

    if (layers.length > 1) {
      const baseLayer = layers[0];

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

  useEffect(() => {
    animate();
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
    // eslint-disable-next-line
  }, [isAnimating]);

useEffect(() => {
  // 1. Verificação de segurança: só roda se houver uma URL e se não for a mesma já carregada
  if (!uploadedModel?.url || modelRef.current?.userData?.sourceUrl === uploadedModel.url) {
    return;
  }

  const loader = uploadedModel.extension === "fbx" ? new FBXLoader() : new OBJLoader();
  
  // Use a URL do objeto carregado, não o path fixo
  const modelPath = uploadedModel.url; 

  loader.load(
    modelPath,
    (object) => {
      if (modelRef.current) sceneRef.current.remove(modelRef.current);
        let defaultTexture = null;
      // Se for OBJ, o 'object' é o Group. Se for FBX/GLTF, pode estar em object.scene
      const model = object.scene || object;

      // Guardamos a URL no userData para evitar recarregamento desnecessário
      model.userData.sourceUrl = uploadedModel.url;

      // Configuração de Animação
      if (object.animations && object.animations.length) {
        mixerRef.current = new THREE.AnimationMixer(model);
        const action = mixerRef.current.clipAction(object.animations[0]);
        action.play();
      }

      // Centralização e Escala (Otimizado)
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      const maxAxis = Math.max(size.x, size.y, size.z);
      model.scale.setScalar(2.0 / maxAxis);

      const parts = [];
      // Aplicar material imediatamente (evite o setTimeout se possível)
      model.traverse((child) => {
        if (child.isMesh && finalComposition?.main?.canvas) {
          parts.push(child.name);
          child.material = new THREE.MeshStandardMaterial({
            map: new THREE.CanvasTexture(finalComposition.main.canvas), // Use CanvasTexture
          });
          child.material.map.needsUpdate = true;
        }
      });

      // Atualiza os estados finais
      if (onModelLoaded) onModelLoaded(parts);
      
      modelRef.current = model;
      sceneRef.current.add(model);
      
      if (fitCameraToObject) fitCameraToObject(model);
      
      // Chame as atualizações de estado APENAS aqui no final do sucesso
      setModel(model); 
      handleModelLoaded(model.children);
      
      // Se onPaintEnd altera o pai, ele só deve rodar quando tudo terminar
      if (onPaintEnd) onPaintEnd(); 
    },
    undefined,
    (error) => console.error("Erro ao carregar modelo:", error)
  );

  // 3. Depender apenas da URL evita loops por referência de objeto
}, [uploadedModel?.url, finalComposition]);

  const paint = (e) => {
    if (!modelRef.current || !activeLayerId) return;

    const targetLayer = layers.find((l) => l.id === activeLayerId);
    if (!targetLayer || !targetLayer.channels) return;

    mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const objectsToTest = [];
    modelRef.current.traverse((child) => {
      if (child.isMesh && child.visible) {
        objectsToTest.push(child);
      }
    });
    const intersects = raycasterRef.current.intersectObjects(
      objectsToTest,
      false,
    );

    mouseRef.current.x =
      ((window.innerWidth - e.clientX) / window.innerWidth) * 2 - 1;
    mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

    const mintersects = raycasterRef.current.intersectObjects(
      objectsToTest,
      false,
    );

    if (intersects.length > 0 && intersects[0].uv) {
      const intersect = intersects[0];
      const mintersect = mintersects[0];
      let targetChannel = "main";

      console.log(intersect.object);
      setActiveChannel(targetChannel);
      const isSameMember =
        lastPaintTarget.current.objectId === intersect.object.id;
      const prevX = isSameMember ? lastPaintTarget.current.x : null;
      const prevY = isSameMember ? lastPaintTarget.current.y : null;
      const prevXM = isSameMember ? lastPaintTargetM.current.x : null;
      const prevYM = isSameMember ? lastPaintTargetM.current.y : null;
      const channelData = targetLayer.channels[targetChannel];
      if (!channelData) return;
      const layerCtx = channelData.ctx;
      const CANVAS_W = 1024;
      const CANVAS_H = 1024;

      const x = intersect.uv.x * 585;
      const y = (1 - intersect.uv.y) * 559;
      const mx = mintersect ? mintersect.uv.x * 585 : null;
      const my = mintersect ? (1 - mintersect.uv.y) * 559 : null;

      const isBackFace = () => {
        return (
          intersect.face &&
          intersect.face.a < 6 &&
          intersect.face.b < 6 &&
          intersect.face.c < 6
        );
      };

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
      console.log(intersect.face);

      if (isBucketMode) {
        if (isMirrorEnabled) {
          performBucketFill(
            layerCtx,
            intersect.face,
            intersect.object.geometry,
            brushColor,
            brushOpacity,
            isEraser,
            x,
            y,
            false,
          );
          performBucketFill(
            layerCtx,
            intersect.face,
            intersect.object.geometry,
            brushColor,
            brushOpacity,
            isEraser,
            mx,
            my,
            false,
          );
          return;
        }

        performBucketFill(
          layerCtx,
          intersect.face,
          intersect.object.geometry,
          brushColor,
          brushOpacity,
          isEraser,
          x,
          y,
          isMirrorEnabled,
        );
      } else if (isWrapMode) {
        const pixelY = (1 - intersect.uv.y) * 559;
        // Executa a linha inteira ao invés do pincel normal
        performWrapLine(
          layerCtx,
          x,
          pixelY,
          brushSize,
          brushColor,
          brushOpacity,
          isEraser,
          activeChannel,
        );
      } else {
        const hit = intersects[0];
        const pressure = isMobile() ? 1 : e.pressure; // Fallback para dispositivos sem suporte a pressão
        const distance = hit.distance;
        const distanceFactor = distance * 0.3;

        if (isMirrorEnabled && isBackFace()) {
          performPaint(
            layerCtx,
            x,
            y,
            prevX,
            prevY,
            brushSize * distanceFactor * pressure,
            brushColor,
            brushOpacity,
            isEraser,
            brushTexture,
            false,
          );
          performPaint(
            layerCtx,
            mx,
            my,
            prevXM,
            prevYM,
            brushSize * distanceFactor * pressure,
            brushColor,
            brushOpacity,
            isEraser,
            brushTexture,
            false,
          );
        } else {
          performPaint(
            layerCtx,
            x,
            y,
            prevX,
            prevY,
            brushSize * distanceFactor * pressure,
            brushColor,
            brushOpacity,
            isEraser,
            brushTexture,
            isMirrorEnabled,
          );
        }
        lastPaintTarget.current = { x, y, objectId: intersect.object.id };
        lastPaintTargetM.current = { x: mx, y: my };
      }
      if (intersect.object.material.map) {
        intersect.object.material.map.needsUpdate = true;
      }
      if (faceLockMode) layerCtx.restore();
    }
  };

  // 5. Gerenciamento de Eventos de Mouse/Touch
  const handlePointerDown = (e) => {
    if (isEyedropper) {
      if (!modelRef.current) return;

      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const objectsToTest = [];
      modelRef.current.traverse((child) => {
        if (child.isMesh && child.visible) {
          objectsToTest.push(child);
        }
      });
      const intersects = raycasterRef.current.intersectObjects(
        objectsToTest,
        false,
      );

      if (intersects.length > 0 && intersects[0].uv) {
        const intersect = intersects[0];
        const uv = intersect.uv;
        const meshName = intersect.object.name.toLowerCase();
        let targetChannel = "main";

        const channelData = layers.find((l) => l.id === activeLayerId)
          ?.channels[targetChannel];
        if (!channelData) return;
        const layerCtx = channelData.ctx;
        const CANVAS_W = 1024;
        const CANVAS_H = 1024;
        const x = Math.floor(uv.x * CANVAS_W);
        const y = Math.floor((1 - uv.y) * CANVAS_H);
        const pixelData = layerCtx.getImageData(x, y, 1, 1).data;
        const pickedColor = `rgba(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}, ${
          pixelData[3] / 255
        })`;
        setBrushColor(pickedColor);
        setIsEyedropper(false); // Volta para o modo pintura após escolher a cor
        onPaintEnd(); // Salva o histórico ou compõe as camadas
      }
      return; // Sai da função para não iniciar a pintura
    }
    if (
      e.button !== 0 ||
      (!isPaintMode && !isBucketMode && !isEraser && !isWrapMode)
    )
      return;
    lastPaintTarget.current = { x: null, y: null, objectId: null };
    const activeLayer = layers.find((l) => l.id === activeLayerId);
    if (activeLayer) {
      // Tira a "foto" de como o canvas está antes do risco
      beforeData.current = activeLayer.channels.main.ctx.getImageData(
        0,
        0,
        1024,
        1024,
      );
      paint(e); // Pinta o ponto inicial imediatamente
    }
    const onPointerMove = (ev) => {
      if (ev.buttons !== 1) return; // Verifica se o botão esquerdo ainda está pressionado
      paint(ev);
      onPaintEnd(); // Salva o histórico ou compõe as camadas
    };

  const onPointerUp = () => {
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);

  const activeLayer = layers.find((l) => l.id === activeLayerId);
  
  if (activeLayer && beforeData.current) {
    // Captura o estado DEPOIS da pintura
    const afterData = activeLayer.channels.main.ctx.getImageData(0, 0, 1024, 1024);

    // Envia para o histórico
    saveHistoryAction(
      activeLayerId,
      beforeData.current, // O que tínhamos antes do clique
      afterData           // O que temos agora (opcional, mas bom para o Redo)
    );

    beforeData.current = null;
  }
  
  onPaintEnd(); // Renderiza a cena 3D com a nova pintura
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
        cursor: "none",
        touchAction: "none", // Previne scroll ao pintar no mobile
      }}
    />
  );
};

export default General3D;
