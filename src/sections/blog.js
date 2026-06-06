import { getStoreData } from '../utils/store.js';

export async function initBlog() {
  const data = await getStoreData();
  const posts = data.blog;

  const grid = document.getElementById('blog-grid');

  posts.forEach(p => {
    const card = document.createElement('div');
    card.className = 'blog-card';
    card.innerHTML = `
      <div class="blog-image">
        <img src="${p.img}" alt="${p.title}">
      </div>
      <div class="blog-meta">
        <span class="blog-tag">${p.tag}</span>
        <span>5 Min Read</span>
      </div>
      <h3 class="blog-title">${p.title}</h3>
      <p class="blog-excerpt">${p.excerpt}</p>
    `;
    grid.appendChild(card);
  });
}
