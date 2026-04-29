import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initHero } from './sections/hero.js';
import { initPortfolio } from './sections/portfolio.js';
import { initServices } from './sections/services.js';
import { initProcess } from './sections/process.js';
import { initAbout } from './sections/about.js';

import { initContact } from './sections/contact.js';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Nav Toggle
  const hamburger = document.getElementById('nav-hamburger');
  const navLinks = document.getElementById('nav-links');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('nav-active');
    navLinks.classList.toggle('nav-active');
  });

  // Smooth Scroll & Active Nav State
  const sections = document.querySelectorAll('.section');
  const navItems = document.querySelectorAll('.nav-link');

  navItems.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      hamburger.classList.remove('nav-active');
      navLinks.classList.remove('nav-active');
      
      const targetId = link.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        window.scrollTo({
          top: targetSection.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });

  // ScrollSpy for Nav
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.clientHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach(li => {
      li.classList.remove('active');
      if (li.getAttribute('href').substring(1) === current) {
        li.classList.add('active');
      }
    });
    
    // Navbar background transition
    const navbar = document.getElementById('navbar');
    if (scrollY > 50) {
      navbar.style.background = 'rgba(8, 12, 16, 0.95)';
    } else {
      navbar.style.background = 'rgba(8, 12, 16, 0.8)';
    }
  });

  // Stat Counters Animation
  const stats = document.querySelectorAll('.hero-stat-num');
  stats.forEach(stat => {
    const target = parseInt(stat.getAttribute('data-target'));
    gsap.to(stat, {
      innerHTML: target,
      duration: 2,
      snap: { innerHTML: 1 },
      ease: "power1.out",
      scrollTrigger: {
        trigger: ".hero-stats",
        start: "top 90%",
      }
    });
  });

  // Initialize Sections
  initHero();
  initPortfolio();
  initServices();
  initProcess();
  initAbout();

  initContact();
});
