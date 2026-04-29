export function initServices() {
  const services = [
    {
      title: "Residential Architecture",
      desc: "Bespoke homes tailored to individual lifestyles, emphasizing material honesty and contextual integration."
    },
    {
      title: "Commercial & Mixed-Use",
      desc: "Dynamic workspaces and public arenas designed to foster community, productivity, and wellbeing."
    },
    {
      title: "Interior Architecture",
      desc: "Holistic interior spaces where light, texture, and volume are sculpted to elevate the human experience."
    },
    {
      title: "Urban Planning",
      desc: "Large-scale masterplans that address climate resilience, mobility, and socio-economic vitality."
    },
    {
      title: "Sustainable Design",
      desc: "Passive design strategies, energy modeling, and lifecycle analysis for zero-carbon architecture."
    },
    {
      title: "3D Visualization",
      desc: "Hyper-realistic renders, VR walkthroughs, and physical model making to bridge imagination and reality."
    }
  ];

  const grid = document.getElementById('services-grid');

  services.forEach(s => {
    const card = document.createElement('div');
    card.className = 'service-card glass-card';
    card.innerHTML = `
      <div class="service-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M3 21h18"></path>
          <path d="M5 21V7l8-4v18"></path>
          <path d="M19 21V11l-6-3"></path>
          <path d="M9 9v.01"></path>
          <path d="M9 13v.01"></path>
          <path d="M9 17v.01"></path>
        </svg>
      </div>
      <h3 class="service-title">${s.title}</h3>
      <p class="service-desc">${s.desc}</p>
      <a href="#contact" class="service-link">
        Learn More
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </a>
    `;
    grid.appendChild(card);
  });
}
