
import * as THREE from "three";
export const lightingProfiles = {
  midday: {
    ambient: { color: 0xffffff, intensity: 0.8 },
    directional: { color: 0xffffff, intensity: 1.2, position: [5, 10, 5] },
    background: "#87CEEB" // Céu azul clássico
  },
  sunset: {
    ambient: { color: 0xffa500, intensity: 0.4 },
    directional: { color: 0xff4500, intensity: 1.5, position: [-10, 5, 0] },
    background: "#45223a" // Tom roxo/alaranjado
  },
  night: {
    ambient: { color: 0x4040ff, intensity: 0.1 },
    directional: { color: 0xffffff, intensity: 0.3, position: [0, 10, -5] },
    background: "#050510"
  },
  studio: { // Luz neutra para design puro
    ambient: { color: 0xffffff, intensity: 1.0 },
    directional: { color: 0xffffff, intensity: 0.5, position: [0, 0, 10] },
    background: "#222222"
  }
};

export const updateSceneLighting = (scene, ambientLight, dirLight, profileName) => {
  const profile = lightingProfiles[profileName];

  // Atualiza Luz Ambiente
  ambientLight.color.setHex(profile.ambient.color);
  ambientLight.intensity = profile.ambient.intensity;

  // Atualiza Luz Direcional (O "Sol")
  dirLight.color.setHex(profile.directional.color);
  dirLight.intensity = profile.directional.intensity;
  dirLight.position.set(...profile.directional.position);

  // Atualiza o fundo do preview
  scene.background = new THREE.Color(profile.background);
};