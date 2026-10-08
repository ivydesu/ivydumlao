(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;

  // Toast helper
  const toast = $('#toast');
  let toastTimer;
  const showToast = msg => {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  };

  // Theme toggle (remembers choice when storage is available)
  const themeBtn = $('#theme');
  const setTheme = t => {
    root.dataset.theme = t;
    themeBtn.textContent = t === 'dark' ? '☀' : '🌙';
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  };
  try { setTheme(localStorage.getItem('theme') || 'dark'); } catch { setTheme('dark'); }
  themeBtn.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('theme', next); } catch {}
  });

  // Mobile menu
  const burger = $('#burger'), menu = $('#menu');
  const toggleMenu = open => {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  burger.addEventListener('click', () => toggleMenu(!menu.classList.contains('open')));
  $$('.nav-link').forEach(a => a.addEventListener('click', () => toggleMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') toggleMenu(false); });

  // Typing animation
  const typing = $('#typing');
  const words = ['Web Developer', 'Database Enthusiast', 'Problem Solver', 'Lifelong Learner'];
  let w = 0, c = 0, del = false;
  const type = () => {
    const word = words[w];
    c += del ? -1 : 1;
    typing.textContent = word.slice(0, c);
    let delay = del ? 45 : 90;
    if (!del && c === word.length) { del = true; delay = 1400; }
    else if (del && c === 0) { del = false; w = (w + 1) % words.length; delay = 400; }
    setTimeout(type, delay);
  };
  type();

  // Scroll reveal + skill bars + counters
  const countUp = el => {
    const target = +el.dataset.count, suffix = el.dataset.suffix || '', t0 = performance.now(), dur = 1400;
    const step = now => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  $$('.bar').forEach(b => b.style.setProperty('--w', b.dataset.level + '%'));
  const revealObs = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      $$('[data-count]', e.target).forEach(countUp);
      obs.unobserve(e.target);
    });
  }, { threshold: .15 });
  $$('.reveal').forEach(el => revealObs.observe(el));

  // Active nav link
  const links = $$('.nav-link');
  const sections = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  // Back to top
  const toTop = $('#toTop');
  window.addEventListener('scroll', () => toTop.classList.toggle('show', window.scrollY > 500), { passive: true });
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Project filtering
  $$('.filter').forEach(btn => btn.addEventListener('click', () => {
    $$('.filter').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    const f = btn.dataset.filter;
    $$('.project').forEach(p => p.classList.toggle('hide', f !== 'all' && !p.dataset.cat.split(' ').includes(f)));
  }));

  // Demo and source buttons (sample projects have no public links yet)
  $$('[data-toast]').forEach(b => b.addEventListener('click', () => showToast('This link will be available soon.')));

  // Contact form validation
  const form = $('#contactForm');
  const rules = {
    name: v => v.trim().length >= 2 || 'Enter your name (at least 2 characters).',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Enter a valid email address.',
    subject: v => v.trim().length >= 3 || 'Enter a subject (at least 3 characters).',
    message: v => v.trim().length >= 10 || 'Enter a message (at least 10 characters).'
  };
  const check = name => {
    const input = form.elements[name], res = rules[name](input.value);
    const ok = res === true;
    input.closest('.field').classList.toggle('bad', !ok);
    input.setAttribute('aria-invalid', !ok);
    $('#' + name + 'Err').textContent = ok ? '' : res;
    return ok;
  };
  Object.keys(rules).forEach(n => {
    form.elements[n].addEventListener('blur', () => check(n));
    form.elements[n].addEventListener('input', () => { if (form.elements[n].closest('.field').classList.contains('bad')) check(n); });
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const results = Object.keys(rules).map(check);
    if (results.includes(false)) {
      form.querySelector('[aria-invalid=true]').focus();
      showToast('Please fix the highlighted fields.');
      return;
    }
    form.reset();
    showToast('Message sent! Thank you, I will reply soon.');
  });

  $('#year').textContent = new Date().getFullYear();
})();
