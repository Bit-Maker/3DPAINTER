import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { performPaint } from "../utils/paintHelper";
import { extractUVLines } from "../utils/uvHelper";
import { generateAtlasUVs } from "../utils/xatlasHelper";

const Scene3D = ({
  brushColor, brushSize, brushOpacity, isEraser, isPaintMode,
  uploadedModel, brushTexture, finalComposition, activeLayerId, layers,
  onPaintEnd, triggerTextureUpdate, triggerAutoUV, onUVsExtracted,
  onDownloadTexture, activeChannel, faceLockMode = true, channels
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
  const texturesRef = useRef({});

  // 1. SCENE  SETUP 
  useEffect(() => {
    while (mountRef.current.firstChild) mountRef.current.removeChild(mountRef.current.firstChild);

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222); // background color
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 4); 
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // LLights Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
    backLight.position.set(-5, 5, -10);
    scene.add(backLight);

    // Default Material
    materialRef.current = new THREE.MeshStandardMaterial({ 
        color: 0xaaaaaa, // gray
        roughness: 0.5,
        metalness: 0.0,
        side: THREE.DoubleSide // render both sides
    });

    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      if (controlsRef.current) controlsRef.current.update();
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

    // Load a default cube if no model is uploaded
    if (!uploadedModel) {
        loadDefaultCube();
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(requestRef.current);
      if (mountRef.current && renderer.domElement) mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []); 

  // 2. TEXTURE COMPOSITION UPDATE
  useEffect(() => {
    if (!finalComposition || !rendererRef.current || !materialRef.current) return;

    const albedoTex = new THREE.CanvasTexture(finalComposition.albedo.canvas);
    albedoTex.colorSpace = THREE.SRGBColorSpace;
    const roughnessTex = new THREE.CanvasTexture(finalComposition.roughness.canvas);
    roughnessTex.colorSpace = THREE.NoColorSpace;
    const metalnessTex = new THREE.CanvasTexture(finalComposition.metallic.canvas);
    metalnessTex.colorSpace = THREE.NoColorSpace;
    const normalTex = new THREE.CanvasTexture(finalComposition.normal.canvas);
    normalTex.colorSpace = THREE.NoColorSpace;

    texturesRef.current = { albedo: albedoTex, roughness: roughnessTex, metallic: metalnessTex, normal: normalTex };

    // material update
    materialRef.current.map = albedoTex;
    materialRef.current.roughnessMap = roughnessTex;
    materialRef.current.metalnessMap = metalnessTex;
    materialRef.current.normalMap = normalTex;
    
    // Configurações finais
    materialRef.current.color.setHex(0xffffff); // Tira a cor cinza base
    materialRef.current.roughness = 1.0;
    materialRef.current.metalness = 1.0;
    materialRef.current.transparent = true; // Agora pode ser transparente
    materialRef.current.needsUpdate = true;

  }, [finalComposition]);

  // 3. visual texture update
  useEffect(() => {
    if (triggerTextureUpdate > 0 && finalComposition) {
        Object.keys(texturesRef.current).forEach(channel => {
            if (texturesRef.current[channel]) texturesRef.current[channel].needsUpdate = true;
        });
    }
  }, [triggerTextureUpdate, finalComposition]);

  const fitCameraToObject = (object) => {
      if (!cameraRef.current || !controlsRef.current) return;

      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      
      // Conversão Graus -> Radianos
      const fov = cameraRef.current.fov * (Math.PI / 180);
      
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
      
      cameraZ *= 1.5; // Fator de zoom para dar um respiro

      // Camera looking to the center
      const direction = new THREE.Vector3(0, 0, 1).applyQuaternion(cameraRef.current.quaternion);
      cameraRef.current.position.copy(center).add(direction.multiplyScalar(cameraZ));
      
      controlsRef.current.target.copy(center);
      controlsRef.current.update();
  };

  const loadDefaultCube = () => {
    if (!sceneRef.current) return;
    if (modelRef.current) sceneRef.current.remove(modelRef.current);

    const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const mesh = new THREE.Mesh(geometry, materialRef.current);
    mesh.name = "Cube";
    
    const fallbackGeo = applyCubeUV(mesh.geometry);
    mesh.geometry = fallbackGeo;

    sceneRef.current.add(mesh);
    modelRef.current = mesh;
    
    updateUVOverlay(mesh);
  };

  // Model Importation
  useEffect(() => {
    if (!sceneRef.current || !uploadedModel) return;

    const loaderMap = {
      glb: new GLTFLoader(),
      gltf: new GLTFLoader(),
      obj: new OBJLoader(),
      fbx: new FBXLoader(),
    };
    const extension = uploadedModel.name.split(".").pop().toLowerCase();
    const loader = loaderMap[extension];
    const url = URL.createObjectURL(uploadedModel);

    if (loader) {
      loader.load(url, (object) => {
        const loadedScene = object.scene || object;
        
        if (modelRef.current) sceneRef.current.remove(modelRef.current);
        modelRef.current = loadedScene;

        const box = new THREE.Box3().setFromObject(loadedScene);
        const center = box.getCenter(new THREE.Vector3());
        loadedScene.position.sub(center);

        const size = box.getSize(new THREE.Vector3());
        const maxAxis = Math.max(size.x, size.y, size.z);
        const scale = 2.0 / maxAxis;
        loadedScene.scale.set(scale, scale, scale);

        loadedScene.traverse((child) => {
          if (child.isMesh) {
              child.material = materialRef.current;
              child.castShadow = true;
              child.receiveShadow = true;
          }
        });

        sceneRef.current.add(loadedScene);
        fitCameraToObject(loadedScene);
      });
    }
  }, [uploadedModel]);

  // --- Suport Functions ---
  function applyCubeUV(geometry) {
    let geo = geometry;
    if (geo.index) { geo = geo.toNonIndexed(); geometry.dispose(); }
    geo.computeBoundingBox();
    const bbox = geo.boundingBox; const min = bbox.min;
    const range = new THREE.Vector3(); bbox.getSize(range);
    range.x = Math.max(range.x, 0.0001); range.y = Math.max(range.y, 0.0001); range.z = Math.max(range.z, 0.0001);
    const pos = geo.attributes.position; geo.computeVertexNormals(); const norm = geo.attributes.normal;
    const count = pos.count; const uvs = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      const nx = norm.getX(i); const ny = norm.getY(i); const nz = norm.getZ(i);
      const x = pos.getX(i); const y = pos.getY(i); const z = pos.getZ(i);
      let u = 0; let v = 0;
      const ax = Math.abs(nx); const ay = Math.abs(ny); const az = Math.abs(nz);
      if (ax >= ay && ax >= az) { if (nx > 0) { u = -(z-min.z)/range.z; v = (y-min.y)/range.y; u=u/3; v=v/2+0.5; } else { u = (z-min.z)/range.z; v = (y-min.y)/range.y; u=u/3; v=v/2; } } 
      else if (ay >= ax && ay >= az) { if (ny > 0) { u = (x-min.x)/range.x; v = -(z-min.z)/range.z; u=u/3+0.333; v=v/2+0.5; } else { u = (x-min.x)/range.x; v = (z-min.z)/range.z; u=u/3+0.333; v=v/2; } } 
      else { if (nz > 0) { u = (x-min.x)/range.x; v = (y-min.y)/range.y; u=u/3+0.666; v=v/2+0.5; } else { u = -(x-min.x)/range.x; v = (y-min.y)/range.y; u=u/3+0.666; v=v/2; } }
      uvs[i*2] = u; uvs[i*2+1] = v;
    }
    geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2)); geo.attributes.uv.needsUpdate = true;
    return geo;
  }

  // AUTO UV (XAtlas)
  useEffect(() => {
    const runAutoUV = async () => {
      if (triggerAutoUV > 0 && modelRef.current) {
        document.body.style.cursor = "wait";
        const meshes = [];
        modelRef.current.traverse((child) => { if (child.isMesh && child.geometry) meshes.push(child); });
        for (const child of meshes) {
          try {
            const newGeo = await generateAtlasUVs(child);
            child.geometry.dispose(); child.geometry = newGeo;
          } catch (e) {
            console.warn(`XAtlas falhou. Usando Fallback.`, e);
            if (child.geometry) { child.geometry = applyCubeUV(child.geometry); }
          }
          child.geometry.computeVertexNormals();
        }
        if (onPaintEnd) onPaintEnd(); 
        updateUVOverlay(modelRef.current);
        document.body.style.cursor = "default";
      }
    };
    runAutoUV();
  }, [triggerAutoUV]);

  // PAINT LOGIC
  const paint = (e) => {
    if (!modelRef.current || !isPaintMode || !activeLayerId) return;
    const targetLayer = layers.find(l => l.id === activeLayerId);
    if (!targetLayer) return;
    const layerCtx = targetLayer.channels[activeChannel].ctx;

    mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObject(modelRef.current, true);

    if (intersects.length > 0) {
        const intersect = intersects[0];
        if (intersect.uv) {
            const dynamicRadius = (brushSize * intersect.distance * 0.15); 
            const x = intersect.uv.x * 1024;
            const y = (1 - intersect.uv.y) * 1024;
            
            if (faceLockMode && intersect.face) {
                layerCtx.save();
                const geo = intersect.object.geometry;
                const uvAttr = geo.attributes.uv;
                const face = intersect.face;
                const uvA = new THREE.Vector2().fromBufferAttribute(uvAttr, face.a);
                const uvB = new THREE.Vector2().fromBufferAttribute(uvAttr, face.b);
                const uvC = new THREE.Vector2().fromBufferAttribute(uvAttr, face.c);
                layerCtx.beginPath();
                layerCtx.moveTo(uvA.x * 1024, (1 - uvA.y) * 1024);
                layerCtx.lineTo(uvB.x * 1024, (1 - uvB.y) * 1024);
                layerCtx.lineTo(uvC.x * 1024, (1 - uvC.y) * 1024);
                layerCtx.closePath();
                layerCtx.clip();
            }
            performPaint(layerCtx, x, y, dynamicRadius, brushColor, brushOpacity, isEraser, brushTexture);
            if (faceLockMode) layerCtx.restore();
        }
    }
  };

  const handlePointerDown = (e) => {
      if (!isPaintMode) return;
      window.addEventListener("pointermove", paint);
      window.addEventListener("pointerup", stopPaint);
      paint(e);
  };
  const stopPaint = () => {
      window.removeEventListener("pointermove", paint);
      window.removeEventListener("pointerup", stopPaint);
      if (onPaintEnd) onPaintEnd();
  };
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
  useEffect(() => { if (controlsRef.current) controlsRef.current.enabled = !isPaintMode; }, [isPaintMode]);

  useEffect(() => {
    if (onDownloadTexture && finalComposition) {
      onDownloadTexture.current = () => {
        const link = document.createElement("a");
        link.download = `textura_${activeChannel}.png`;
        link.href = finalComposition[activeChannel].canvas.toDataURL();
        link.click();
      };
    }
  }, [onDownloadTexture, activeChannel, finalComposition]);

  return <div ref={mountRef} onPointerDown={handlePointerDown} style={{ width: "100vw", height: "100vh", position: "fixed", top: 0, left: 0, cursor: isPaintMode ? "none" : "default", zIndex: 0 }} />;
};

export default Scene3D;