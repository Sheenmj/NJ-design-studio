import * as THREE from 'three';
import { createCityscape } from '../utils/buildingGeometry.js';
import { addMessageToStore } from '../utils/store.js';

export function initContact() {
  const form = document.getElementById('contact-form');
  const successMsg = document.getElementById('form-success');
  const submitBtn = document.getElementById('contact-submit');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Basic validation
      const requiredFields = form.querySelectorAll('[required]');
      let isValid = true;
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          isValid = false;
          field.style.borderColor = 'red';
        } else {
          field.style.borderColor = '';
        }
      });

      if (isValid) {
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Sending...</span>';
        submitBtn.disabled = true;

        // Collect form data
        const message = {
          name: document.getElementById('cf-name')?.value || '',
          email: document.getElementById('cf-email')?.value || '',
          phone: document.getElementById('cf-phone')?.value || '',
          type: document.getElementById('cf-type')?.value || '',
          budget: document.getElementById('cf-budget')?.value || '',
          message: document.getElementById('cf-message')?.value || ''
        };

        setTimeout(() => {
          // Save message to localStorage
          addMessageToStore(message);

          form.reset();
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          successMsg.classList.add('active');
          
          setTimeout(() => {
            successMsg.classList.remove('active');
          }, 5000);
        }, 1500);
      }
    });
  }

  // Background 3D scene
  const canvas = document.getElementById('contact-canvas');
  if (canvas) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    
    const updateSize = () => {
      const wrap = canvas.parentElement;
      if (wrap) {
        camera.aspect = wrap.clientWidth / wrap.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(wrap.clientWidth, wrap.clientHeight);
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);

    camera.position.set(0, 5, 20);
    camera.lookAt(0, 0, 0);

    const cityscape = createCityscape();
    // Make it more subtle
    cityscape.scale.set(0.5, 0.5, 0.5);
    cityscape.position.y = -5;
    scene.add(cityscape);

    // Subtle lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xc8a96e, 0.5);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Animation Loop
    let mouseX = 0;
    let targetX = 0;

    document.addEventListener('mousemove', (event) => {
      mouseX = (event.clientX - window.innerWidth / 2);
    });

    function animate() {
      requestAnimationFrame(animate);
      
      targetX = mouseX * 0.001;
      camera.position.x += (targetX * 2 - camera.position.x) * 0.05;
      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
    }
    animate();
  }
}
