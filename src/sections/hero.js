import * as THREE from 'three';
import { gsap } from 'gsap';
import { SceneManager } from '../utils/sceneManager.js';
import { createBuilding, createCityscape, sharedUniforms } from '../utils/buildingGeometry.js';

export function initHero() {
  const manager = new SceneManager('hero-canvas');
  if (!manager.canvas) return;

  // Set camera position
  manager.camera.position.set(0, 5, 20);
  manager.camera.lookAt(0, 0, 0);

  // Add Central Hero Building
  const heroBuilding = createBuilding(4, 15, 4);
  heroBuilding.position.y = -5;
  manager.scene.add(heroBuilding);

  // Add Background City
  const cityscape = createCityscape();
  manager.scene.add(cityscape);

  // Add Particles
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 2000;
  const posArray = new Float32Array(particlesCount * 3);

  for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 50;
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.02,
    color: 0xc8a96e,
    transparent: true,
    opacity: 0.5
  });
  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  manager.scene.add(particlesMesh);

  // Mouse Parallax
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
  });

  // GSAP Intro Animation
  gsap.from(heroBuilding.position, {
    y: -20,
    duration: 2.5,
    ease: "power3.out"
  });

  gsap.from(cityscape.position, {
    y: -30,
    duration: 3,
    ease: "power2.out",
    delay: 0.5
  });

  // Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Auto rotate slowly
    heroBuilding.rotation.y = elapsedTime * 0.05;
    cityscape.rotation.y = elapsedTime * 0.01;
    
    // Update shared uniforms
    sharedUniforms.uTime.value = elapsedTime;

    // Particles subtle movement
    particlesMesh.rotation.y = elapsedTime * 0.05;

    // Parallax easing
    targetX = mouseX * 0.001;
    targetY = mouseY * 0.001;
    
    manager.camera.position.x += (targetX * 5 - manager.camera.position.x) * 0.05;
    manager.camera.position.y += (-targetY * 5 + 5 - manager.camera.position.y) * 0.05;
    manager.camera.lookAt(0, 0, 0);

    manager.render();
  }

  animate();
}
