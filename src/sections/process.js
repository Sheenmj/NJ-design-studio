import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initProcess() {
  const steps = [
    {
      num: "01",
      title: "Discovery & Brief",
      desc: "Deep-dive into site context, client aspirations, budget, and regulatory frameworks."
    },
    {
      num: "02",
      title: "Concept Design",
      desc: "Volumetric studies, massing, and initial spatial arrangements presented via 3D schematics."
    },
    {
      num: "03",
      title: "Design Development",
      desc: "Refining materials, structural systems, and MEP integration. High-fidelity renders produced."
    },
    {
      num: "04",
      title: "Construction Docs",
      desc: "Detailed technical drawings and specifications for bidding and permitting."
    },
    {
      num: "05",
      title: "Build & Handover",
      desc: "On-site supervision ensuring the built form perfectly matches the architectural intent."
    }
  ];

  const timeline = document.getElementById('process-timeline');

  steps.forEach(s => {
    const step = document.createElement('div');
    step.className = 'process-step';
    step.innerHTML = `
      <div class="step-number">${s.num}</div>
      <h3 class="step-title">${s.title}</h3>
      <p class="step-desc">${s.desc}</p>
    `;
    timeline.appendChild(step);
  });

  // Simple background wireframe animation for Process section
  const canvas = document.getElementById('process-canvas');
  if (canvas) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / 600, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    
    // Set size based on parent container
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

    camera.position.z = 10;

    const geometry = new THREE.IcosahedronGeometry(3, 1);
    const edges = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial({ 
      color: 0xc8a96e, 
      transparent: true, 
      opacity: 0.1 
    });
    
    const wireframe = new THREE.LineSegments(edges, material);
    scene.add(wireframe);

    // Animation Loop
    function animate() {
      requestAnimationFrame(animate);
      wireframe.rotation.x += 0.002;
      wireframe.rotation.y += 0.003;
      renderer.render(scene, camera);
    }
    animate();
  }

  // GSAP Horizontal Scroll Setup (optional if we want to force horizontal scroll, 
  // but CSS overflow-x: auto works better for touch devices)
  gsap.from(".process-step", {
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2,
    scrollTrigger: {
      trigger: ".process-section",
      start: "top 70%",
    }
  });
}
