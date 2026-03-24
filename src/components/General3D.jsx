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
import { generateAutoUVs } from "../utils/uvHelper";
import {  createNewCanvas, loadTemplateToCanvas } from "../utils/canvasHelpers";
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
  const mixerRef = useRef(null); 
  const beforeData = useRef(null);
  useEffect(() => {
    if (modelRef.current && bodyPartsVisibility) {
      modelRef.current.traverse((child) => {
        if (child.isMesh && bodyPartsVisibility[child.name] !== undefined) {
          child.visible = bodyPartsVisibility[child.name];
        }
      });
    }
  }, [bodyPartsVisibility]); 
  const applyTexturesToModel = async () => {
    if (!modelRef.current || !finalComposition || !finalComposition.main) return;
    const finalCanvas = createNewCanvas(bodyColor,1024,1024)
    finalCanvas.ctx.drawImage(finalComposition.main.canvas,0,0)
    const mainTexture = new THREE.CanvasTexture(finalCanvas.canvas);
    mainTexture.magFilter = THREE.NearestFilter;
    mainTexture.minFilter = THREE.NearestFilter;
    mainTexture.flipY = true;
    mainTexture.needsUpdate = true;
    modelRef.current.traverse((child) => {
      if (child.isMesh) {
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
        controlsRef.current.touches.ONE = THREE.TOUCH.ROTATE;
        controlsRef.current.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
      } else {
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
    if (controlsRef.current) {
      controlsRef.current.update();
    }
    if (textureRef.current) {
      textureRef.current.needsUpdate = true;
    }
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };
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
    if (!uploadedModel?.url || modelRef.current?.userData?.sourceUrl === uploadedModel.url) {
      return;
    }
    const loader = uploadedModel.extension === "fbx" ? new FBXLoader() : new OBJLoader();
    const modelPath = uploadedModel.url;
    loader.load(
      modelPath,
      (object) => {
        if (modelRef.current) sceneRef.current.remove(modelRef.current);
        const model = object.scene || object;
        model.userData.sourceUrl = uploadedModel.url;
        if (object.animations && object.animations.length) {
          mixerRef.current = new THREE.AnimationMixer(model);
          const action = mixerRef.current.clipAction(object.animations[0]);
          action.play();
        }
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        const maxAxis = Math.max(size.x, size.y, size.z);
        model.scale.setScalar(2.0 / maxAxis);
        let foundImage = null;
        model.traverse((child) => {
          if (child.isMesh && child.material?.map?.image) {
            foundImage = child.material.map.image;
          }
        });
        const activeLayer = layers.find((l) => l.id === activeLayerId) || layers[0];
        if (activeLayer && activeLayer.channels.main) {
          const ctx = activeLayer.channels.main.ctx;
          const canvas = activeLayer.channels.main.canvas;

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (foundImage) {
            if (foundImage.complete) {
              ctx.drawImage(foundImage, 0, 0, canvas.width, canvas.height);
              if (onPaintEnd) onPaintEnd(); 
            } else {
              foundImage.onload = () => {
                ctx.drawImage(foundImage, 0, 0, canvas.width, canvas.height);
                if (onPaintEnd) onPaintEnd();
              };
            }
          } else {
          //  ctx.fillStyle = "#ffffff";
          //  ctx.fillRect(0, 0, canvas.width, canvas.height);
         //   if (onPaintEnd) onPaintEnd(); 
          }
        }
        const parts = [];
        model.traverse((child) => {
          if (child.isMesh && finalComposition?.main?.canvas) {
            parts.push(child.name);
         //   child.geometry = generateAutoUVs(child.geometry);
            child.material = new THREE.MeshStandardMaterial({
              map: new THREE.CanvasTexture(finalComposition.main.canvas), // Use CanvasTexture
            });
            child.material.map.needsUpdate = true;
          }
        });
        if (onModelLoaded) onModelLoaded(parts);
        modelRef.current = model;
        sceneRef.current.add(model);
        if (fitCameraToObject) fitCameraToObject(model);
        setModel(model);
        handleModelLoaded(model.children);
      },
      undefined,
      (error) => console.error("Erro ao carregar modelo:", error)
    );
  }, [uploadedModel?.url]);
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

      const x = intersect.uv.x * 1024;
      const y = (1 - intersect.uv.y) * 1024;
      const mx = mintersect ? mintersect.uv.x * 1024 : null;
      const my = mintersect ? (1 - mintersect.uv.y) * 1024 : null;
      const isBackFace = () => {
        return (
          intersect.face &&
          intersect.face.a < 6 &&
          intersect.face.b < 6 &&
          intersect.face.c < 6
        );
      };
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
        const pressure = isMobile() ? 1 : e.pressure; 
        const distance = hit.distance;
        const distanceFactor = distance * 0.3;

        if (isMirrorEnabled) {
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
        setIsEyedropper(false); 
        onPaintEnd(); 
      }
      return; 
    }
    if (
      e.button !== 0 ||
      (!isPaintMode && !isBucketMode && !isEraser && !isWrapMode)
    )
      return;
    lastPaintTarget.current = { x: null, y: null, objectId: null };
    const activeLayer = layers.find((l) => l.id === activeLayerId);
    if (activeLayer) {
      beforeData.current = activeLayer.channels.main.ctx.getImageData(
        0,
        0,
        1024,
        1024,
      );
      paint(e); 
    }
    const onPointerMove = (ev) => {
      if (ev.buttons !== 1) return; 
      paint(ev);
      onPaintEnd(); 
    };
  const onPointerUp = () => {
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);
  const activeLayer = layers.find((l) => l.id === activeLayerId);
  if (activeLayer && beforeData.current) {
    const afterData = activeLayer.channels.main.ctx.getImageData(0, 0, 1024, 1024);
    saveHistoryAction(
      activeLayerId,
      beforeData.current, 
      afterData           
    );
    beforeData.current = null;
  }
  onPaintEnd(); 
};
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };
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
        touchAction: "none", 
      }}
    />
  );
};

export default General3D;
