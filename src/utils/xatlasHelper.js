import { UVUnwrapper } from "xatlas-three";
import * as THREE from "three";

let unwrapper = null;

const initXAtlas = async () => {
  if (unwrapper) return unwrapper;

  // 1. Instancia o Unwrapper
  unwrapper = new UVUnwrapper({
    bufferParams: {
      packOptions: {
        resolution: 2048,
        padding: 4,
        bruteForce: false,
        blockAlign: true,
      },
    },
  });

  // 2. CORREÇÃO CRÍTICA (INJEÇÃO DE DEPENDÊNCIA)
  // Forçamos a biblioteca a usar o THREE.js que importamos no nosso projeto.
  // Isso resolve o erro "this.THREE.BufferAttribute is not a constructor".
  unwrapper.THREE = THREE;

  // 3. Carrega o WASM
  await unwrapper.loadLibrary(
    (mode, progress) => console.log(`XAtlas ${mode}: ${Math.round(progress * 100)}%`),
    "https://cdn.jsdelivr.net/npm/xatlasjs@0.2.0/dist/xatlas.wasm",
    "https://cdn.jsdelivr.net/npm/xatlasjs@0.2.0/dist/xatlas.js"
  );

  return unwrapper;
};

export const generateAtlasUVs = async (mesh) => {
  const unwrapperInstance = await initXAtlas();

  // Clona a geometria para não afetar a cena antes da hora
  let geometry = mesh.geometry.clone();

  // Limpa UVs antigos
  geometry.deleteAttribute('uv');

  // Garante que existe índice (Index)
  if (!geometry.index) {
      const positionAttribute = geometry.attributes.position;
      const count = positionAttribute.count;
      const indices = [];
      for (let i = 0; i < count; i++) {
          indices.push(i);
      }
      geometry.setIndex(indices);
  }

  // Executa o Pack Atlas
  // Importante: Passamos como ARRAY [geometry] para evitar o erro "is not iterable"
  const atlas = await unwrapperInstance.packAtlas([geometry]);

  // Retorna a nova geometria processada
  if (atlas && atlas.geometries && atlas.geometries.length > 0) {
      return atlas.geometries[0];
  }

  return geometry;
};