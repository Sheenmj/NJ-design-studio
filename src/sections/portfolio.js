import { getStoreData } from '../utils/store.js';

export async function initPortfolio() {
  const data = await getStoreData();
  const projects = data.projects;

  const grid = document.getElementById('portfolio-grid');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalInner = document.getElementById('modal-inner');
  const modalClose = document.getElementById('modal-close');
  const filterBtns = document.querySelectorAll('.filter-btn');

  function renderGrid(filter = 'all') {
    grid.innerHTML = '';
    const filtered = filter === 'all' ? projects : projects.filter(p => p.category === filter);
    
    filtered.forEach(p => {
      const card = document.createElement('div');
      card.className = 'portfolio-card';
      card.innerHTML = `
        <img src="${p.img}" alt="${p.title}">
        <div class="portfolio-info">
          <div class="portfolio-category">${p.category}</div>
          <div class="portfolio-title">${p.title}</div>
        </div>
      `;
      card.addEventListener('click', () => openModal(p));
      grid.appendChild(card);
    });
  }

  function openModal(p) {
    modalInner.innerHTML = `
      <div class="modal-hero">
        <img src="${p.img}" alt="${p.title}">
      </div>
      <div class="modal-content">
        <div>
          <div class="portfolio-category">${p.category}</div>
          <h2 class="modal-title">${p.title}</h2>
          <p class="philosophy-body">${p.story}</p>
        </div>
        <div class="modal-meta">
          <div>
            <div class="meta-item-label">Client</div>
            <div class="meta-item-value">${p.client}</div>
          </div>
          <div>
            <div class="meta-item-label">Total Area</div>
            <div class="meta-item-value">${p.area}</div>
          </div>
          <div>
            <div class="meta-item-label">Status</div>
            <div class="meta-item-value">${p.status}</div>
          </div>
        </div>
      </div>
    `;
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  modalClose.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  });

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGrid(btn.getAttribute('data-filter'));
    });
  });

  renderGrid();
}
