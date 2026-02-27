/* ============================================================
   Monster Hunter World: Iceborne — Hunter's Guide
   Main Application Script
   ============================================================ */

'use strict';

// ---- State ----
let currentPage = 'home';
let selectedType = '';
let selectedHabitat = '';
let filtersOpen = false;
let musicPlaying = false;
let musicMuted = true;
let currentVolume = 0.35;

// ---- DOM refs ----
const audio = document.getElementById('bg-audio');
const musicBtn = document.getElementById('music-btn');
const musicPulse = document.getElementById('music-pulse');
const musicIconMuted = document.getElementById('music-icon-muted');
const musicIconPlaying = document.getElementById('music-icon-playing');
const musicTooltipText = document.getElementById('music-tooltip-text');
const volumePanel = document.getElementById('volume-panel');
const volumeSlider = document.getElementById('volume-slider');

// ============================================================
// NAVIGATION
// ============================================================
function navigate(page, monsterId) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // Update nav active states
  ['home', 'monsters'].forEach(id => {
    const el = document.getElementById('nav-' + id);
    const mel = document.getElementById('mobile-nav-' + id);
    if (el) el.classList.remove('active');
    if (mel) mel.classList.remove('active');
  });

  if (page === 'home') {
    document.getElementById('page-home').classList.add('active');
    document.getElementById('nav-home').classList.add('active');
    document.getElementById('mobile-nav-home').classList.add('active');
    renderFeaturedMonsters();
  } else if (page === 'monsters') {
    document.getElementById('page-monsters').classList.add('active');
    document.getElementById('nav-monsters').classList.add('active');
    document.getElementById('mobile-nav-monsters').classList.add('active');
    renderMonsterGrid();
  } else if (page === 'detail' && monsterId !== undefined) {
    document.getElementById('page-detail').classList.add('active');
    renderMonsterDetail(monsterId);
  }

  currentPage = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// MOBILE MENU
// ============================================================
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('menu-icon-open');
  const iconClose = document.getElementById('menu-icon-close');
  const isOpen = menu.classList.toggle('open');
  iconOpen.classList.toggle('hidden', isOpen);
  iconClose.classList.toggle('hidden', !isOpen);
}

function closeMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('menu-icon-open');
  const iconClose = document.getElementById('menu-icon-close');
  menu.classList.remove('open');
  iconOpen.classList.remove('hidden');
  iconClose.classList.add('hidden');
}

