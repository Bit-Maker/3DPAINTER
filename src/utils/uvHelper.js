import * as THREE from "three";
// src/utils/uvHelper.js
export const extractUVLines = (geometry) => {
  const lines = []; // Vai guardar pares de coordenadas: [x1, y1, x2, y2]

  // Garante que temos atributos de posição e UV
  const uvAttribute = geometry.attributes.uv;
  const indexAttribute = geometry.index;

  if (!uvAttribute) return [];

  // Função auxiliar para pegar UV de um índice
  const getUV = (index) => {
    return {
      u: uvAttribute.getX(index),
      v: uvAttribute.getY(index),
    };
  };

  // Processa geometria INDEXADA (mais comum) ou NÃO INDEXADA
  if (indexAttribute) {
    const count = indexAttribute.count;
    for (let i = 0; i < count; i += 3) {
      // Pega os índices dos 3 vértices do triângulo
      const idx1 = indexAttribute.getX(i);
      const idx2 = indexAttribute.getX(i + 1);
      const idx3 = indexAttribute.getX(i + 2);

      const uv1 = getUV(idx1);
      const uv2 = getUV(idx2);
      const uv3 = getUV(idx3);

      // Adiciona as 3 linhas do triângulo
      lines.push(uv1, uv2);
      lines.push(uv2, uv3);
      lines.push(uv3, uv1);
    }
  } else {
    const count = uvAttribute.count;
    for (let i = 0; i < count; i += 3) {
      const uv1 = getUV(i);
      const uv2 = getUV(i + 1);
      const uv3 = getUV(i + 2);

      lines.push(uv1, uv2);
      lines.push(uv2, uv3);
      lines.push(uv3, uv1);
    }
  }

  return lines;
};


export const generateAutoUVs = (geometry) => {
  // 1. Garantir que a geometria não é indexada (descola todas as faces)
  // Isso garante que pintar a quina de uma face não afete a outra
  let nonIndexedGeo = geometry.index ? geometry.toNonIndexed() : geometry.clone();

  const posAttribute = nonIndexedGeo.attributes.position;
  const vertexCount = posAttribute.count;
  const triangleCount = vertexCount / 3;

  // 2. Criar um novo array para as coordenadas UV (2 valores por vértice)
  const uvs = new Float32Array(vertexCount * 2);

  // 3. Calcular o tamanho do grid para caber todos os triângulos
  const gridSize = Math.ceil(Math.sqrt(triangleCount));
  const cellSize = 1.0 / gridSize;
  const padding = cellSize * 0.05; // 5% de margem para o pincel não vazar
  const usableCellSize = cellSize - padding * 2;

  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vC = new THREE.Vector3();

  for (let i = 0; i < triangleCount; i++) {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;

    const cellU = col * cellSize + padding;
    const cellV = row * cellSize + padding;

    // Pegar vértices 3D do triângulo
    vA.fromBufferAttribute(posAttribute, i * 3 + 0);
    vB.fromBufferAttribute(posAttribute, i * 3 + 1);
    vC.fromBufferAttribute(posAttribute, i * 3 + 2);

    // Calcular a normal para saber de qual eixo estamos "olhando" a face
    const cb = new THREE.Vector3().subVectors(vC, vB);
    const ab = new THREE.Vector3().subVectors(vA, vB);
    const normal = new THREE.Vector3().crossVectors(cb, ab).normalize();

    // Box Projection: Escolhe o melhor ângulo (Eixo dominante) para projetar
    const nx = Math.abs(normal.x);
    const ny = Math.abs(normal.y);
    const nz = Math.abs(normal.z);

    let uIdx, vIdx;
    if (nx >= ny && nx >= nz) { uIdx = 'y'; vIdx = 'z'; }
    else if (ny >= nx && ny >= nz) { uIdx = 'x'; vIdx = 'z'; }
    else { uIdx = 'x'; vIdx = 'y'; }

    // Projeta os vértices 3D em 2D
    let pA = new THREE.Vector2(vA[uIdx], vA[vIdx]);
    let pB = new THREE.Vector2(vB[uIdx], vB[vIdx]);
    let pC = new THREE.Vector2(vC[uIdx], vC[vIdx]);

    // Encontra os limites da face projetada
    const minU = Math.min(pA.x, pB.x, pC.x);
    const maxU = Math.max(pA.x, pB.x, pC.x);
    const minV = Math.min(pA.y, pB.y, pC.y);
    const maxV = Math.max(pA.y, pB.y, pC.y);

    const rangeU = maxU - minU || 1;
    const rangeV = maxV - minV || 1;
    const maxRange = Math.max(rangeU, rangeV); // Mantém a proporção real da face!

    // Função para encaixar o ponto dentro do quadradinho do Grid no UV
    const mapToCell = (p) => {
      return {
        u: cellU + ((p.x - minU) / maxRange) * usableCellSize,
        v: cellV + ((p.y - minV) / maxRange) * usableCellSize
      };
    };

    const uvA = mapToCell(pA);
    const uvB = mapToCell(pB);
    const uvC = mapToCell(pC);

    // Salva no mapa UV
    uvs[(i * 3 + 0) * 2 + 0] = uvA.u;
    uvs[(i * 3 + 0) * 2 + 1] = uvA.v;
    uvs[(i * 3 + 1) * 2 + 0] = uvB.u;
    uvs[(i * 3 + 1) * 2 + 1] = uvB.v;
    uvs[(i * 3 + 2) * 2 + 0] = uvC.u;
    uvs[(i * 3 + 2) * 2 + 1] = uvC.v;
  }

  nonIndexedGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  return nonIndexedGeo;
};