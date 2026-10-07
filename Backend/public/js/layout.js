import { logout, guard } from './auth.js';
import { toast } from './toast.js';
import { get } from './api.js';
import { escapeHtml } from './app.js';

async function loadSidebarCards() {
  const list = document.getElementById('sidebar-cards');
  const count = document.getElementById('sidebar-card-count');
  if (!list || !count) return;
  list.innerHTML = '<span class="sidebar-card-state">Loading cards…</span>';

  try {
    const cards = [];
    let page = 1;
    let pages = 1;
    do {
      const { data } = await get(`/cards?page=${page}&limit=100`);
      cards.push(...data.items);
      pages = data.pagination.pages;
      page += 1;
    } while (page <= pages);

    count.textContent = String(cards.length);
    if (!cards.length) {
      list.innerHTML = '<span class="sidebar-card-state">No cards yet</span>';
      return;
    }

    const selectedId = new URLSearchParams(location.search).get('id');
    list.innerHTML = cards.map(card => {
      const isActive = location.pathname.endsWith('/card-detail.html') && selectedId === card._id;
      return `<a class="sidebar-card-link${isActive ? ' active' : ''}" href="/card-detail.html?id=${encodeURIComponent(card._id)}" title="${escapeHtml(card.title)}">
        <span class="sidebar-card-title">${escapeHtml(card.title)}</span>
        <span class="sidebar-card-meta">${escapeHtml(card.category || 'General')} · ${escapeHtml(card.status)}</span>
      </a>`;
    }).join('');
  } catch (error) {
    list.innerHTML = `<span class="sidebar-card-state error">${escapeHtml(error instanceof Error ? error.message : 'Unable to load cards.')}</span>`;
  }
}

export async function initLayout(title, protectedPage = true) {
  if (protectedPage && !(await guard())) return false;
  document.body.insertAdjacentHTML('afterbegin', `<div class="shell"><aside class="sidebar" id="sidebar"><div class="brand">Motion Library<small>Private studio</small></div><nav class="nav"><a href="dashboard.html">Overview</a><a href="cards.html">Home cards</a><a href="exercises.html">Workout library</a><a href="settings.html">Settings</a></nav><section class="sidebar-card-section" aria-label="All Home cards"><div class="sidebar-card-heading"><h2>All Home cards</h2><span id="sidebar-card-count">0</span></div><div class="sidebar-card-list" id="sidebar-cards"></div></section><div class="sidebar-footer">Content control center</div></aside><main class="main"><header class="topbar"><div class="top-actions"><button class="btn icon mobile-menu" id="menu">☰</button><h1>${escapeHtml(title)}</h1></div><div class="top-actions"><button class="btn icon" id="theme" title="Toggle theme">◐</button><button class="btn secondary" id="logout">Log out</button></div></header><section class="content" id="page-content"></section></main></div><div class="modal-backdrop hidden" id="confirm-modal"><div class="modal"></div></div><div class="modal-backdrop hidden" id="preview-modal"><div class="modal"><button class="btn secondary" id="close-preview">Close</button><div id="preview-modal-content" style="margin-top:16px"></div></div></div>`);
  document.getElementById('logout').onclick = () => logout();
  document.getElementById('menu').onclick = () => document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('theme').onclick = () => {
    document.body.classList.toggle('dark');
    localStorage.theme = document.body.classList.contains('dark') ? 'dark' : 'light';
  };
  document.getElementById('close-preview').onclick = () => document.getElementById('preview-modal').classList.add('hidden');
  if (localStorage.theme === 'dark') document.body.classList.add('dark');
  const currentPage = location.pathname.split('/').pop();
  document.querySelectorAll('.nav > a').forEach(link => {
    if (link.getAttribute('href') === currentPage) link.classList.add('active');
  });
  loadSidebarCards();
  window.addEventListener('session-expired', () => {
    toast('Your session expired', 'error');
    setTimeout(() => window.location.href = '/session-expired.html', 500);
  });
  return true;
}
