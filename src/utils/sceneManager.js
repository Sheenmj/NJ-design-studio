import * as THREE from 'three';

export class SceneManager {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Setup basic lighting
    this.setupLighting();

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xc8a96e, 1.5); // Warm Gold
    dirLight.position.set(5, 10, 7.5);
    this.scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x406080, 0.8); // Cool blue
    fillLight.position.set(-5, 3, -5);
    this.scene.add(fillLight);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
