const API_BASE = 'http://localhost:5000/api';

// Keep fallback static data for sections that aren't backend-driven yet (like services, awards, blog)
const defaultData = {
  awards: [
    { id: 1, year: "2023", title: "AIA National Architecture Award" },
    { id: 2, year: "2022", title: "Global Sustainability Prize" },
    { id: 3, year: "2020", title: "Urban Design Excellence" },
    { id: 4, year: "2018", title: "Emerging Practice of the Year" }
  ],
  blog: [
    {
      id: 1,
      title: "The Future of Wood in High-Rise Architecture",
      tag: "Materials",
      excerpt: "Exploring the structural and aesthetic possibilities of mass timber in urban environments.",
      img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: 2,
      title: "Designing for Neurodiversity",
      tag: "Theory",
      excerpt: "How spatial organization, lighting, and acoustics can create more inclusive environments.",
      img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: 3,
      title: "Parametric Urbanism",
      tag: "Technology",
      excerpt: "Using generative algorithms to optimize city layouts for walkability and microclimates.",
      img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600"
    }
  ]
};

export async function getStoreData() {
  try {
    const [projectsRes, teamRes] = await Promise.all([
      fetch(`${API_BASE}/projects`),
      fetch(`${API_BASE}/team`)
    ]);

    const projectsData = await projectsRes.json();
    const teamData = await teamRes.json();

    return {
      ...defaultData,
      projects: projectsData.success ? projectsData.data.map(p => ({
        id: p._id,
        title: p.title,
        category: p.category.toLowerCase(),
        img: p.imageUrl,
        story: p.description,
        client: 'Private Client', // Fallback, since model doesn't have it
        area: 'Jabalpur', // Fallback
        status: p.featured ? 'Featured' : 'Completed' // Fallback
      })) : [],
      team: teamData.success ? teamData.data.map(t => ({
        id: t._id,
        name: t.name,
        role: t.role,
        img: t.imageUrl
      })) : []
    };
  } catch (error) {
    console.error('Failed to fetch data from backend:', error);
    // Return empty arrays on failure so the UI doesn't crash
    return { ...defaultData, projects: [], team: [] };
  }
}

export async function addMessageToStore(messageData) {
  try {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fullName: messageData.name,
        email: messageData.email,
        phone: messageData.phone,
        projectType: messageData.type,
        estimatedBudget: messageData.budget,
        message: messageData.message
      })
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to send message:', error);
    return { success: false, error: 'Network error' };
  }
}

// These are for the old localstorage admin.
// They will be removed/ignored as we update admin.js to call the API directly.
export function saveStoreData(newData) {}
export function getUnreadCount() { return 0; }
