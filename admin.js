/* admin.js - Admin panel logic (no server, uses localStorage via data.js) */

const CREDS = { username: 'admin', password: 'admin123' };

let allItems = [];
let currentFilter = 'all';
let searchQuery = '';

function isLoggedIn() {
  return sessionStorage.getItem('admin_auth') === '1';
}

function login() {
  sessionStorage.setItem('admin_auth', '1');
}

function logoutUser() {
  sessionStorage.removeItem('admin_auth');
}

function showLoginScreen() {
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('admin-shell').classList.add('hidden');
}

function showAdminShell() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('admin-shell').classList.remove('hidden');
  loadItems();
}

document.getElementById('login-form').addEventListener('submit', event => {
  event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorMessage = document.getElementById('login-error');

  if (username === CREDS.username && password === CREDS.password) {
    errorMessage.classList.add('hidden');
    login();
    showAdminShell();
    return;
  }

  errorMessage.classList.remove('hidden');
});

document.getElementById('eye-btn').addEventListener('click', () => {
  const input = document.getElementById('password');
  input.type = input.type === 'password' ? 'text' : 'password';
});

document.getElementById('btn-logout').addEventListener('click', () => {
  logoutUser();
  showLoginScreen();
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
});

document.querySelectorAll('.sb-link').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();

    document.querySelectorAll('.sb-link').forEach(otherLink => otherLink.classList.remove('active'));
    link.classList.add('active');

    const section = link.dataset.section;
    const addPanel = document.getElementById('add-form-panel');
    const tablePanel = document.getElementById('table-panel');
    const title = document.getElementById('topbar-title');

    if (section === 'add') {
      addPanel.classList.remove('hidden');
      tablePanel.classList.add('hidden');
      title.textContent = 'Add New Item';
    } else {
      addPanel.classList.add('hidden');
      tablePanel.classList.remove('hidden');
      currentFilter = section;
      title.textContent =
        section === 'all' ? 'All Menu Items' :
        section === 'morning' ? 'Morning Menu' :
        'Evening Menu';
      renderTable();
    }

    document.getElementById('sidebar').classList.remove('open');
  });
});

