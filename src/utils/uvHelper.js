// src/utils/uvHelper.js
import * as THREE from 'three';

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
            v: uvAttribute.getY(index)
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