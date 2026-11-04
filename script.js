(() => {
  const START = new Date(2026, 6, 4, 0, 0, 0); // 4 de julio de 2026
  const $ = id => document.getElementById(id);

  // Contador de tiempo juntos
  function tick() {
    const now = new Date();
    let m = (now.getFullYear() - START.getFullYear()) * 12 + now.getMonth() - START.getMonth();
    let anchor = new Date(START); anchor.setMonth(START.getMonth() + m);
    if (anchor > now) { m--; anchor = new Date(START); anchor.setMonth(START.getMonth() + m); }
    let s = Math.floor((now - anchor) / 1000);
    const d = Math.floor(s / 86400); s %= 86400;
    const h = Math.floor(s / 3600); s %= 3600;
    m = Math.max(m, 0);
    const label = m === 1 ? '1 mes' : `${m} meses`;
    document.querySelectorAll('.js-meses').forEach(el => { if (el.textContent !== label) el.textContent = label; });
    document.querySelectorAll('.js-cap').forEach(el => { el.textContent = m; });
    $('c-m').textContent = m;
    $('c-d').textContent = d;
    $('c-h').textContent = h;
    $('c-mi').textContent = Math.floor(s / 60);
    $('c-s').textContent = s % 60;
  }
  tick(); setInterval(tick, 1000);

  // Burbujas de fondo
  const bub = document.querySelector('.bubbles');
  for (let i = 0; i < 14; i++) {
    const b = document.createElement('i'), sz = 10 + Math.random() * 30;
    b.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random() * 100}%;animation-duration:${10 + Math.random() * 14}s;animation-delay:${-Math.random() * 20}s`;
    bub.appendChild(b);
  }

  // Aparecer al hacer scroll
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .1 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Confeti
  const cv = $('confetti'), cx = cv.getContext('2d');
  let parts = [];
  function confetti() {
    cv.width = innerWidth; cv.height = innerHeight;
    const cols = ['#aee1ff', '#4aa3e8', '#ffb7d0', '#e98ab5', '#fff3b0', '#ffffff'];
    const idle = parts.length === 0;
    for (let i = 0; i < 160; i++) parts.push({ x: innerWidth / 2, y: innerHeight * .6, vx: (Math.random() - .5) * 14, vy: -Math.random() * 16 - 4, r: 4 + Math.random() * 6, c: cols[i % cols.length], a: Math.random() * 6, life: 0 });
    if (idle) loop();
  }
  function loop() {
    cx.clearRect(0, 0, cv.width, cv.height);
    parts.forEach(p => { p.vy += .35; p.x += p.vx; p.y += p.vy; p.a += .2; p.life++; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.a); cx.fillStyle = p.c; cx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * .6); cx.restore(); });
    parts = parts.filter(p => p.y < cv.height + 20 && p.life < 160);
    if (parts.length) requestAnimationFrame(loop); else cx.clearRect(0, 0, cv.width, cv.height);
  }

  // Tarjeta para raspar
  const box = $('scratch'), c = $('scratch-canvas'), ctx = c.getContext('2d');
  let drawing = false, done = false, lastCheck = 0;
  function paint() {
    ctx.globalCompositeOperation = 'source-over';
    const r = box.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    c.width = r.width * dpr; c.height = r.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const g = ctx.createLinearGradient(0, 0, r.width, r.height);
    g.addColorStop(0, '#9fd8ff'); g.addColorStop(.5, '#d6c8ff'); g.addColorStop(1, '#ffc3dc');
    ctx.fillStyle = g; ctx.fillRect(0, 0, r.width, r.height);
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    for (let i = 0; i < 40; i++) { ctx.beginPath(); ctx.arc(Math.random() * r.width, Math.random() * r.height, 2 + Math.random() * 5, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = '600 28px Fredoka, sans-serif';
    ctx.fillText('Raspa aquí ✨', r.width / 2, r.height / 2 + 8);
    ctx.globalCompositeOperation = 'destination-out';
  }
  function scratch(e) {
    if (!drawing || done) return;
    const r = c.getBoundingClientRect();
    ctx.beginPath(); ctx.arc(e.clientX - r.left, e.clientY - r.top, 24, 0, 7); ctx.fill();
    const now = performance.now();
    if (now - lastCheck > 150) { lastCheck = now; check(); }
  }
  function check() {
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let clear = 0, n = 0;
    for (let i = 3; i < d.length; i += 160) { n++; if (d[i] === 0) clear++; }
    if (clear / n > .5) finish();
  }
  function finish() {
    done = true; c.classList.add('done'); confetti();
    $('redeem').hidden = false;
  }
  c.addEventListener('pointerdown', e => { drawing = true; c.setPointerCapture(e.pointerId); scratch(e); });
  c.addEventListener('pointermove', scratch);
  c.addEventListener('pointerup', () => drawing = false);
  c.addEventListener('pointercancel', () => drawing = false);
  paint();
  if (document.fonts) document.fonts.ready.then(() => { if (!done) paint(); });
  let rw = innerWidth;
  addEventListener('resize', () => { if (!done && innerWidth !== rw) { rw = innerWidth; paint(); } });

  $('redeem').addEventListener('click', () => {
    const m = $('redeem-msg');
    m.hidden = false;
    m.textContent = 'Canjeado 💙 Mándame una captura y dime cuál es tu deseo, ovejita.';
    confetti();
  });
})();
