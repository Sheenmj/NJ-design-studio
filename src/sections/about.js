import { getStoreData } from '../utils/store.js';

export async function initAbout() {
  const data = await getStoreData();
  const team = data.team;
  const awards = data.awards;

  const teamGrid = document.getElementById('team-grid');
  team.forEach(t => {
    const member = document.createElement('div');
    member.className = 'team-member';
    member.innerHTML = `
      <div class="team-avatar">
        <img src="${t.img}" alt="${t.name}">
      </div>
      <h4 class="team-name">${t.name}</h4>
      <div class="team-role">${t.role}</div>
    `;
    teamGrid.appendChild(member);
  });

  const awardsStrip = document.getElementById('awards-strip');
  awards.forEach(a => {
    const award = document.createElement('div');
    award.className = 'award-item';
    award.innerHTML = `
      <div class="award-year">${a.year}</div>
      <div class="award-title">${a.title}</div>
    `;
    awardsStrip.appendChild(award);
  });
}
