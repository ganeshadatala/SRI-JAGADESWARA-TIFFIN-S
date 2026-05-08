/* ====================================
   data.js - Seed data and localStorage helpers
   No server, no JSON files - all data lives here
===================================== */

const STORAGE_KEY = 'sj_menu_items';
const FALLBACK_EMOJI = '\u{1F374}';

const ITEM_IMAGE_MAP = Object.freeze({
  1: 'images/idly-sambar.png',
  2: 'images/idly.jpg',
  3: 'images/plain-dosa.png',
  4: 'images/masala-dosa.png',
  5: 'images/onion-dosa.jpg',
  6: 'images/egg-dosa.png',
  7: 'images/double-egg-dosa.jpg',
  8: 'images/vada.png',
  9: 'images/mysore-bonda.png',
  10: 'images/puri.jpg',
  11: 'images/biryani.jpg',
  12: 'images/meals.jpg',
  13: 'images/egg-curry.jpg',
  14: 'images/chicken-curry.jpg'
});

const DEFAULT_ITEMS = [
  { id: 1,  name: 'Idly Sambar',     category: 'morning', price: 30,  available: true, emoji: '\u{1F35A}' },
  { id: 2,  name: 'Idly',            category: 'morning', price: 20,  available: true, emoji: '\u{1F35A}' },
  { id: 3,  name: 'Plain Dosa',      category: 'morning', price: 30,  available: true, emoji: '\u{1FAD3}' },
  { id: 4,  name: 'Masala Dosa',     category: 'morning', price: 40,  available: true, emoji: '\u{1FAD3}' },
  { id: 5,  name: 'Onion Dosa',      category: 'morning', price: 35,  available: true, emoji: '\u{1FAD3}' },
  { id: 6,  name: 'Single Egg Dosa', category: 'morning', price: 45,  available: true, emoji: '\u{1F373}' },
  { id: 7,  name: 'Double Egg Dosa', category: 'morning', price: 55,  available: true, emoji: '\u{1F373}' },
  { id: 8,  name: 'Vada',            category: 'morning', price: 15,  available: true, emoji: '\u{1F369}' },
  { id: 9,  name: 'Mysore Bonda',    category: 'morning', price: 20,  available: true, emoji: '\u{1F7E4}' },
  { id: 10, name: 'Puri',            category: 'morning', price: 25,  available: true, emoji: '\u{1FAD4}' },
  { id: 11, name: 'Dum Biryani',     category: 'evening', price: 120, available: true, emoji: '\u{1F35B}' },
  { id: 12, name: 'Meals',           category: 'evening', price: 80,  available: true, emoji: '\u{1F37D}' },
  { id: 13, name: 'Egg Curry',       category: 'evening', price: 60,  available: true, emoji: '\u{1F95A}' },
  { id: 14, name: 'Chicken Curry',   category: 'evening', price: 150, available: true, emoji: '\u{1F357}' }
];

/* ---------- Storage helpers ---------- */

function getAllItems() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seededItems = DEFAULT_ITEMS.map(hydrateItem);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seededItems));
    return seededItems;
  }

  return JSON.parse(raw).map(hydrateItem);
}

function saveAllItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function getNextId(items) {
  return items.length ? Math.max(...items.map(item => item.id)) + 1 : 1;
}

function addItem(item) {
  const items = getAllItems();
  const newItem = hydrateItem({ ...item, id: getNextId(items), available: true });
  items.push(newItem);
  saveAllItems(items);
  return newItem;
}

function updateItem(id, changes) {
  const items = getAllItems();
  const index = items.findIndex(item => item.id === id);

  if (index === -1) {
    return null;
  }

  items[index] = hydrateItem({ ...items[index], ...changes });
  saveAllItems(items);
  return items[index];
}

function deleteItemById(id) {
  const items = getAllItems();
  const filtered = items.filter(item => item.id !== id);
  saveAllItems(filtered);
}

function hydrateItem(item) {
  return {
    ...item,
    emoji: item.emoji || FALLBACK_EMOJI,
    image: item.image || ITEM_IMAGE_MAP[item.id] || ''
  };
}
