const defaultData = {
  projects: [
    {
      id: 1,
      title: "Ground Floor Hall",
      category: "residential",
      img: "/src/assets/portfolio/GF4.jpg",
      client: "Mr. J.S Sahu Ji",
      area: "Jabalpur",
      status: "Proposed",
      story: "A modern open-concept ground floor hall featuring a sleek dark kitchen island, contrasting with warm yellow walls and integrated cove lighting."
    },
    {
      id: 2,
      title: "Modern TV Unit",
      category: "residential",
      img: "/src/assets/portfolio/T8.jpg",
      client: "Mr. & Mrs. Singh",
      area: "Kachnar City, Jabalpur",
      status: "Proposed",
      story: "A minimalist TV unit design blending warm wood slatted panels with floating white shelves and subtle backlighting."
    },
    {
      id: 3,
      title: "Double-Height Atrium",
      category: "residential",
      img: "/src/assets/portfolio/ha2.jpg",
      client: "Private Client",
      area: "Jabalpur",
      status: "Proposed",
      story: "A dramatic double-height living area viewed from a glass-railed mezzanine, featuring intricate ceiling lighting and a central pooja space."
    },
    {
      id: 4,
      title: "Dining & Island Kitchen",
      category: "residential",
      img: "/src/assets/portfolio/FC1.jpg",
      client: "Private Client",
      area: "Jabalpur",
      status: "Proposed",
      story: "An integrated kitchen and dining space with a white marble island, dark wood cabinetry, and a striking teal ceiling accent."
    },
    {
      id: 5,
      title: "Master Bedroom Retreat",
      category: "residential",
      img: "/src/assets/portfolio/BEDROOM1.jpg",
      client: "Private Client",
      area: "Jabalpur",
      status: "Proposed",
      story: "A serene master bedroom design balancing modern aesthetics with comfort and warmth."
    },
    {
      id: 6,
      title: "Villa Exterior",
      category: "residential",
      img: "/src/assets/portfolio/V3.jpg",
      client: "Private Client",
      area: "Jabalpur",
      status: "Proposed",
      story: "A striking exterior facade combining contemporary geometric volumes with natural material finishes."
    }
  ],
  team: [
    {
      id: 1,
      name: "Nishant Joesph",
      role: "Principal Architect",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"
    }
  ],
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
  ],
  messages: []
};

export function getStoreData() {
  const data = localStorage.getItem('nj_store');
  if (data) {
    return JSON.parse(data);
  }
  
  // Initialize if empty
  localStorage.setItem('nj_store', JSON.stringify(defaultData));
  return defaultData;
}

export function saveStoreData(newData) {
  localStorage.setItem('nj_store', JSON.stringify(newData));
}

export function addMessageToStore(message) {
  const data = getStoreData();
  if (!data.messages) data.messages = [];
  data.messages.unshift({
    id: 'm_' + Date.now(),
    ...message,
    timestamp: new Date().toISOString(),
    read: false
  });
  saveStoreData(data);
}

export function getUnreadCount() {
  const data = getStoreData();
  if (!data.messages) return 0;
  return data.messages.filter(m => !m.read).length;
}
