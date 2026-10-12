(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  let vw = innerWidth, vh = innerHeight;

  // progress of a tall sticky scene: 0 when its top hits the viewport top, 1 when its bottom hits the viewport bottom
  const prog = el => {
    const r = el.getBoundingClientRect();
    return clamp(-r.top / Math.max(1, r.height - vh));
  };

  // seeded random so torn edges look the same on every visit
  const rng = seed => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  /* ---------- carta (data) ---------- */
  const MENU = [
    ['Desayunos', 'img/w-pannino.webp', 'Pannino de pavo y queso crema', [
      ['Desayuno Americano', '8,19', 'Tres panquecas con miel, huevo frito y tocineta.'],
      ['Desayuno Pistazie', '12,55', 'Pensado para dos.'],
      ['Omelette pavo y queso crema', '8,99'],
      ['Omelette con vegetales', '7,00'],
      ['Pannino pavo y queso crema', '7,97', 'Pan redondo de la casa, huevo frito y rúcula.'],
      ['Pannino reina pepiada', '7,97', 'Con queso gratinado.'],
      ['Pannino tradicional', '5,84']]],
    ['Entradas', 'img/n-tequenos.webp', 'Tequeños', [
      ['Tequeños', '8,58', 'Con salsa de la casa.'],
      ['Dedos de mozzarella', '9,17'],
      ['Tenders de pollo', '9,17', 'Con papas fritas.'],
      ['Nachos', '9,78', 'Queso fundido, pico de gallo y aceitunas negras.'],
      ['Papas con cheddar y tocineta', '6,77']]],
    ['Hamburguesas', 'img/w-crispy.webp', 'Burger César crispy', [
      ['Classic Burger', '9,17', 'Res, cheddar, cebolla caramelizada, rúgula y tocineta.'],
      ['Crispy Chicken', '9,17', 'Pollo, cheddar, coleslaw y cebolla caramelizada.'],
      ['César carne', '9,78', 'Res, ensalada césar, pecorino y tocineta.'],
      ['César crispy', '9,78'],
      ['César tradicional', '9,78'],
      ['Spicy Chicken', '9,78', 'Pollo crispy, jamón ahumado y huevo frito.'],
      ['Spicy carne', '9,78'],
      ['Onion BBQ', '9,78', 'Res, queso americano, cebolla crispy y salsa BBQ.']], 'Todas con papas fritas.'],
    ['Pizzas', 'img/n-pizza.webp', 'Pizza Viña', [
      ['Margarita', '9,29'],
      ['Pistazie', '10,49', 'Jamón ahumado y albahaca fresca.'],
      ['Pepperoni', '10,49'],
      ['Ajoporro', '10,49', 'Champiñones y aceitunas negras.'],
      ['Vegetariana', '10,49'],
      ['Viña', '10,49', 'Tocineta, jamón, pepperoni y maíz.'],
      ['Capresa', '11,69', 'Tomate, pesto y pecorino.'],
      ['Pollo BBQ', '11,69'],
      ['Mortadella Bianca', '12,89', 'Mortadela con pistacho, rúgula, miel y pepperoncino.']]],
    ['Pastas', 'img/n-pasticho.webp', 'Pasticho', [
      ['Pasticho', '9,78', 'Con pesto y pancito de ajo.'],
      ['Pasta Pistazie', '9,78', 'Salsa blanca de la casa, parmesano y tocineta.'],
      ['Bolognesa', '9,78'],
      ['Cuatro quesos', '9,78'],
      ['Napoli', '9,78'],
      ['Amatriciana', '9,78'],
      ['Pesto', '9,78']]],
    ['Paninis', null, '', [
      ['Panini crispy', '8,19'],
      ['Panini roast beef', '8,19'],
      ['Panini tradicional', '8,19'],
      ['Panini Filadelfia', '9,36'],
      ['Panini italiano', '9,36'],
      ['Panini reina pepiada', '9,36']], 'Con papas fritas.'],
    ['Sándwiches', null, '', [
      ['Reina pepiada', '9,90', 'Gratinado, con tocineta, aguacate y rúgula.'],
      ['Pollo tradicional', '9,90'],
      ['Roast beef', '9,90', 'Pan de mantequilla y cheddar.']]],
    ['Ensaladas', 'img/n-cesar.webp', 'Ensalada César con pollo crispy', [
      ['César', '10,36'],
      ['Pistazie', '10,98', 'Aguacate, mozzarella, tocineta y aderezo de mostaza y miel.'],
      ['Cangrejo', '11,57', 'Surimi, aguacate, piña y aderezo asiático.']]],
    ['Platos', 'img/n-lomito.webp', 'Lomito al romero', [
      ['Pollo a la plancha', '11,57', 'Al romero, con papas y ensalada.'],
      ['Pollo a la parmesana', '11,70'],
      ['Milanesa crispy', '12,18', 'Con papas y ensalada césar.'],
      ['Lomito con papas', '13,97', 'Al romero, con ensalada césar.'],
      ['Parrilla mixta', '16,39', 'Lomito y pollo al grill con vegetales.']]],
    ['Postres', 'img/n-cheesecake.webp', 'Cheesecake de fresa', [
      ['Cheesecake Pistazie', '6,44'],
      ['Cheesecake de Nutella', '5,84'],
      ['Cheesecake de fresa', '5,27'],
      ['Cheesecake frío de Oreo', '5,27'],
      ['Tiramisú', '5,27'],
      ['Torta de chocolate húmeda', '5,50'],
      ['Red velvet', '4,67'],
      ['Tres leches', '4,67'],
      ['Quesillo', '4,44'],
      ['Brownie con helado', '6,44'],
      ['Fresas con crema y leche condensada', '6,99']]],
    ['Bebidas', null, '', [
      ['Jugos naturales', '3,50', 'Fresa, mora, parchita, piña, melón, lechosa o limonada.'],
      ['Té Lipton', '3,00'],
      ['Nestea', '2,50'],
      ['Línea Pepsi', '2,50'],
      ['Agua con gas', '2,00'],
      ['Agua', '1,00']]]
  ];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const cols = $('#cols');
  if (cols) {
    cols.innerHTML = MENU.map(([name, img, alt, items, note]) =>
      `<section class="cat"><h3>${esc(name)}</h3>` +
      (img ? `<figure><img src="${img}" alt="${esc(alt)}" loading="lazy"></figure>` : '') +
      items.map(([n, p, d]) => `<div class="it"><div class="row">${esc(n)}<span>$${p}</span></div>${d ? `<p>${esc(d)}</p>` : ''}</div>`).join('') +
      (note ? `<p class="ref" style="margin:6px 0 0;text-align:left;border:0;padding:0">${esc(note)}</p>` : '') +
      `</section>`).join('');
  }

  /* ---------- muro de fotos ---------- */
  const mcols = $('#mcols');
  if (mcols) {
    const N = 32, per = 8, durs = [58, 72, 64, 80];
    let html = '';
    for (let c = 0; c < 4; c++) {
      let imgs = '';
      for (let k = 0; k < per; k++) imgs += `<img src="img/p-${(c * per + k) % N + 1}.webp" alt="" loading="lazy">`;
      html += `<div class="mcol${c % 2 ? ' rev' : ''}" style="--dur:${durs[c]}s"><div class="run">${imgs}${imgs}</div></div>`;
    }
    mcols.innerHTML = html;
  }

  /* ---------- torn edges ---------- */
  function tornPolygon(seed, amp) {
    const r = rng(seed), pts = [];
    const side = (fx, fy) => { for (let t = 0; t <= 100; t += 2 + r() * 4) pts.push(fx(Math.min(t, 100), r() * amp)); };
    side((t, j) => `${t}% ${j}%`);
    side((t, j) => `${100 - j}% ${t}%`);
    side((t, j) => `${100 - t}% ${100 - j}%`);
    side((t, j) => `${j}% ${100 - t}%`);
    return `polygon(${pts.join(',')})`;
  }
  $$('.fl').forEach((el, i) => { el.style.clipPath = tornPolygon(11 + i * 7, 2.2); });

  // the tear scene: one jagged line shared by both halves, plus a white fibre strip on each side
  (function buildTear() {
    const top = $('.half.top svg'), bot = $('.half.bot svg');
    if (!top) return;
    const r = rng(42), edge = [];
    let y = 500;
    for (let x = 0; x <= 1000; x += 8 + r() * 22) {
      y += (r() - .5) * 46; y = clamp(y, 440, 560);
      edge.push([Math.min(x, 1000), y + (r() < .18 ? (r() - .5) * 40 : 0)]);
    }
    if (edge[edge.length - 1][0] < 1000) edge.push([1000, y]);
    const line = pts => pts.map(p => p.join(',')).join(' L');
    const fibre = (dir) => edge.map(([x, yy]) => [x, yy + dir * (5 + r() * 12)]);
    const fTop = fibre(1), fBot = fibre(-1);
    $('.paper', top).setAttribute('d', `M0,0 L1000,0 L${line(edge.slice().reverse())} Z`);
    $('.fiber', top).setAttribute('d', `M${line(edge)} L${line(fTop.slice().reverse())} Z`);
    $('.paper', bot).setAttribute('d', `M0,1000 L1000,1000 L${line(edge.slice().reverse())} Z`);
    $('.fiber', bot).setAttribute('d', `M${line(edge)} L${line(fBot.slice().reverse())} Z`);
  })();

  /* ---------- smooth wheel ---------- */
  let wheelTarget = scrollY, wheelCur = scrollY, wheelRaf = 0;
  const maxScroll = () => document.documentElement.scrollHeight - vh;
  function wheelStep() {
    wheelCur += (wheelTarget - wheelCur) * .11;
    if (Math.abs(wheelTarget - wheelCur) < .5) wheelCur = wheelTarget;
    scrollTo(0, wheelCur);
    wheelRaf = wheelCur !== wheelTarget ? requestAnimationFrame(wheelStep) : 0;
  }
  const smoothTo = y => {
    if (!fine || reduce) { scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' }); return; }
    wheelTarget = clamp(y, 0, maxScroll()); if (!wheelRaf) wheelRaf = requestAnimationFrame(wheelStep);
  };
  if (fine && !reduce) {
    addEventListener('wheel', e => {
      if (e.ctrlKey || e.defaultPrevented) return;
      e.preventDefault();
      if (!wheelRaf) wheelCur = wheelTarget = scrollY;
      wheelTarget = clamp(wheelTarget + e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? vh : 1), 0, maxScroll());
      if (!wheelRaf) wheelRaf = requestAnimationFrame(wheelStep);
    }, { passive: false });
    addEventListener('keydown', () => { if (wheelRaf) { cancelAnimationFrame(wheelRaf); wheelRaf = 0; } });
  }

  /* ---------- nav ---------- */
  const nav = $('#nav'), links = $('#links'), burger = $('#burger');
  const closeMenu = () => { links.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Abrir menú'); };
  burger.addEventListener('click', () => {
    const open = !links.classList.contains('open');
    links.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const t = id.length > 1 && document.querySelector(id);
    if (!t) return;
    e.preventDefault(); closeMenu();
    const nh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--navh')) || 72;
    const y = t.getBoundingClientRect().top + scrollY - (t.classList.contains('scene') ? 0 : nh);
    smoothTo(y);
    history.replaceState(null, '', id);
  }));
  const navLinks = $$('.links a');
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    navLinks.forEach(a => a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + en.target.id)));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['obras', 'carta', 'cafe', 'lugar', 'sedes'].forEach(id => { const el = document.getElementById(id); el && io.observe(el); });

  /* ---------- reveals ---------- */
  const once = (els, cls, opts = { threshold: .2 }) => {
    const o = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add(cls); o.unobserve(en.target); } }), opts);
    els.forEach(el => o.observe(el));
  };
  $$('.toplist, .brewlist').forEach(ul => $$('li', ul).forEach((li, i) => li.style.setProperty('--i', i)));
  once($$('.toplist, .brewlist'), 'shown');
  once($$('.cat figure'), 'in', { threshold: .6 });
  once($$('.fin .neon'), 'lit', { threshold: .5 });

  /* ---------- hero ---------- */
  const hero = $('.hero'), heroNeon = $('.hero .neon');
  const light = () => { hero.classList.add('ready'); heroNeon.classList.add('lit'); };
  (document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]) : Promise.resolve()).then(() => setTimeout(light, 250));
  const floats = $$('.fl').map(el => ({ el, d: parseFloat(el.dataset.d) || 1 }));
  let mx = 0, my = 0, smx = 0, smy = 0;
  if (fine && !reduce) addEventListener('pointermove', e => { mx = e.clientX / vw - .5; my = e.clientY / vh - .5; }, { passive: true });

  /* ---------- scenes ---------- */
  const tear = $('#rasgo'), tearImg = $('.tear-photo img'), tTop = $('.half.top'), tBot = $('.half.bot'), tTag = $('.tear-tag'), fibres = $$('.half .fiber');
  function sceneTear() {
    const p = prog(tear);
    const crack = clamp(p / .1);
    const e = ease(clamp((p - .08) / .62));
    fibres.forEach(f => (f.style.opacity = crack));
    tTop.style.transform = `translate3d(0,${-e * 64}%,0) rotate(${-e * 4}deg)`;
    tBot.style.transform = `translate3d(0,${e * 64}%,0) rotate(${e * 3}deg)`;
    tearImg.style.transform = `scale(${1.18 - .18 * easeOut(clamp((p - .05) / .8))})`;
    const t = easeOut(clamp((p - .68) / .18));
    tTag.style.opacity = t;
    tTag.style.transform = `translate3d(0,${(1 - t) * 20}px,0)`;
  }

  const obras = $('#obras'), track = $('#track'), obraEls = $$('.obra'), bar = $('#obras-bar');
  let trackMax = 0, obraGeo = [];
  function measureObras() {
    trackMax = Math.max(0, track.scrollWidth - vw);
    obraGeo = obraEls.map(el => ({ el, img: $('img', el), c: el.offsetLeft + el.offsetWidth / 2 }));
  }
  function sceneObras() {
    const p = prog(obras);
    const x = -p * trackMax;
    track.style.transform = `translate3d(${x}px,0,0)`;
    bar.style.transform = `scaleX(${p})`;
    for (const o of obraGeo) {
      const c = (o.c + x - vw / 2) / vw; // -1..1 around the centre of the screen
      if (c < -1.4 || c > 1.4) continue;
      o.el.style.setProperty('--lit', (1 - clamp(Math.abs(c) * 1.8)).toFixed(3));
      o.el.style.transform = `translate3d(0,${Math.abs(c) * 26}px,0) rotate(${c * 2.2}deg)`;
      o.img.style.transform = `translate3d(${-c * 7}%,0,0) scale(1.14)`;
    }
  }

  const times = $('#carta'), front = $('#front');
  function sceneTimes() {
    const p = prog(times);
    const e = easeOut(clamp(p / .62));
    const rot = (1 - e) * -620 - 1.5 * e;
    const s = .06 + .94 * e;
    front.style.transform = `rotateX(${(1 - e) * 24}deg) rotate(${rot}deg) scale(${s})`;
    front.style.opacity = clamp(p / .06);
  }

  const waf = $('#waffles'), cards = $$('.pc'), wafT = $('.waf-t');
  const R0 = cards.map((_, i) => ((i * 37) % 17) - 8);
  const T_DESK = [[-37, -28, -8], [-14, -36, 5], [14, -35, -4], [37, -25, 7], [-42, 4, 4], [42, 6, -6], [-31, 32, -5], [-10, 38, 3], [15, 37, -7], [37, 33, 4]];
  const T_MOB = [[-27, -34, -6], [27, -36, 5], [-29, -12, 4], [29, -10, -5], [-28, 13, -4], [28, 15, 6], [-26, 36, 5], [26, 38, -4], [0, -44, 2], [0, 44, -3]];
  function sceneWaf() {
    const p = prog(waf);
    const T = vw < 760 ? T_MOB : T_DESK;
    cards.forEach((c, i) => {
      const s = .04 + i * .045;
      const e = ease(clamp((p - s) / .32));
      const [tx, ty, tr] = T[i];
      const drift = clamp((p - .8) / .2) * 1.08;
      const k = e * (1 + drift * .08);
      c.style.transform = `translate(-50%,-50%) translate3d(${tx * k}vw,${ty * k}vh,0) rotate(${R0[i] + (tr - R0[i]) * e}deg)`;
      c.style.zIndex = String(10 - i);
    });
    const t = easeOut(clamp((p - .5) / .2));
    wafT.style.opacity = t;
    wafT.style.transform = `scale(${.86 + .14 * t})`;
  }

  const cafe = $('#cafe'), cup = $('#cup'), cupImg = $('#cup img'), cupTop = $('#cup .cup-top'), cwL = $('.cw.l'), cwR = $('.cw.r'), cafeMsg = $('.cafe-msg');
  function sceneCafe() {
    const p = prog(cafe);
    const g = ease(clamp((p - .1) / .55));
    const r0 = Math.min(vw, vh) * .21, r1 = Math.hypot(vw, vh) / 2 + 4;
    cup.style.clipPath = `circle(${(r0 + (r1 - r0) * g).toFixed(1)}px at 50% 50%)`;
    cupImg.style.transform = `scale(${1.25 - .25 * g}) rotate(${(1 - g) * -8}deg)`;
    cupTop.style.opacity = 1 - clamp(g * 3.2);
    cupTop.style.transform = `scale(${1 + g * 1.6}) rotate(${p * 140}deg)`;
    const mob = vw < 760;
    const off = g * (mob ? 70 : 60);
    cwL.style.transform = mob ? `translate3d(0,${-off}vh,0)` : `translate3d(${-off}vw,0,0)`;
    cwR.style.transform = mob ? `translate3d(0,${off}vh,0)` : `translate3d(${off}vw,0,0)`;
    cwL.style.opacity = cwR.style.opacity = 1 - clamp(g * 2.2);
    cup.style.setProperty('--dim', clamp((p - .58) / .18).toFixed(3));
    const m = easeOut(clamp((p - .64) / .16));
    cafeMsg.style.opacity = m;
    cafeMsg.style.transform = `translate3d(0,${(1 - m) * 24}px,0)`;
  }

  const arts = $('#arts'), artImgs = arts ? $$('img', arts) : [];
  function sceneArts() {
    const r = arts.getBoundingClientRect();
    if (r.bottom < -100 || r.top > vh + 100) return;
    const q = easeOut(clamp(1 - (r.top - vh * .25) / (vh * .6)));
    const mid = (artImgs.length - 1) / 2;
    artImgs.forEach((im, i) => {
      const d = i - mid;
      im.style.transform = `translate3d(${-d * (1 - q) * 100}%,${(1 - q) * 40}px,0) rotate(${(1 - q) * (i % 2 ? 160 : -160)}deg)`;
      im.style.opacity = .2 + .8 * q;
    });
  }

  const lugar = $('#lugar'), lcols = $$('.lcol').map(el => ({ el, s: parseFloat(el.dataset.s) || 1 })), lugarT = $('.lugar-t');
  const lh2 = $('.lugar-t h2');
  lh2.innerHTML = lh2.innerHTML.split(/<br\s*\/?>/i).map(t => `<span class="ln"><span>${t.trim()}</span></span>`).join('');
  const lines = $$('.ln > span', lh2);
  function sceneLugar() {
    const p = prog(lugar);
    lcols.forEach(({ el, s }) => { el.style.transform = `translate3d(0,${(p - .5) * s * 36}vh,0)`; });
    lines.forEach((ln, i) => {
      const t = easeOut(clamp((p - .06 - i * .07) / .2));
      ln.style.transform = `translate3d(0,${(1 - t) * 105}%,0)`;
    });
    lugarT.classList.toggle('on', p > .32);
  }

  const chev = $('.chev'), chevRow = $('#chev-row');
  if (chevRow) chevRow.innerHTML += chevRow.innerHTML + chevRow.innerHTML;
  function sceneChev() {
    const r = chev.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const t = (vh - r.top) / (vh + r.height);
    chevRow.style.transform = `translate3d(${-t * 33}%,0,0)`;
  }

  const fab = $('.fab');
  let lastY = scrollY;
  function chrome() {
    const y = scrollY;
    nav.classList.toggle('solid', y > 30);
    nav.classList.toggle('hide', y > vh && y > lastY + 2 && !links.classList.contains('open'));
    if (y < lastY - 2 || y < vh) nav.classList.remove('hide');
    lastY = y;
    fab.classList.toggle('show', y > vh * .9);
  }

  function sceneHero() {
    if (scrollY > vh * 1.2) return;
    smx += (mx - smx) * .08; smy += (my - smy) * .08;
    const y = scrollY;
    floats.forEach(({ el, d }) => {
      el.style.transform = `translate3d(${smx * d * 26}px,${-y * .28 * d + smy * d * 18}px,0) rotate(var(--r))`;
    });
    if (Math.abs(mx - smx) > .002 || Math.abs(my - smy) > .002) queue();
  }

  /* ---------- loop ---------- */
  let queued = false;
  function run() {
    queued = false;
    chrome();
    sceneHero();
    sceneTear();
    sceneObras();
    sceneTimes();
    sceneWaf();
    sceneCafe();
    if (arts) sceneArts();
    sceneLugar();
    sceneChev();
  }
  function queue() { if (!queued) { queued = true; requestAnimationFrame(run); } }
  addEventListener('scroll', queue, { passive: true });
  addEventListener('pointermove', queue, { passive: true });
  let rt;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { vw = innerWidth; vh = innerHeight; measureObras(); queue(); }, 120);
  });
  measureObras();
  addEventListener('load', () => { measureObras(); queue(); });
  if (document.fonts) document.fonts.ready.then(() => { measureObras(); queue(); });
  run();
})();