// ============================================================
// NAVBAR SCROLL
// ============================================================
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ============================================================
// HERO PARTICLES
// ============================================================
function createParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;
  const count = 25;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'hero-particle';
    const size = Math.random() * 3 + 1;
    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      animation-duration: ${Math.random() * 12 + 8}s;
      animation-delay: ${Math.random() * 10}s;
      opacity: ${Math.random() * 0.5 + 0.2};
    `;
    container.appendChild(p);
  }
}

// ============================================================
// ELEMENT TAG HELPER
// ============================================================
function getElementClass(element) {
  const map = {
    'Fire': 'fire',
    'Water': 'water',
    'Thunder': 'thunder',
    'Ice': 'ice',
    'Dragon': 'dragon',
    'Blast': 'blast',
  };
  return map[element] || 'default';
}

function elementTagHTML(element) {
  const cls = getElementClass(element);
  const icons = {
    fire:    '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
    water:   '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/></svg>',
    thunder: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    ice:     '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    dragon:  '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>',
    blast:   '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    default: '',
  };
  return `<span class="element-tag ${cls}">${icons[cls] || ''}${element}</span>`;
}

// ============================================================
// HOME PAGE — FEATURED MONSTERS
// ============================================================
function renderFeaturedMonsters() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  const featured = MONSTERS.filter(m => m.featured).slice(0, 3);
  grid.innerHTML = featured.map(m => `
    <div class="monster-card fade-in" onclick="navigate('detail', ${m.id})" role="button" tabindex="0">
      <div class="monster-card-img">
        ${m.imageUrl
          ? `<img src="${m.imageUrl}" alt="${m.name}" onerror="this.parentElement.innerHTML='<div class=\\'monster-card-img-placeholder\\'><svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'1\\'><path d=\\'M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z\\'/></svg></div>'" />`
          : `<div class="monster-card-img-placeholder"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/></svg></div>`
        }
        <div class="monster-card-gradient"></div>
      </div>
      <div class="monster-card-info">
        <div class="monster-card-type">${m.monsterType}</div>
        <div class="monster-card-name">${m.name}</div>
        ${m.habitat ? `<div class="monster-card-habitat">${m.habitat}</div>` : ''}
      </div>
    </div>
  `).join('');
}

// ============================================================
// MONSTERS PAGE
// ============================================================
function buildFilterTags() {
  // Type filters
  const typeContainer = document.getElementById('type-filters');
  const habitatContainer = document.getElementById('habitat-filters');

  typeContainer.innerHTML = `
    <button class="filter-tag active" data-type="" onclick="setTypeFilter('')">All</button>
    ${MONSTER_TYPES.map(t => `<button class="filter-tag" data-type="${t}" onclick="setTypeFilter('${t}')">${t}</button>`).join('')}
  `;

  habitatContainer.innerHTML = `
    <button class="filter-tag active" data-habitat="" onclick="setHabitatFilter('')">All</button>
    ${HABITATS.map(h => `<button class="filter-tag" data-habitat="${h}" onclick="setHabitatFilter('${h}')">${h}</button>`).join('')}
  `;
}

function setTypeFilter(type) {
  selectedType = type;
  // Update active state
  document.querySelectorAll('[data-type]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === type);
  });
  filterMonsters();
}

function setHabitatFilter(habitat) {
  selectedHabitat = habitat;
  document.querySelectorAll('[data-habitat]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.habitat === habitat);
  });
  filterMonsters();
}

function toggleFilters() {
  filtersOpen = !filtersOpen;
  const panel = document.getElementById('filters-panel');
  const btn = document.getElementById('filter-toggle-btn');
  panel.classList.toggle('open', filtersOpen);
  btn.classList.toggle('active', filtersOpen);
}

function clearFilters() {
  selectedType = '';
  selectedHabitat = '';
  document.getElementById('monster-search').value = '';
  document.querySelectorAll('[data-type]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === '');
  });
  document.querySelectorAll('[data-habitat]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.habitat === '');
  });
  filterMonsters();
}

function getFilteredMonsters() {
  const search = (document.getElementById('monster-search')?.value || '').toLowerCase().trim();
  return MONSTERS.filter(m => {
    const matchSearch = !search ||
      m.name.toLowerCase().includes(search) ||
      m.monsterType.toLowerCase().includes(search) ||
      (m.habitat && m.habitat.toLowerCase().includes(search));
    const matchType = !selectedType || m.monsterType === selectedType;
    const matchHabitat = !selectedHabitat || m.habitat === selectedHabitat;
    return matchSearch && matchType && matchHabitat;
  });
}

function filterMonsters() {
  const filtered = getFilteredMonsters();
  const hasFilters = selectedType || selectedHabitat || (document.getElementById('monster-search')?.value || '').trim();

  // Update clear btn
  const clearBtn = document.getElementById('clear-filters-btn');
  const emptyClearBtn = document.getElementById('empty-clear-btn');
  if (clearBtn) clearBtn.classList.toggle('hidden', !hasFilters);

  // Update count
  const countEl = document.getElementById('results-count');
  if (countEl) countEl.textContent = `${filtered.length} monster${filtered.length !== 1 ? 's' : ''}`;

  const grid = document.getElementById('monsters-grid');
  const emptyState = document.getElementById('empty-state');
  const emptyDesc = document.getElementById('empty-state-desc');

  if (filtered.length === 0) {
    grid.classList.add('hidden');
    emptyState.classList.remove('hidden');
    if (emptyClearBtn) emptyClearBtn.classList.toggle('hidden', !hasFilters);
    if (emptyDesc) {
      emptyDesc.textContent = hasFilters
        ? 'Try adjusting your search or filters'
        : 'No monsters have been added yet';
    }
  } else {
    grid.classList.remove('hidden');
    emptyState.classList.add('hidden');
    renderMonsterCards(filtered);
  }
}

function renderMonsterGrid() {
  buildFilterTags();
  filterMonsters();
}

function renderMonsterCards(monsters) {
  const grid = document.getElementById('monsters-grid');
  if (!grid) return;
  grid.innerHTML = monsters.map(m => `
    <div class="monster-card-list fade-in" onclick="navigate('detail', ${m.id})" role="button" tabindex="0">
      <div class="monster-card-img">
        ${m.imageUrl
          ? `<img src="${m.imageUrl}" alt="${m.name}" onerror="this.parentElement.innerHTML='<div class=\\'monster-card-img-placeholder\\'><svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'1\\'><path d=\\'M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z\\'/></svg></div>'" />`
          : `<div class="monster-card-img-placeholder"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/></svg></div>`
        }
        <div class="monster-card-gradient"></div>
      </div>
      <div class="monster-card-info">
        <div class="monster-card-type">${m.monsterType}</div>
        <div class="monster-card-name">${m.name}</div>
        ${m.habitat ? `<div class="monster-card-habitat">${m.habitat}</div>` : ''}
      </div>
    </div>
  `).join('');
}

// ============================================================
// MONSTER DETAIL PAGE
// ============================================================
function renderMonsterDetail(id) {
  const monster = MONSTERS.find(m => m.id === id);
  if (!monster) { navigate('monsters'); return; }

  // Hero
  const heroImg = document.getElementById('detail-hero-img');
  heroImg.src = monster.imageUrl || '';
  heroImg.alt = monster.name;
  document.getElementById('detail-type').textContent = monster.monsterType;
  document.getElementById('detail-name').textContent = monster.name;
  document.getElementById('detail-title').textContent = monster.title || '';

  // Description
  document.getElementById('detail-desc').textContent = monster.description || '';

  // Lore
  const loreWrap = document.getElementById('detail-lore-wrap');
  if (monster.lore) {
    loreWrap.classList.remove('hidden');
    document.getElementById('detail-lore').textContent = `"${monster.lore}"`;
  } else {
    loreWrap.classList.add('hidden');
  }

  // Elements
  const elementsWrap = document.getElementById('detail-elements-wrap');
  const elementsContainer = document.getElementById('detail-elements');
  if (monster.elements && monster.elements.length > 0) {
    elementsWrap.classList.remove('hidden');
    elementsContainer.innerHTML = monster.elements.map(elementTagHTML).join('');
  } else {
    elementsWrap.classList.add('hidden');
  }

  // Sidebar: habitat
  const habitatWrap = document.getElementById('detail-habitat-wrap');
  if (monster.habitat) {
    habitatWrap.classList.remove('hidden');
    document.getElementById('detail-habitat').textContent = monster.habitat;
  } else {
    habitatWrap.classList.add('hidden');
  }

  // Sidebar: size
  const sizeWrap = document.getElementById('detail-size-wrap');
  if (monster.size) {
    sizeWrap.classList.remove('hidden');
    document.getElementById('detail-size').textContent = monster.size;
  } else {
    sizeWrap.classList.add('hidden');
  }

  // Classification
  document.getElementById('detail-classification').textContent = monster.monsterType;

  // Weaknesses
  const weakCard = document.getElementById('detail-weaknesses-card');
  const weakContainer = document.getElementById('detail-weaknesses');
  if (monster.weaknesses && monster.weaknesses.length > 0) {
    weakCard.classList.remove('hidden');
    weakContainer.innerHTML = monster.weaknesses.map(elementTagHTML).join('');
  } else {
    weakCard.classList.add('hidden');
  }

  // Resistances
  const resCard = document.getElementById('detail-resistances-card');
  const resContainer = document.getElementById('detail-resistances');
  if (monster.resistances && monster.resistances.length > 0) {
    resCard.classList.remove('hidden');
    resContainer.innerHTML = monster.resistances.map(elementTagHTML).join('');
  } else {
    resCard.classList.add('hidden');
  }
}

// ============================================================
// MUSIC PLAYER
// ============================================================
function updateMusicUI() {
  const isActive = musicPlaying && !musicMuted;
  musicBtn.className = `music-btn ${isActive ? 'playing' : 'muted'}`;
  musicPulse.classList.toggle('active', isActive);
  musicIconMuted.classList.toggle('hidden', isActive);
  musicIconPlaying.classList.toggle('hidden', !isActive);
  musicTooltipText.textContent = isActive ? 'Mute Music' : 'Play Music';
}

async function toggleMusic() {
  if (!musicPlaying) {
    try {
      audio.volume = currentVolume;
      await audio.play();
      musicPlaying = true;
      musicMuted = false;
    } catch (e) {
      // Autoplay blocked
      musicMuted = !musicMuted;
    }
  } else {
    musicMuted = !musicMuted;
    audio.volume = musicMuted ? 0 : currentVolume;
  }
  updateMusicUI();
}

function setVolume(val) {
  currentVolume = parseFloat(val);
  if (!musicMuted && audio) {
    audio.volume = currentVolume;
  }
}

function showVolumePanel() {
  if (!musicMuted && musicPlaying) {
    volumePanel.classList.add('visible');
  }
}

function hideVolumePanel() {
  volumePanel.classList.remove('visible');
}

// ============================================================
// KEYBOARD NAVIGATION
// ============================================================
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeMobileMenu();
  }
});

// Allow Enter/Space on card elements
document.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.getAttribute('role') === 'button') {
    e.preventDefault();
    e.target.click();
  }
});

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  createParticles();
  renderFeaturedMonsters();
  updateMusicUI();
});
