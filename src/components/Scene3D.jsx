import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import {
  performPaint,
  performBucketFill,
  performWrapLine,
} from "../utils/paintHelper";
import { extractUVLines } from "../utils/uvHelper";
import { createNewCanvas, loadTemplateToCanvas } from "../utils/canvasHelpers";
import { applyAutomaticShading } from "../utils/shadingHelper";
const Scene3D = ({
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
  setShadingOpacity,
  shadingOpacity
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
  const beforeShirtData = useRef(null);
  const beforePantsData = useRef(null);

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
    if (!modelRef.current || !finalComposition) return;
    const shirtCtx = finalComposition.shirt?.ctx;
    const pantsCtx = finalComposition.pants?.ctx;
    const finalShirtCanvas = createNewCanvas(bodyColor, 585, 559);
    finalShirtCanvas.ctx.drawImage(
      shirtCtx ? shirtCtx.canvas : finalShirtCanvas.canvas,
      0,
      0,
    );
    const finalPantsCanvas = createNewCanvas(bodyColor, 585, 559);
    finalPantsCanvas.ctx.drawImage(
      pantsCtx ? pantsCtx.canvas : finalPantsCanvas.canvas,
      0,
      0,
    );

    const shadedShirt = await applyAutomaticShading(
      finalShirtCanvas.canvas,
      shadingOpacity,
    );
    const shadedPants = await applyAutomaticShading(
      finalPantsCanvas.canvas,
      shadingOpacity,
    );

    const shirtTexture = new THREE.CanvasTexture(shadedShirt);
    const pantsTexture = new THREE.CanvasTexture(shadedPants);

    [shirtTexture, pantsTexture].forEach((tex) => {
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      tex.flipY = true;
      tex.needsUpdate = true;
    });

    modelRef.current.traverse((child) => {
      if (child.isMesh) {
        const name = child.name.toLowerCase();
        const isPants = name.includes("leg") || name.includes("foot");
        if (child.material) {
          child.material = child.material.clone();
          child.material = new THREE.MeshBasicMaterial({
            map: isPants ? pantsTexture : shirtTexture,
            side: THREE.DoubleSide,
            transparent: true,
            alphaTest: 0.05,
          });
        }

        if (isPants) {
          child.material.map = pantsTexture;
        } else {
          child.material.map = shirtTexture;
        }
        child.material.side = THREE.DoubleSide; // Renderiza os dois lados da face
        child.material.transparent = true;
        child.material.alphaTest = 0.05;
        child.material.needsUpdate = true;
        child.material.map.needsUpdate = true; // ISSO É VITAL
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
  }, [triggerTextureUpdate, finalComposition, bodyColor,triggerAutoUV,shadingOpacity]);

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

    if (modelRef.current) {
      // Pegamos o tempo decorrido para a matemática senoidal
      const t = clockRef.current.getElapsedTime();

      if (isAnimating) {
        modelRef.current.traverse((child) => {
          if (child.isMesh) {
            const name = child.name.toLowerCase();

            // --- LÓGICA DE MOVIMENTO R6 (Respirar + Balanço) ---

            // 1. TORSO: O centro do movimento
            if (name.includes("torso")) {
              // Sobe e desce (Respiração)
              child.position.y = Math.sin(t * 1.5) * 0.02;
              // Balanço lateral suave (Weight Shift)
              child.rotation.z = Math.sin(t * 0.8) * 0.02;
              // Inclinação leve para frente/trás
              child.rotation.x = 0.05 + Math.sin(t * 1.5) * 0.01;
            }

            // 2. HEAD: Segue o corpo mas tenta estabilizar o olhar
            if (name.includes("head")) {
              child.position.y = Math.sin(t * 1.5) * 0.025;
              child.rotation.z = -Math.sin(t * 0.8) * 0.01; // Contra-balanço
              child.rotation.y = Math.sin(t * 0.5) * 0.05; // Olha levemente pros lados
            }

            // 3. ARMS: Pêndulo lateral e frontal
            if (name.includes("arm")) {
              const side = name.includes("left") ? 1 : -1;
              // Abre e fecha a axila levemente
              child.rotation.z = (Math.sin(t * 1.5) * 0.03 + 0.02) * side;
              // Balanço frontal (atrasado em relação ao corpo)
              child.rotation.x = Math.sin(t * 0.8 + side * 0.5) * 0.01;
              // Acompanha a altura do torso
              child.position.y = Math.sin(t * 1.5) * 0.02;
            }

            // 4. LEGS: Mantêm a base fixa mas giram conforme o quadril
            if (name.includes("leg")) {
              child.rotation.z = -Math.sin(t * 0.8) * 0.01;
            }
          }
        });
      } else {
        // --- LÓGICA DE PAUSE (Reset de Pose) ---
        // Quando pausado, o modelo volta para a pose estática perfeita para pintura
        modelRef.current.traverse((child) => {
          if (child.isMesh) {
            // Reset suave: você pode usar um lerp aqui se quiser que ele "deslize" para o zero
            child.rotation.set(0, 0, 0);
            child.position.set(0, 0, 0);
          }
        });
      }
    }

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
    if (sceneRef.current && !uploadedModel) {
      const loader = new OBJLoader();
      const modelPath = "/models/avatar.obj";
      loader.load(
        modelPath,
        (object) => {
          if (modelRef.current) sceneRef.current.remove(modelRef.current);

          const model = object.scene;

          // 1. Configurar Animação
          if (object.animations && object.animations.length) {
            mixerRef.current = new THREE.AnimationMixer(model);
            // Toca a primeira animação encontrada no arquivo (geralmente a Idle)
            const action = mixerRef.current.clipAction(object.animations[0]);
            action.play();
          }

          const box = new THREE.Box3().setFromObject(object);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());

          object.position.sub(center);
          const maxAxis = Math.max(size.x, size.y, size.z);
          const scale = 2.0 / maxAxis;
          object.scale.set(scale, scale, scale);
          const parts = [];
          setTimeout(() => {
            object.traverse(async (child) => {
              if (
                child.isMesh &&
                finalComposition &&
                finalComposition.shirt &&
                finalComposition.pants
              ) {
                const name = child.name.toLowerCase();
                parts.push(child.name); // Pega o nome de cada membro

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

          if (onModelLoaded) onModelLoaded(parts);

          modelRef.current = object;
          sceneRef.current.add(object);
          fitCameraToObject(object);
          updateUVOverlay(object);
          setModel(object);
          handleModelLoaded(object.children);
        },
        undefined,
        (error) => console.error("Erro ao carregar avatar.obj:", error),
      );
    }
    onPaintEnd();

    // eslint-disable-next-line
  }, [uploadedModel]);

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


      mouseRef.current.x = ((window.innerWidth - e.clientX)/window.innerWidth) * 2 - 1;
      mouseRef.current.y = -((e.clientY) / window.innerHeight ) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

       const mintersects = raycasterRef.current.intersectObjects(
      objectsToTest,
      false,
    );

    if (intersects.length > 0 && intersects[0].uv) {
      const intersect = intersects[0];
      const mintersect = mintersects[0];
      const meshName = intersect.object.name.toLowerCase();
      let targetChannel = "shirt";
      if (meshName.includes("leg")) {
        targetChannel = "pants";
      }
      console.log(intersect.object)
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
      const CANVAS_W = 585;
      const CANVAS_H = 559;

      const x = intersect.uv.x * 585;
      const y = (1 - intersect.uv.y) * 559;
      const mx = mintersect? mintersect.uv.x * 585 : null;
      const my = mintersect?(1 - mintersect.uv.y) * 559: null;


      const isBackFace = ()=> {
        return intersect.face && intersect.face.a<6&& intersect.face.b<6&& intersect.face.c<6
      }

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
      }            console.log(intersect.face)


      if (isBucketMode && !isBackFace()) {
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
        const pressure = e.pressure || 0.5; // Fallback para dispositivos sem suporte a pressão
        const distance = hit.distance;
        const distanceFactor = distance * 0.3;

        if(isMirrorEnabled &&isBackFace()) {

          if(isBucketMode) {
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
        return
          }

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
        lastPaintTargetM.current = { x: mx,y:  my };
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
        let targetChannel = "shirt";
        if (meshName.includes("leg")) {
          targetChannel = "pants";
        }
        const channelData = layers.find((l) => l.id === activeLayerId)
          ?.channels[targetChannel];
        if (!channelData) return;
        const layerCtx = channelData.ctx;
        const CANVAS_W = 585;
        const CANVAS_H = 559;
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
    paint(e); // Pinta o ponto inicial imediatamente
    const activeLayer = layers.find((l) => l.id === activeLayerId);
    if (activeLayer) {
      // Tira a "foto" de como o canvas está antes do risco
      beforeShirtData.current = activeLayer.channels.shirt.ctx.getImageData(
        0,
        0,
        585,
        559,
      );
      beforePantsData.current = activeLayer.channels.pants.ctx.getImageData(
        0,
        0,
        585,
        559,
      );
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
      if (activeLayer && beforeShirtData.current && beforePantsData.current) {
        const afterShirtData = activeLayer.channels.shirt.ctx.getImageData(
          0,
          0,
          585,
          559,
        );
        const afterPantsData = activeLayer.channels.pants.ctx.getImageData(
          0,
          0,
          585,
          559,
        );
        saveHistoryAction(
          activeLayerId,
          beforeShirtData.current,
          afterShirtData,
          beforePantsData.current,
          afterPantsData,
        );

        // Limpa as refs temporárias
        beforeShirtData.current = null;
        beforePantsData.current = null;
      }
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
        cursor: "none",
        touchAction: "none", // Previne scroll ao pintar no mobile
      }}
    />
  );
};

export default Scene3D;
