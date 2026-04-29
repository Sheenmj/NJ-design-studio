import * as THREE from 'three';

export const sharedUniforms = {
  uTime: { value: 0 }
};

const vertexShader = `
  varying vec3 vPos;
  void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uSize;
  uniform vec3 uColor;
  uniform vec3 uBaseColor;
  uniform float uSeed;
  varying vec3 vPos;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  void main() {
    vec3 absPos = abs(vPos) / (uSize * 0.5);
    vec2 gridPos;
    float isTop = 0.0;
    
    if (absPos.y > 0.999) {
      gridPos = vec2(vPos.x, vPos.z);
      isTop = 1.0;
    } else if (absPos.x > 0.999) {
      gridPos = vec2(vPos.z, vPos.y);
    } else {
      gridPos = vec2(vPos.x, vPos.y);
    }

    // Window grid size
    float spacing = 0.4;
    float windowSize = 0.7; // 70% window, 30% gap
    
    vec2 cell = floor(gridPos / spacing);
    vec2 local = fract(gridPos / spacing);
    
    float margin = (1.0 - windowSize) / 2.0;
    bool inWindow = local.x > margin && local.x < (1.0 - margin) && 
                    local.y > margin && local.y < (1.0 - margin);
    
    // Randomize based on cell + building seed
    float r = random(cell + vec2(uSeed, uSeed * 2.0));
    
    // Time based animation (twinkling)
    float t = uTime * 0.5 + r * 10.0;
    
    // Probability of a window being lit. 
    // Make them sparser towards the bottom based on vPos.y
    float heightPct = (vPos.y + uSize.y * 0.5) / uSize.y;
    // Tweak to look like the image: more scattered at bottom, denser at top
    float density = smoothstep(0.0, 0.8, heightPct);
    float litProb = density * 0.8 + 0.1; // base 10% + up to 80% based on height

    bool isLit = inWindow && (r < litProb) && isTop == 0.0;
    
    vec3 col = uBaseColor;
    if (isLit) {
       // subtle flicker
       float flicker = 0.8 + 0.2 * sin(t * 3.0);
       col = uColor * flicker;
    }

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function createBuilding(width, height, depth, seed = Math.random()) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: sharedUniforms.uTime,
      uSize: { value: new THREE.Vector3(width, height, depth) },
      uColor: { value: new THREE.Color(0xffd27f) }, // Warm glowing gold
      uBaseColor: { value: new THREE.Color(0x0a0c10) }, // Very dark base
      uSeed: { value: seed }
    },
    transparent: true,
  });

  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

export function createCityscape() {
  const cityGroup = new THREE.Group();
  const buildingsCount = 40; // slightly more buildings

  for (let i = 0; i < buildingsCount; i++) {
    const w = 1.5 + Math.random() * 3;
    const h = 5 + Math.random() * 20;
    const d = 1.5 + Math.random() * 3;

    const building = createBuilding(w, h, d, i);
    
    // Spread them out more, mostly behind
    building.position.x = (Math.random() - 0.5) * 60;
    building.position.z = (Math.random() - 0.5) * 40 - 10;
    building.position.y = h / 2 - 10; // Align bottoms

    cityGroup.add(building);
  }

  return cityGroup;
}

