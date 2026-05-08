/* main.js - Customer-facing page logic (no server, uses localStorage) */

let allItems = [];

function loadItems() {
  allItems = getAllItems();
  renderMenus(allItems);
}

function renderMenus(items) {
  const morning = items.filter(item => item.category === 'morning');
  const evening = items.filter(item => item.category === 'evening');

  renderGrid('morning-grid', morning);
  renderGrid('evening-grid', evening);

  const noResults = document.getElementById('no-results');
  noResults.classList.toggle('hidden', items.length !== 0);

  document.getElementById('morning').style.display =
    morning.length === 0 && items.length !== allItems.length ? 'none' : '';
  document.getElementById('evening').style.display =
    evening.length === 0 && items.length !== allItems.length ? 'none' : '';
}

function renderGrid(gridId, items) {
  const grid = document.getElementById(gridId);

  if (!items.length) {
    grid.innerHTML = '<p style="color:#9A8468;grid-column:1/-1;text-align:center;padding:40px 0">No items in this section</p>';
    return;
  }

  grid.innerHTML = items.map(item => `
    <div class="menu-card ${item.available ? '' : 'unavailable'}" id="card-${item.id}">
      ${renderCardMedia(item)}
      <div class="card-body">
        <div class="card-name">${escHtml(item.name)}</div>
        <div class="card-price">&#8377;${item.price}</div>
        <span class="card-status ${item.available ? 'available' : 'unavailable'}">
          ${item.available ? 'Available' : 'Not Available'}
        </span>
      </div>
    </div>
  `).join('');
}

function renderCardMedia(item) {
  if (item.image) {
    return `
      <div class="card-media">
        <img class="card-image" src="${escAttr(item.image)}" alt="Photo of ${escAttr(item.name)}" loading="lazy" decoding="async" />
      </div>
    `;
  }

  return `
    <div class="card-media emoji-only" aria-hidden="true">
      <div class="card-emoji">${escHtml(item.emoji || FALLBACK_EMOJI)}</div>
    </div>
  `;
}

function applyFilter() {
  const query = document.getElementById('search-input').value.toLowerCase().trim();
  const activeChip = document.querySelector('.chip.active');
  const filter = activeChip ? activeChip.dataset.filter : 'all';

  let filtered = allItems;

  if (filter === 'morning') {
    filtered = filtered.filter(item => item.category === 'morning');
  }

  if (filter === 'evening') {
    filtered = filtered.filter(item => item.category === 'evening');
  }

  if (filter === 'available') {
    filtered = filtered.filter(item => item.available);
  }

  if (query) {
    filtered = filtered.filter(item => item.name.toLowerCase().includes(query));
  }

  renderMenus(filtered);
}

document.getElementById('search-input').addEventListener('input', applyFilter);

document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(otherChip => otherChip.classList.remove('active'));
    chip.classList.add('active');
    applyFilter();
  });
});

document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('main-nav').classList.toggle('open');
});

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('main-nav').classList.remove('open');
  });
});

const sections = ['morning', 'evening'];
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) {
      return;
    }

    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    const activeLink = document.getElementById(`nav-${entry.target.id}`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(sectionId => {
  const section = document.getElementById(sectionId);
  if (section) {
    observer.observe(section);
  }
});

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

loadItems();
