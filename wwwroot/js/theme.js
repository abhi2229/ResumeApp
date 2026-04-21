// ── Theme ────────────────────────────────────────────────────
const root = document.getElementById('html-root');
const btn  = document.getElementById('themeToggle');

const saved = localStorage.getItem('theme') || 'dark';
root.setAttribute('data-theme', saved);

btn.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// ── Custom cursor ────────────────────────────────────────────
const dot  = document.createElement('div'); dot.id = 'cursor';
const ring = document.createElement('div'); ring.id = 'cursor-ring';
document.body.appendChild(dot);
document.body.appendChild(ring);

let mx = -100, my = -100, rx = -100, ry = -100;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

(function loop() {
  rx += (mx - rx) * 0.22;
  ry += (my - ry) * 0.22;
  dot.style.left  = mx + 'px';
  dot.style.top   = my + 'px';
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(loop);
})();

document.querySelectorAll('a, button, .exp-entry, .proj-card, .skill-cell, .cert-card').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// ── Skill bar animation ──────────────────────────────────────
function animateBars() {
  document.querySelectorAll('.skill-bar-fill').forEach(bar => {
    const w = bar.getAttribute('data-width');
    bar.style.width = w + '%';
  });
}
setTimeout(animateBars, 400);

// ── Scroll fade-up ───────────────────────────────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('in'), i * 80);
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
