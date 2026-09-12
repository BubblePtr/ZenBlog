// Prototype harness wiring (emil-prototype PICKER.md contract). Throwaway.
const variants = ['margin', 'float', 'inline'];
const picker = document.querySelector('.proto-picker');
const highlight = picker.querySelector('.proto-picker-highlight');
const items = [...picker.querySelectorAll('.proto-picker-item')];
let current = 0;

const rel = (root, r) => {
  const b = root.getBoundingClientRect();
  return {
    left: r.left - b.left,
    top: r.top - b.top,
    right: r.right - b.left,
    bottom: r.bottom - b.top,
    width: r.width,
    height: r.height,
  };
};

// Hand-drawn arrow: one bezier with a sideways bulge, plus an open head.
function arrow(x1, y1, x2, y2, bulge) {
  const dx = x2 - x1,
    dy = y2 - y1,
    len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len,
    ny = dx / len;
  const c1x = x1 + dx * 0.3 + nx * bulge,
    c1y = y1 + dy * 0.3 + ny * bulge;
  const c2x = x1 + dx * 0.7 + nx * bulge * 0.6,
    c2y = y1 + dy * 0.7 + ny * bulge * 0.6;
  // tangent at the end
  const tx = x2 - c2x,
    ty = y2 - c2y,
    tl = Math.hypot(tx, ty) || 1;
  const ux = tx / tl,
    uy = ty / tl;
  const h = 7,
    w = 4.5;
  const hx1 = x2 - ux * h - uy * w,
    hy1 = y2 - uy * h + ux * w;
  const hx2 = x2 - ux * h + uy * w,
    hy2 = y2 - uy * h - ux * w;
  return `M${x1} ${y1}C${c1x} ${c1y} ${c2x} ${c2y} ${x2} ${y2}M${hx1} ${hy1}L${x2} ${y2}L${hx2} ${hy2}`;
}

function firstRect(el) {
  const rects = el.getClientRects();
  return rects.length ? rects[rects.length - 1] : el.getBoundingClientRect();
}

// Margin: the arrow leaves the note, drops into the gap under the word's line,
// runs along that gap and hooks up to the word's underline. It never crosses text.
function marginPath(n, w) {
  const x1 = n.left - 6,
    y1 = n.top + n.height * 0.55;
  const gapY = w.bottom + 6;
  const ex = w.right + 3,
    ey = w.bottom + 2;
  const runStart = Math.min(x1 - 26, ex + 40);
  const mid = (runStart + ex) / 2;
  const head = `M${ex + 8} ${ey - 1}L${ex} ${ey}L${ex + 7} ${ey + 6}`;
  if (runStart <= ex + 12) {
    // word ends near the margin: a single short hook
    return `M${x1} ${y1}Q${x1 - 10} ${gapY} ${ex} ${ey}${head}`;
  }
  return (
    `M${x1} ${y1}Q${x1 - 12} ${gapY + 1} ${runStart} ${gapY}` +
    `C${mid + 20} ${gapY - 2} ${mid - 20} ${gapY + 3} ${ex + 10} ${gapY}Q${ex + 3} ${gapY} ${ex} ${ey}${head}`
  );
}

function layoutMargin(root) {
  const svg = root.querySelector('.ann-arrows');
  const notes = [...root.querySelectorAll('.ann-note')];
  if (getComputedStyle(notes[0]).display === 'none') {
    svg.innerHTML = '';
    return;
  }
  let paths = '';
  let floor = -Infinity;
  for (const note of notes) {
    const word = root.querySelector(`.ann-word[data-key="${note.dataset.for}"]`);
    const w = rel(root, firstRect(word));
    let top = w.top - 4;
    if (top < floor) top = floor;
    note.style.top = `${top}px`;
    const n = rel(root, note.getBoundingClientRect());
    floor = n.bottom + 10;
    paths += `<path d="${marginPath(n, w)}"/>`;
  }
  svg.innerHTML = paths;
}

// Float: every note sits in the gap above its word; a short hook drops onto the word.
function layoutFloat(root) {
  const svg = root.querySelector('.ann-arrows');
  const notes = [...root.querySelectorAll('.ann-note')];
  if (getComputedStyle(notes[0]).display === 'none') {
    svg.innerHTML = '';
    return;
  }
  let paths = '';
  for (const note of notes) {
    const word = root.querySelector(`.ann-word[data-key="${note.dataset.for}"]`);
    const w = rel(root, firstRect(word));
    note.style.left = `${w.left + w.width * 0.5 + 14}px`;
    note.style.top = `${w.top - note.offsetHeight - 2}px`;
    const n = rel(root, note.getBoundingClientRect());
    paths += `<path d="${arrow(n.left - 2, n.bottom - 4, w.left + w.width * 0.45, w.top - 1, 6)}"/>`;
  }
  svg.innerHTML = paths;
}

function layout() {
  const root = document.querySelector(`[data-variant="${variants[current]}"]`);
  if (variants[current] === 'margin') layoutMargin(root);
  if (variants[current] === 'float') layoutFloat(root);
}

// Hover a note → its word warms; hover a word → nothing extra (the arrow already points).
for (const note of document.querySelectorAll('.ann-note')) {
  const root = note.closest('.ann');
  const word = root.querySelector(`.ann-word[data-key="${note.dataset.for}"]`);
  note.addEventListener('pointerenter', () => word.setAttribute('data-hot', ''));
  note.addEventListener('pointerleave', () => word.removeAttribute('data-hot'));
}

function moveHighlight() {
  const el = items[current];
  highlight.style.width = el.offsetWidth + 'px';
  highlight.style.transform = `translateX(${el.offsetLeft}px)`;
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
  document.querySelectorAll('[data-variant]').forEach((el, j) => {
    el.hidden = j !== i;
  });
  requestAnimationFrame(layout);
}

items.forEach((el, i) => el.addEventListener('click', () => setActive(i)));
window.addEventListener('resize', () => {
  moveHighlight();
  layout();
});
document.fonts?.ready.then(layout);

document.addEventListener('keydown', (e) => {
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const num = parseInt(e.key, 10);
  if (num >= 1 && num <= variants.length) setActive(num - 1);
  else if (e.key === 'ArrowRight') setActive((current + 1) % variants.length);
  else if (e.key === 'ArrowLeft') setActive((current - 1 + variants.length) % variants.length);
});

setActive((parseInt(new URLSearchParams(location.search).get('v'), 10) || 1) - 1);
requestAnimationFrame(() => requestAnimationFrame(() => picker.setAttribute('data-ready', '')));
