// Prototype harness wiring (emil-prototype PICKER.md contract). Throwaway.
const variants = ['v-fan', 'v-spread', 'v-ledger', 'v-lift'];
const stage = document.getElementById('stage');
const picker = document.querySelector('.proto-picker');
const highlight = picker.querySelector('.proto-picker-highlight');
const items = [...picker.querySelectorAll('.proto-picker-item:not(.proto-picker-replay)')];
const replay = picker.querySelector('.proto-picker-replay');
let current = 0;

function moveHighlight() {
  const el = items[current];
  highlight.style.width = el.offsetWidth + 'px';
  highlight.style.transform = `translateX(${el.offsetLeft}px)`;
}

function wireLedger(root) {
  const rows = [...root.querySelectorAll('.ledger-row')];
  const covers = [...root.querySelectorAll('.ledger-cover')];
  const activate = (idx) => {
    rows.forEach((r) => r.toggleAttribute('data-active', r.dataset.idx === idx));
    covers.forEach((c) => c.toggleAttribute('data-active', c.dataset.idx === idx));
  };
  rows.forEach((r) => {
    r.addEventListener('pointerenter', () => activate(r.dataset.idx));
    r.addEventListener('focus', () => activate(r.dataset.idx));
  });
}

function wireLift(root) {
  const target = root.querySelector('.lift-target');
  const items = [...root.querySelectorAll('.deck-lift .deck-item')];
  const SCALE = 1.5;
  const close = () => {
    items.forEach((li) => {
      li.removeAttribute('data-open');
      li.querySelector('.card').setAttribute('aria-expanded', 'false');
    });
  };
  const open = (li) => {
    close();
    const card = li.querySelector('.card');
    // FLIP: measure the card's untransformed slot, aim its top-left at the target box.
    const prev = card.style.transform;
    card.style.transform = 'none';
    const from = card.getBoundingClientRect();
    card.style.transform = prev;
    const to = target.getBoundingClientRect();
    const dx = to.left + (to.width - from.width * SCALE) / 2 - from.left;
    const dy = to.top - from.top;
    card.style.setProperty('--lx', dx + 'px');
    card.style.setProperty('--ly', dy + 'px');
    li.setAttribute('data-open', '');
    card.setAttribute('aria-expanded', 'true');
  };
  items.forEach((li) => {
    const card = li.querySelector('.card');
    card.addEventListener('click', () => {
      if (window.matchMedia('(max-width: 720px)').matches || li.hasAttribute('data-open')) {
        location.href = card.dataset.href;
        return;
      }
      open(li);
    });
  });
  root.addEventListener('click', (e) => {
    if (!e.target.closest('.card')) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}

function mount(i) {
  stage.innerHTML = '';
  requestAnimationFrame(() => {
    const tpl = document.getElementById(variants[i]);
    stage.appendChild(tpl.content.cloneNode(true));
    if (variants[i] === 'v-ledger') wireLedger(stage);
    if (variants[i] === 'v-lift') wireLift(stage);
  });
}

function setActive(i) {
  if (i < 0 || i >= variants.length) return;
  current = i;
  items.forEach((el, j) => {
    el.toggleAttribute('data-active', j === i);
    if (j === i) el.setAttribute('aria-current', 'true');
    else el.removeAttribute('aria-current');
  });
  moveHighlight();
  const url = new URL(location);
  url.searchParams.set('v', i + 1);
  history.replaceState(null, '', url);
  mount(i);
}

items.forEach((el, i) => el.addEventListener('click', () => setActive(i)));
replay?.addEventListener('click', () => mount(current));
window.addEventListener('resize', moveHighlight);
document.addEventListener('keydown', (e) => {
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const num = parseInt(e.key, 10);
  if (num >= 1 && num <= variants.length) setActive(num - 1);
  else if (e.key === 'ArrowRight') setActive((current + 1) % variants.length);
  else if (e.key === 'ArrowLeft') setActive((current - 1 + variants.length) % variants.length);
  else if (e.key === 'r' || e.key === 'R') mount(current);
});
setActive((parseInt(new URLSearchParams(location.search).get('v'), 10) || 1) - 1);
requestAnimationFrame(() => requestAnimationFrame(() => picker.setAttribute('data-ready', '')));