document.getElementById('sidebar-toggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

function loadItems() {
  allItems = getAllItems();
  renderTable();
  updateStats();
}

function updateStats() {
  document.querySelector('#stat-total .stat-num').textContent = allItems.length;
  document.querySelector('#stat-morning .stat-num').textContent =
    allItems.filter(item => item.category === 'morning').length;
  document.querySelector('#stat-evening .stat-num').textContent =
    allItems.filter(item => item.category === 'evening').length;
  document.querySelector('#stat-available .stat-num').textContent =
    allItems.filter(item => item.available).length;
}

function renderTable() {
  let items = allItems;

  if (currentFilter !== 'all') {
    items = items.filter(item => item.category === currentFilter);
  }

  if (searchQuery) {
    items = items.filter(item => item.name.toLowerCase().includes(searchQuery));
  }

  const tbody = document.getElementById('items-tbody');
  if (!items.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="loading-row">No items found.</td></tr>';
    return;
  }

  tbody.innerHTML = items.map(item => `
    <tr id="row-${item.id}">
      <td>${renderAdminVisual(item)}</td>
      <td style="font-weight:600">${escHtml(item.name)}</td>
      <td><span class="badge-cat ${item.category}">${item.category === 'morning' ? 'Morning' : 'Evening'}</span></td>
      <td style="font-weight:700;color:#FF6B00">&#8377;${item.price}</td>
      <td>
        <button class="badge-status ${item.available ? 'available' : 'unavailable'}"
          onclick="toggleAvailability(${item.id})"
          title="Click to toggle availability">
          ${item.available ? 'Available' : 'Not Available'}
        </button>
      </td>
      <td>
        <div class="action-btns">
          <button class="btn-edit" onclick="openEditModal(${item.id})">Edit</button>
          <button class="btn-delete" onclick="deleteItem(${item.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

document.getElementById('add-item-form').addEventListener('submit', event => {
  event.preventDefault();

  const name = document.getElementById('new-name').value.trim();
  const price = parseInt(document.getElementById('new-price').value, 10);
  const category = document.getElementById('new-category').value;
  const emoji = document.getElementById('new-emoji').value.trim() || FALLBACK_EMOJI;
  const message = document.getElementById('add-msg');

  if (!name || !price || !category) {
    showMsg(message, 'error', 'Please fill all required fields.');
    return;
  }

  addItem({ name, price, category, emoji });
  showMsg(message, 'success', `"${name}" added successfully.`);
  document.getElementById('add-item-form').reset();
  loadItems();
});

function deleteItem(id) {
  const item = allItems.find(entry => entry.id === id);
  if (!item) {
    return;
  }

  if (!confirm(`Delete "${item.name}"?`)) {
    return;
  }

  deleteItemById(id);
  showToast(`"${item.name}" deleted.`);
  loadItems();
}

function toggleAvailability(id) {
  const item = allItems.find(entry => entry.id === id);
  if (!item) {
    return;
  }

  const updated = updateItem(id, { available: !item.available });
  item.available = updated.available;
  renderTable();
  updateStats();
  showToast(`"${item.name}" marked ${updated.available ? 'available' : 'not available'}.`);
}

function openEditModal(id) {
  const item = allItems.find(entry => entry.id === id);
  if (!item) {
    return;
  }

  document.getElementById('edit-id').value = id;
  document.getElementById('edit-name').value = item.name;
  document.getElementById('edit-price').value = item.price;
  document.getElementById('edit-category').value = item.category;
  document.getElementById('edit-emoji').value = item.emoji || '';
  document.getElementById('modal-overlay').classList.remove('hidden');
}

document.getElementById('btn-modal-cancel').addEventListener('click', () => {
  document.getElementById('modal-overlay').classList.add('hidden');
});

document.getElementById('modal-overlay').addEventListener('click', event => {
  if (event.target === document.getElementById('modal-overlay')) {
    document.getElementById('modal-overlay').classList.add('hidden');
  }
});

document.getElementById('btn-modal-save').addEventListener('click', () => {
  const id = parseInt(document.getElementById('edit-id').value, 10);
  const name = document.getElementById('edit-name').value.trim();
  const price = parseInt(document.getElementById('edit-price').value, 10);
  const category = document.getElementById('edit-category').value;
  const emoji = document.getElementById('edit-emoji').value.trim();

  if (!name || !price) {
    showToast('Name and price are required.');
    return;
  }

  updateItem(id, { name, price, category, emoji });
  document.getElementById('modal-overlay').classList.add('hidden');
  showToast(`"${name}" updated successfully.`);
  loadItems();
});

document.getElementById('admin-search').addEventListener('input', event => {
  searchQuery = event.target.value.toLowerCase().trim();
  renderTable();
});

let toastTimer;
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 3000);
}

let msgTimer;
function showMsg(element, type, text) {
  element.className = `form-msg ${type}`;
  element.textContent = text;
  element.classList.remove('hidden');
  clearTimeout(msgTimer);
  msgTimer = setTimeout(() => element.classList.add('hidden'), 4000);
}

function renderAdminVisual(item) {
  if (item.image) {
    return `
      <div class="item-visual">
        <img class="item-thumb" src="${escAttr(item.image)}" alt="Photo of ${escAttr(item.name)}" loading="lazy" decoding="async" />
      </div>
    `;
  }

  return `<div class="item-visual emoji-only">${escHtml(item.emoji || FALLBACK_EMOJI)}</div>`;
}

function escHtml(str) {
  return String(str).replace(/[&<>"']/g, match => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[match]));
}

function escAttr(str) {
  return escHtml(str);
}

if (isLoggedIn()) {
  showAdminShell();
} else {
  showLoginScreen();
}
