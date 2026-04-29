import { getStoreData, saveStoreData, getUnreadCount } from './utils/store.js';

document.addEventListener('DOMContentLoaded', () => {
  // Authentication State
  const isAuthenticated = sessionStorage.getItem('nj_admin_auth') === 'true';
  const loginScreen = document.getElementById('login-screen');
  const dashboardScreen = document.getElementById('dashboard-screen');

  if (isAuthenticated) {
    showDashboard();
  } else {
    loginScreen.classList.add('active');
  }

  // Login Logic
  const loginBtn = document.getElementById('login-btn');
  const passwordInput = document.getElementById('admin-password');
  const loginError = document.getElementById('login-error');

  loginBtn.addEventListener('click', () => {
    if (passwordInput.value === 'admin123') { // Simple hardcoded password
      sessionStorage.setItem('nj_admin_auth', 'true');
      loginError.style.display = 'none';
      showDashboard();
    } else {
      loginError.textContent = 'Incorrect password.';
      loginError.style.display = 'block';
    }
  });

  passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loginBtn.click();
  });

  // Logout Logic
  document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem('nj_admin_auth');
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
  document.getElementById('clear-all-messages').addEventListener('click', () => {
    if (confirm('Clear all messages? This cannot be undone.')) {
      currentData.messages = [];
      saveStoreData(currentData);
      renderDashboard();
    }
  });

  // Render Lists
  let currentData = getStoreData();

  function renderDashboard() {
    currentData = getStoreData();
    renderPortfolioList();
    renderTeamList();
    renderMessagesList();
    updateUnreadBadge();
  }

  function renderPortfolioList() {
    const list = document.getElementById('admin-portfolio-list');
    list.innerHTML = '';
    currentData.projects.forEach((item, index) => {
      list.appendChild(createListItem(
        item.img, 
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
        item.img, 
        item.name, 
        item.role, 
        () => openModal('team', index),
        () => deleteItem('team', index)
      ));
    });
  }

  function deleteItem(type, index) {
    if (confirm(`Are you sure you want to delete this ${type} item? This cannot be undone.`)) {
      if (type === 'portfolio') {
        currentData.projects.splice(index, 1);
      } else if (type === 'team') {
        currentData.team.splice(index, 1);
      }
      saveStoreData(currentData);
      renderDashboard();
    }
  }

  function updateUnreadBadge() {
    const badge = document.getElementById('unread-badge');
    const count = getUnreadCount();
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
      card.className = `message-card ${msg.read ? '' : 'unread'}`;
      card.innerHTML = `
        <div class="message-card-header">
          <div class="message-card-name">${msg.name || 'Unknown'} ${msg.read ? '' : '<span style="font-size:0.7rem; color: var(--accent-color); font-weight:500; margin-left:6px;">● NEW</span>'}</div>
          <div class="message-card-time">${formatTime(msg.timestamp)}</div>
        </div>
        <div class="message-card-meta">
          ${msg.email ? `<span>✉ ${msg.email}</span>` : ''}
          ${msg.phone ? `<span>📞 ${msg.phone}</span>` : ''}
          ${msg.type ? `<span>🏗 ${msg.type}</span>` : ''}
          ${msg.budget ? `<span>₹ ${msg.budget}</span>` : ''}
        </div>
        <div class="message-card-preview">${msg.message || '(No message body)'}</div>
      `;
      card.addEventListener('click', () => openMessageModal(index));
      list.appendChild(card);
    });
  }

  function openMessageModal(index) {
    const msg = currentData.messages[index];
    if (!msg) return;

    // Mark as read
    if (!msg.read) {
      currentData.messages[index].read = true;
      saveStoreData(currentData);
      updateUnreadBadge();
      // Re-render cards to remove NEW badge
      renderMessagesList();
    }

    modalTitle.textContent = `Message from ${msg.name}`;
    modalForm.innerHTML = `
      <div class="message-detail">
        <div class="message-detail-row"><span class="message-detail-label">Name</span><span class="message-detail-value">${msg.name || '—'}</span></div>
        <div class="message-detail-row"><span class="message-detail-label">Email</span><span class="message-detail-value">${msg.email || '—'}</span></div>
        <div class="message-detail-row"><span class="message-detail-label">Phone</span><span class="message-detail-value">${msg.phone || '—'}</span></div>
        <div class="message-detail-row"><span class="message-detail-label">Project</span><span class="message-detail-value">${msg.type || '—'}</span></div>
        <div class="message-detail-row"><span class="message-detail-label">Budget</span><span class="message-detail-value">${msg.budget || '—'}</span></div>
        <div class="message-detail-row"><span class="message-detail-label">Received</span><span class="message-detail-value">${formatTime(msg.timestamp)}</span></div>
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

  function openModal(type, index) {
    currentEditingType = type;
    currentEditingIndex = index;
    
    let item;
    if (index === null) {
      // Create empty template
      if (type === 'portfolio') {
        item = { id: 'p_' + Date.now(), img: '', title: '', category: 'residential', client: '', area: '', status: '', story: '' };
      } else if (type === 'team') {
        item = { id: 't_' + Date.now(), img: '', name: '', role: '', bio: '' };
      }
      modalTitle.textContent = `Add New ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    } else {
      if (type === 'portfolio') item = currentData.projects[index];
      else if (type === 'team') item = currentData.team[index];
      modalTitle.textContent = `Edit ${type.charAt(0).toUpperCase() + type.slice(1)} Item`;
    }

    modalForm.innerHTML = '';

    // Generate form fields dynamically based on object keys
    Object.keys(item).forEach(key => {
      if (key === 'id') return; // Don't edit IDs
      
      const formGroup = document.createElement('div');
      formGroup.className = 'form-group';
      
      const label = document.createElement('label');
      label.textContent = key.charAt(0).toUpperCase() + key.slice(1);
      
      let input;
      if (key === 'story' || key === 'excerpt') {
        input = document.createElement('textarea');
        input.rows = 4;
        input.id = `edit-${key}`;
        input.value = item[key];
        formGroup.appendChild(label);
        formGroup.appendChild(input);
      } else if (key === 'img') {
        input = document.createElement('input');
        input.id = `edit-${key}`;
        input.value = item[key];
        
        if (currentEditingIndex === null) {
          input.type = 'hidden';
          // Do not append label
        } else {
          input.type = 'text';
          formGroup.appendChild(label);
        }
        
        formGroup.appendChild(input);

        // Add upload widget
        const uploadWidget = document.createElement('div');
        uploadWidget.className = 'upload-widget';
        uploadWidget.innerHTML = `
          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 5px;">${currentEditingIndex === null ? 'Upload an image:' : 'Or upload a new image:'}</div>
          <div class="upload-widget-actions">
            <input type="file" id="upload-file" accept="image/*">
            <button id="upload-btn" class="btn btn-primary btn-sm">Upload</button>
          </div>
          <div id="upload-status" class="upload-status"></div>
          <div style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 5px;">
            Images are saved locally to your browser.
          </div>
        `;
        formGroup.appendChild(uploadWidget);

      } else {
        input = document.createElement('input');
        input.type = 'text';
        input.id = `edit-${key}`;
        input.value = item[key];
        formGroup.appendChild(label);
        formGroup.appendChild(input);
      }
      
      modalForm.appendChild(formGroup);
    });

    // Attach upload listener if img field exists
    const uploadBtn = document.getElementById('upload-btn');
    if (uploadBtn) {
      uploadBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('upload-file');
        const statusDiv = document.getElementById('upload-status');
        const imgInput = document.getElementById('edit-img');
        
        if (!fileInput.files || fileInput.files.length === 0) {
          statusDiv.textContent = 'Please select a file first.';
          return;
        }

        const file = fileInput.files[0];
        
        statusDiv.textContent = 'Processing image...';
        statusDiv.style.color = 'var(--accent-color)';
        uploadBtn.disabled = true;

        const reader = new FileReader();
        reader.onload = function(event) {
          const img = new Image();
          img.onload = function() {
            // Create canvas to resize image
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800; // Resize to max 800px width to save localStorage space
            let width = img.width;
            let height = img.height;

            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Compress to JPEG and convert to base64
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            
            imgInput.value = dataUrl;
            statusDiv.textContent = 'Image processed and ready to save!';
            uploadBtn.disabled = false;
          };
          img.src = event.target.result;
        };
        
        reader.onerror = function() {
          statusDiv.textContent = 'Error reading file.';
          statusDiv.style.color = '#ff4a4a';
          uploadBtn.disabled = false;
        };

        reader.readAsDataURL(file);
      });
    }

    modalOverlay.classList.add('active');
  }

  modalClose.addEventListener('click', () => {
    // Reset save button if it was overridden for message delete
    modalSave.textContent = 'Save Changes';
    modalSave.className = 'btn btn-primary';
    delete modalSave._messageDeleteIndex;
    modalOverlay.classList.remove('active');
  });

  modalSave.addEventListener('click', () => {
    // Handle message delete mode
    if (modalSave._messageDeleteIndex !== undefined) {
      if (confirm('Delete this message?')) {
        currentData.messages.splice(modalSave._messageDeleteIndex, 1);
        saveStoreData(currentData);
        renderDashboard();
        modalSave.textContent = 'Save Changes';
        modalSave.className = 'btn btn-primary';
        delete modalSave._messageDeleteIndex;
        modalOverlay.classList.remove('active');
      }
      return;
    }

    let item;
    
    if (currentEditingIndex === null) {
      // We are creating a new item
      if (currentEditingType === 'portfolio') {
        item = { id: 'p_' + Date.now(), img: '', title: '', category: 'residential', client: '', area: '', status: '', story: '' };
      } else if (currentEditingType === 'team') {
        item = { id: 't_' + Date.now(), img: '', name: '', role: '', bio: '' };
      }
    } else {
      // We are editing an existing item
      if (currentEditingType === 'portfolio') item = currentData.projects[currentEditingIndex];
      else if (currentEditingType === 'team') item = currentData.team[currentEditingIndex];
    }

    Object.keys(item).forEach(key => {
      if (key === 'id') return;
      const input = document.getElementById(`edit-${key}`);
      if (input) {
        item[key] = input.value;
      }
    });

    if (currentEditingIndex === null) {
      // Push new item to the data array
      if (currentEditingType === 'portfolio') currentData.projects.push(item);
      else if (currentEditingType === 'team') currentData.team.push(item);
    }

    // Save and re-render
    saveStoreData(currentData);
    renderDashboard();
    modalOverlay.classList.remove('active');
  });
});
