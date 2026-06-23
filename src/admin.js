const API_BASE = '/api';

document.addEventListener('DOMContentLoaded', () => {
  // Authentication State
  const token = sessionStorage.getItem('nj_admin_token');
  const isAuthenticated = !!token;
  const loginScreen = document.getElementById('login-screen');
  const dashboardScreen = document.getElementById('dashboard-screen');

  if (isAuthenticated) {
    showDashboard();
  } else {
    loginScreen.classList.add('active');
  }

  // Helper for API calls
  async function apiCall(endpoint, method = 'GET', body = null, isFormData = false) {
    const headers = {
      'Authorization': `Bearer ${sessionStorage.getItem('nj_admin_token')}`
    };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const options = { method, headers };
    if (body) {
      options.body = isFormData ? body : JSON.stringify(body);
    }

    const res = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await res.json();
    if (!res.ok || !data.success) {
      if (res.status === 401) {
        // Token expired or invalid
        sessionStorage.removeItem('nj_admin_token');
        location.reload();
      }
      throw new Error(data.error || 'API Error');
    }
    return data.data;
  }

  // Login Logic
  const loginBtn = document.getElementById('login-btn');
  const passwordInput = document.getElementById('admin-password');
  // We need an email input, but the UI might only have password right now.
  // We will assume email is "admin@njdesignstudio.com" since the UI only asked for a password originally.
  const loginError = document.getElementById('login-error');

  loginBtn.addEventListener('click', async () => {
    loginError.style.display = 'none';
    loginBtn.textContent = 'Logging in...';
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@njdesignstudio.com', password: passwordInput.value })
      });
      const data = await res.json();
      
      if (data.success) {
        sessionStorage.setItem('nj_admin_token', data.data.token);
        showDashboard();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      loginError.textContent = err.message || 'Login failed.';
      loginError.style.display = 'block';
    } finally {
      loginBtn.textContent = 'Login';
    }
  });

  passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loginBtn.click();
  });

  // Logout Logic
  document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem('nj_admin_token');
    dashboardScreen.classList.remove('active');
    loginScreen.classList.add('active');
    passwordInput.value = '';
  });

  // Dashboard Logic
  function showDashboard() {
    loginScreen.classList.remove('active');
    dashboardScreen.classList.add('active');
    renderDashboard();
  }

  // Tab switching
  const tabs = document.querySelectorAll('.admin-tab');
  const panels = document.querySelectorAll('.admin-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      
      tab.classList.add('active');
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
    });
  });

  // Add New Button Listeners
  document.getElementById('add-portfolio-btn').addEventListener('click', () => openModal('portfolio', null));
  document.getElementById('add-team-btn').addEventListener('click', () => openModal('team', null));
  document.getElementById('clear-all-messages').addEventListener('click', async () => {
    if (confirm('Clear all messages? This cannot be undone.')) {
      for (const m of currentData.messages) {
        await apiCall(`/messages/${m._id}`, 'DELETE');
      }
      renderDashboard();
    }
  });

  // Render Lists
  let currentData = { projects: [], team: [], messages: [] };

  async function renderDashboard() {
    try {
      const [projects, team, messages] = await Promise.all([
        apiCall('/projects'),
        apiCall('/team'),
        apiCall('/messages')
      ]);
      currentData = { projects, team, messages };
      renderPortfolioList();
      renderTeamList();
      renderMessagesList();
      updateUnreadBadge();
    } catch (err) {
      console.error('Dashboard load error:', err);
    }
  }

  function renderPortfolioList() {
    const list = document.getElementById('admin-portfolio-list');
    list.innerHTML = '';
    currentData.projects.forEach((item, index) => {
      list.appendChild(createListItem(
        item.imageUrl, 
        item.title, 
        item.category, 
        () => openModal('portfolio', index),
        () => deleteItem('portfolio', index)
      ));
    });
  }

  function renderTeamList() {
    const list = document.getElementById('admin-team-list');
    list.innerHTML = '';
    currentData.team.forEach((item, index) => {
      list.appendChild(createListItem(
        item.imageUrl, 
        item.name, 
        item.role, 
        () => openModal('team', index),
        () => deleteItem('team', index)
      ));
    });
  }

  async function deleteItem(type, index) {
    if (confirm(`Are you sure you want to delete this ${type} item? This cannot be undone.`)) {
      try {
        if (type === 'portfolio') {
          await apiCall(`/projects/${currentData.projects[index]._id}`, 'DELETE');
        } else if (type === 'team') {
          await apiCall(`/team/${currentData.team[index]._id}`, 'DELETE');
        }
        renderDashboard();
      } catch(e) { alert('Delete failed: ' + e.message); }
    }
  }

  function updateUnreadBadge() {
    const badge = document.getElementById('unread-badge');
    const count = currentData.messages.filter(m => !m.isRead).length;
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  }

  function formatTime(isoString) {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + 
           ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  function renderMessagesList() {
    const list = document.getElementById('admin-messages-list');
    list.innerHTML = '';
    const messages = currentData.messages || [];

    if (messages.length === 0) {
      list.innerHTML = '<div class="messages-empty">📭 No messages yet. Inquiries submitted through your Contact Form will appear here.</div>';
      return;
    }

    messages.forEach((msg, index) => {
      const card = document.createElement('div');
      card.className = `message-card ${msg.isRead ? '' : 'unread'}`;
      card.innerHTML = `
        <div class="message-card-header">
          <div class="message-card-name">${msg.fullName || 'Unknown'} ${msg.isRead ? '' : '<span style="font-size:0.7rem; color: var(--accent-color); font-weight:500; margin-left:6px;">● NEW</span>'}</div>
          <div class="message-card-time">${formatTime(msg.createdAt)}</div>
        </div>
        <div class="message-card-meta">
          ${msg.email ? `<span>✉ ${msg.email}</span>` : ''}
          ${msg.phone ? `<span>📞 ${msg.phone}</span>` : ''}
          ${msg.projectType ? `<span>🏗 ${msg.projectType}</span>` : ''}
          ${msg.estimatedBudget ? `<span>₹ ${msg.estimatedBudget}</span>` : ''}
        </div>
        <div class="message-card-preview">${msg.message || '(No message body)'}</div>
      `;
      card.addEventListener('click', () => openMessageModal(index));
      list.appendChild(card);
    });
  }

  async function openMessageModal(index) {
    const msg = currentData.messages[index];
    if (!msg) return;

    // Mark as read
    if (!msg.isRead) {
      try {
        await apiCall(`/messages/${msg._id}/read`, 'PATCH');
        msg.isRead = true;
        updateUnreadBadge();
        renderMessagesList();
      } catch(e) {}
    }

    modalTitle.textContent = `Message from ${msg.fullName}`;
    modalForm.innerHTML = `
      <div class="message-detail">
        <div class="message-detail-row"><span class="message-detail-label">Name</span><span class="message-detail-value">${msg.fullName || '—'}</span></div>
        <div class="message-detail-row"><span class="message-detail-label">Email</span><span class="message-detail-value">${msg.email || '—'}</span></div>
        <div class="message-detail-row"><span class="message-detail-label">Phone</span><span class="message-detail-value">${msg.phone || '—'}</span></div>
        <div class="message-detail-row"><span class="message-detail-label">Project</span><span class="message-detail-value">${msg.projectType || '—'}</span></div>
        <div class="message-detail-row"><span class="message-detail-label">Budget</span><span class="message-detail-value">${msg.estimatedBudget || '—'}</span></div>
        <div class="message-detail-row"><span class="message-detail-label">Received</span><span class="message-detail-value">${formatTime(msg.createdAt)}</span></div>
        <div class="message-body">${msg.message || '(No message body)'}</div>
      </div>
    `;

    // Override save button to delete this message
    modalSave.textContent = 'Delete Message';
    modalSave.className = 'btn btn-danger';
    modalSave._messageDeleteIndex = index;

    modalOverlay.classList.add('active');
  }


  function createListItem(imgSrc, title, subtitle, onEdit, onDelete) {
    const div = document.createElement('div');
    div.className = 'admin-item';
    div.innerHTML = `
      <img src="${imgSrc || '/src/assets/hero.png'}" class="admin-item-img" alt="Thumbnail">
      <div class="admin-item-info">
        <div class="admin-item-title">${title || 'New Item'}</div>
        <div class="admin-item-subtitle">${subtitle || ''}</div>
      </div>
      <div class="admin-item-actions">
        <button class="btn btn-ghost btn-sm edit-btn">Edit</button>
        <button class="btn btn-danger btn-sm delete-btn">Delete</button>
      </div>
    `;
    div.querySelector('.edit-btn').addEventListener('click', onEdit);
    div.querySelector('.delete-btn').addEventListener('click', onDelete);
    return div;
  }

  // Modal Logic
  const modalOverlay = document.getElementById('admin-modal-overlay');
  const modalClose = document.getElementById('admin-modal-close');
  const modalForm = document.getElementById('admin-modal-form');
  const modalSave = document.getElementById('admin-modal-save');
  const modalTitle = document.getElementById('admin-modal-title');
  
  let currentEditingType = null;
  let currentEditingIndex = null;
  let currentFile = null;

  function openModal(type, index) {
    currentEditingType = type;
    currentEditingIndex = index;
    currentFile = null;
    
    let item;
    if (index === null) {
      if (type === 'portfolio') {
        item = { title: '', category: 'Residential', description: '', featured: false };
      } else if (type === 'team') {
        item = { name: '', role: '', bio: '', order: 0 };
      }
      modalTitle.textContent = `Add New ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    } else {
      if (type === 'portfolio') item = currentData.projects[index];
      else if (type === 'team') item = currentData.team[index];
      modalTitle.textContent = `Edit ${type.charAt(0).toUpperCase() + type.slice(1)} Item`;
    }

    modalForm.innerHTML = '';

    // Generate form fields manually to match DB schema
    const fields = type === 'portfolio' ? 
      ['title', 'category', 'description', 'featured'] : 
      ['name', 'role', 'bio', 'order'];

    fields.forEach(key => {
      const formGroup = document.createElement('div');
      formGroup.className = 'form-group';
      
      const label = document.createElement('label');
      label.textContent = key.charAt(0).toUpperCase() + key.slice(1);
      formGroup.appendChild(label);
      
      let input;
      if (key === 'description' || key === 'bio') {
        input = document.createElement('textarea');
        input.rows = 4;
      } else if (key === 'featured') {
        input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = !!item[key];
      } else if (key === 'category') {
        input = document.createElement('select');
        ['Residential', 'Commercial', 'Cultural', 'Urban'].forEach(opt => {
          const option = document.createElement('option');
          option.value = opt;
          option.textContent = opt;
          if (opt === item[key]) option.selected = true;
          input.appendChild(option);
        });
      } else {
        input = document.createElement('input');
        input.type = 'text';
      }
      
      if (key !== 'category' && key !== 'featured') {
        input.value = item[key] || '';
      }
      input.id = `edit-${key}`;
      formGroup.appendChild(input);
      modalForm.appendChild(formGroup);
    });

    // Add image upload widget
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';
    formGroup.innerHTML = `
      <label>Image</label>
      <div class="upload-widget">
        <input type="file" id="upload-file" accept="image/*">
        ${item.imageUrl ? `<div style="margin-top:5px; font-size:0.8rem">Current: <a href="${item.imageUrl}" target="_blank">View Image</a></div>` : ''}
      </div>
    `;
    modalForm.appendChild(formGroup);

    modalOverlay.classList.add('active');
  }

  modalClose.addEventListener('click', () => {
    modalSave.textContent = 'Save Changes';
    modalSave.className = 'btn btn-primary';
    delete modalSave._messageDeleteIndex;
    modalOverlay.classList.remove('active');
  });

  modalSave.addEventListener('click', async () => {
    // Handle message delete mode
    if (modalSave._messageDeleteIndex !== undefined) {
      if (confirm('Delete this message?')) {
        const msgId = currentData.messages[modalSave._messageDeleteIndex]._id;
        try {
          await apiCall(`/messages/${msgId}`, 'DELETE');
          renderDashboard();
        } catch(e) { alert(e.message); }
        modalSave.textContent = 'Save Changes';
        modalSave.className = 'btn btn-primary';
        delete modalSave._messageDeleteIndex;
        modalOverlay.classList.remove('active');
      }
      return;
    }

    const formData = new FormData();
    const fields = currentEditingType === 'portfolio' ? 
      ['title', 'category', 'description', 'featured'] : 
      ['name', 'role', 'bio', 'order'];

    fields.forEach(key => {
      const input = document.getElementById(`edit-${key}`);
      if (input) {
        if (input.type === 'checkbox') formData.append(key, input.checked);
        else formData.append(key, input.value);
      }
    });

    const fileInput = document.getElementById('upload-file');
    if (fileInput.files.length > 0) {
      formData.append('image', fileInput.files[0]);
    }

    modalSave.textContent = 'Saving...';
    modalSave.disabled = true;

    try {
      if (currentEditingIndex === null) {
        // Create
        await apiCall(currentEditingType === 'portfolio' ? '/projects' : '/team', 'POST', formData, true);
      } else {
        // Update
        const id = currentEditingType === 'portfolio' ? 
          currentData.projects[currentEditingIndex]._id : 
          currentData.team[currentEditingIndex]._id;
        await apiCall(currentEditingType === 'portfolio' ? `/projects/${id}` : `/team/${id}`, 'PUT', formData, true);
      }
      renderDashboard();
      modalOverlay.classList.remove('active');
    } catch (e) {
      alert('Save failed: ' + e.message);
    } finally {
      modalSave.textContent = 'Save Changes';
      modalSave.disabled = false;
    }
  });
});
