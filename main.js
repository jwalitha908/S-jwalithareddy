/* ================================================
   JWALITHA REDDY PORTFOLIO — main.js
   ================================================ */

/* ---- 1. PARTICLE BACKGROUND CANVAS ---- */
(function initBgCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  const PARTICLE_COUNT = 90;
  const CONNECT_DIST = 140;
  const COLORS = ['168,85,247', '6,182,212', '236,72,153'];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 0.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.5 + 0.2
    };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(168,85,247,${(1 - dist / CONNECT_DIST) * 0.15})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    particles.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`; ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
  draw();
})();


/* ---- 2. NAVBAR ---- */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.querySelector('.nav-links');
  const style = document.createElement('style');
  style.textContent = `.nav-links a.active{color:#a855f7!important;background:rgba(168,85,247,.1)!important}`;
  document.head.appendChild(style);

  window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 30));

  hamburger && hamburger.addEventListener('click', () => {
    const open = navLinks.style.display === 'flex';
    Object.assign(navLinks.style, {
      display: open ? 'none' : 'flex', flexDirection: 'column',
      position: 'absolute', top: '70px', right: '24px',
      background: 'rgba(5,8,22,0.95)', backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
      padding: '12px', gap: '4px', zIndex: '999'
    });
  });

  document.querySelectorAll('.nav-links a').forEach(l => l.addEventListener('click', () => navLinks.style.display = 'none'));

  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let cur = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 200) cur = s.id; });
    document.querySelectorAll('.nav-links a').forEach(a =>
      a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
  });
})();


/* ---- 3. TYPED TEXT ---- */
(function initTyped() {
  const el = document.getElementById('typed-text');
  if (!el) return;
  const phrases = ['Data Science Graduate','Machine Learning Engineer','AI Solutions Builder','Data Visualization Expert','Python Developer','Computer Vision Enthusiast'];
  let pi = 0, ci = 0, del = false;
  function type() {
    const cur = phrases[pi];
    el.textContent = del ? cur.slice(0, --ci) : cur.slice(0, ++ci);
    if (!del && ci === cur.length) { del = true; return setTimeout(type, 2000); }
    if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; }
    setTimeout(type, del ? 45 : 80);
  }
  type();
})();


/* ---- 4. STAT COUNTERS ---- */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  let started = false;
  function run() {
    if (started) return; started = true;
    counters.forEach(c => {
      const t = parseInt(c.dataset.target), step = Math.max(1, Math.ceil(t / 40));
      let n = 0;
      const tick = setInterval(() => { c.textContent = n = Math.min(n + step, t); if (n >= t) clearInterval(tick); }, 40);
    });
  }
  const hs = document.querySelector('.hero-stats');
  if (hs) { const o = new IntersectionObserver(e => { if (e[0].isIntersecting) { run(); o.disconnect(); } }, { threshold: 0.5 }); o.observe(hs); }
})();


/* ---- 5. PROJECT 1: GESTURE MOUSE LIVE DEMO ---- */
(function initGestureLive() {
  const vCursor = document.getElementById('virtual-cursor');
  const vBody = document.getElementById('vscreen-body');
  const ripple = document.getElementById('click-ripple');
  const tooltip = document.getElementById('vscreen-tooltip');
  const confEl = document.getElementById('conf-val');
  const fpsEl = document.getElementById('fps-val');
  const latEl = document.getElementById('lat-val');
  const lmNose = document.getElementById('lm-nose');
  const eyeL = document.getElementById('eye-l');
  const eyeR = document.getElementById('eye-r');
  if (!vCursor || !vBody) return;

  let cx = 80, cy = 60; // cursor position in vscreen
  let tx = 80, ty = 60; // target position
  let autoAngle = 0;
  let frame = 0;
  let lastClick = 0;

  const icons = vBody.querySelectorAll('.vscreen-icon');

  // Mouse/touch control of cursor inside vscreen-body
  vBody.addEventListener('mousemove', e => {
    const r = vBody.getBoundingClientRect();
    tx = e.clientX - r.left;
    ty = e.clientY - r.top;
    moveLandmarks(tx / r.width, ty / r.height);
  });

  vBody.addEventListener('mouseleave', () => { tx = null; ty = null; });

  vBody.addEventListener('click', e => {
    const r = vBody.getBoundingClientRect();
    triggerClick(e.clientX - r.left, e.clientY - r.top);
  });

  function moveLandmarks(nx, ny) {
    if (!lmNose) return;
    // Nose moves proportionally
    const bx = 40 + nx * 40, by = 50 + ny * 25;
    lmNose.setAttribute('cx', bx);
    lmNose.setAttribute('cy', by);
  }

  function triggerClick(x, y) {
    const now = Date.now();
    if (now - lastClick < 400) return;
    lastClick = now;
    // Eye blink animation
    if (eyeL) { eyeL.setAttribute('height', '2'); setTimeout(() => eyeL.setAttribute('height', '8'), 180); }
    if (eyeR) { eyeR.setAttribute('height', '2'); setTimeout(() => eyeR.setAttribute('height', '8'), 180); }
    // Ripple
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.remove('active');
    void ripple.offsetWidth;
    ripple.classList.add('active');
    // Check if hovering icon
    icons.forEach(ic => {
      const r = ic.getBoundingClientRect();
      const br = vBody.getBoundingClientRect();
      const ix = r.left - br.left + r.width / 2;
      const iy = r.top - br.top + r.height / 2;
      if (Math.abs(x - ix) < 30 && Math.abs(y - iy) < 30) {
        ic.classList.add('clicked');
        tooltip.textContent = 'Opened: ' + ic.dataset.label;
        tooltip.classList.add('show');
        setTimeout(() => { ic.classList.remove('clicked'); tooltip.classList.remove('show'); }, 1200);
      }
    });
  }

  function highlightUnderCursor() {
    icons.forEach(ic => {
      const r = ic.getBoundingClientRect();
      const br = vBody.getBoundingClientRect();
      const ix = r.left - br.left + r.width / 2;
      const iy = r.top - br.top + r.height / 2;
      ic.classList.toggle('hovered', Math.abs(cx - ix) < 28 && Math.abs(cy - iy) < 28);
    });
  }

  function loop() {
    frame++;
    // Auto demo path when mouse not over
    if (tx === null || tx === undefined) {
      autoAngle += 0.018;
      const bodyW = vBody.offsetWidth || 220, bodyH = vBody.offsetHeight || 200;
      tx = bodyW / 2 + Math.cos(autoAngle) * (bodyW * 0.32);
      ty = bodyH / 2 + Math.sin(autoAngle * 1.4) * (bodyH * 0.28);
      moveLandmarks(tx / bodyW, ty / bodyH);
      // Auto click every ~3s
      if (frame % 180 === 0) triggerClick(cx, cy);
    }
    // Smooth cursor
    cx += (tx - cx) * 0.1;
    cy += (ty - cy) * 0.1;
    vCursor.style.left = (cx - 4) + 'px';
    vCursor.style.top = (cy - 2) + 'px';
    highlightUnderCursor();
    // Update live stats
    if (frame % 20 === 0) {
      if (confEl) confEl.textContent = (93 + Math.floor(Math.random() * 6));
      if (fpsEl) fpsEl.textContent = (57 + Math.floor(Math.random() * 5));
      if (latEl) latEl.textContent = (15 + Math.floor(Math.random() * 8));
    }
    requestAnimationFrame(loop);
  }
  loop();
})();


/* ---- 6. PROJECT 2: DISEASE PREDICTION LIVE DEMO ---- */
const diseaseConfig = {
  diabetes: {
    fields: [
      { id: 'glucose', label: 'Glucose (mg/dL)', placeholder: '120', min: 50, max: 250, weight: 0.35 },
      { id: 'bmi', label: 'BMI', placeholder: '28.5', min: 10, max: 60, weight: 0.25 },
      { id: 'age', label: 'Age', placeholder: '45', min: 10, max: 90, weight: 0.2 },
      { id: 'bp', label: 'Blood Pressure', placeholder: '80', min: 40, max: 160, weight: 0.2 }
    ],
    thresholds: { normal: [0, 120], pre: [120, 180], high: [180, 250] },
    factors: ['Glucose Level', 'BMI Index', 'Age Factor', 'Blood Pressure']
  },
  heart: {
    fields: [
      { id: 'age', label: 'Age', placeholder: '55', min: 20, max: 90, weight: 0.25 },
      { id: 'chol', label: 'Cholesterol (mg/dL)', placeholder: '220', min: 100, max: 450, weight: 0.3 },
      { id: 'maxhr', label: 'Max Heart Rate', placeholder: '150', min: 60, max: 220, weight: 0.25 },
      { id: 'rbp', label: 'Resting BP', placeholder: '130', min: 80, max: 200, weight: 0.2 }
    ],
    thresholds: { normal: [0, 200], pre: [200, 240], high: [240, 450] },
    factors: ['Cholesterol', 'Heart Rate', 'Age Risk', 'Blood Pressure']
  },
  kidney: {
    fields: [
      { id: 'sc', label: 'Serum Creatinine', placeholder: '1.2', min: 0.4, max: 10, weight: 0.35 },
      { id: 'hemo', label: 'Hemoglobin (g/dL)', placeholder: '13', min: 3, max: 18, weight: 0.3 },
      { id: 'bp', label: 'Blood Pressure', placeholder: '80', min: 40, max: 180, weight: 0.2 },
      { id: 'age', label: 'Age', placeholder: '50', min: 10, max: 90, weight: 0.15 }
    ],
    thresholds: {},
    factors: ['Creatinine Lvl', 'Hemoglobin', 'BP Reading', 'Age Risk']
  }
};

let currentDisease = 'diabetes';

function switchDisease(type, btn) {
  currentDisease = type;
  document.querySelectorAll('.dtab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderDiseaseForm(type);
  const result = document.getElementById('disease-result');
  if (result) result.style.display = 'none';
}

function renderDiseaseForm(type) {
  const container = document.getElementById('disease-form');
  if (!container) return;
  const cfg = diseaseConfig[type];
  container.innerHTML = cfg.fields.map(f => `
    <div class="d-field">
      <label>${f.label}</label>
      <input type="number" id="df-${f.id}" placeholder="${f.placeholder}" min="${f.min}" max="${f.max}" step="0.1"/>
    </div>
  `).join('');
}

function runPrediction() {
  const btn = document.getElementById('predict-btn');
  const cfg = diseaseConfig[currentDisease];
  const result = document.getElementById('disease-result');

  // Gather values
  const vals = cfg.fields.map(f => {
    const el = document.getElementById('df-' + f.id);
    return { field: f, val: parseFloat(el?.value) || parseFloat(el?.placeholder) || 0 };
  });

  // Simulate ML score
  let rawScore = 0;
  vals.forEach(({ field, val }) => {
    const range = field.max - field.min;
    const norm = Math.max(0, Math.min(1, (val - field.min) / range));
    let contribution = norm;
    // Invert some (e.g. hemoglobin — higher is better)
    if (field.id === 'hemo' || field.id === 'maxhr') contribution = 1 - norm;
    rawScore += contribution * field.weight;
  });

  // Apply disease-specific multiplier
  const multiplier = currentDisease === 'diabetes' ? 1.15 : currentDisease === 'heart' ? 1.08 : 1.0;
  const riskPct = Math.min(98, Math.round(rawScore * multiplier * 100));

  // Animate
  btn.disabled = true;
  btn.innerHTML = `<svg class="spin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M21 12a9 9 0 11-9-9"/></svg> Analyzing…`;
  const spinStyle = document.createElement('style');
  spinStyle.textContent = `@keyframes spin{to{transform:rotate(360deg)}}.spin-icon{animation:spin .8s linear infinite}`;
  document.head.appendChild(spinStyle);

  setTimeout(() => {
    btn.disabled = false;
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg> Run AI Prediction`;
    showResult(riskPct, vals);
  }, 1400);
}

function showResult(riskPct, vals) {
  const result = document.getElementById('disease-result');
  const gaugeArc = document.getElementById('gauge-arc');
  const gaugePct = document.getElementById('gauge-pct');
  const verdict = document.getElementById('result-verdict');
  const factors = document.getElementById('result-factors');

  result.style.display = 'flex';

  // Gauge animation (157 = full arc length)
  const offset = 157 - (riskPct / 100) * 157;
  const color = riskPct < 35 ? '#10b981' : riskPct < 65 ? '#f59e0b' : '#ef4444';
  gaugeArc.style.transition = 'stroke-dashoffset 1s ease, stroke 0.5s';
  gaugeArc.style.stroke = color;
  setTimeout(() => { gaugeArc.style.strokeDashoffset = offset; }, 50);

  // Count up
  let n = 0;
  const tick = setInterval(() => {
    n = Math.min(n + 2, riskPct);
    gaugePct.textContent = n + '%';
    if (n >= riskPct) clearInterval(tick);
  }, 20);

  // Verdict
  const cfg = diseaseConfig[currentDisease];
  const diseaseName = currentDisease.charAt(0).toUpperCase() + currentDisease.slice(1);
  verdict.innerHTML = riskPct < 35
    ? `<span style="color:#10b981">✅ Low Risk</span><br><small style="color:#94a3b8;font-weight:400">${diseaseName} risk appears low based on your inputs.</small>`
    : riskPct < 65
    ? `<span style="color:#f59e0b">⚠️ Moderate Risk</span><br><small style="color:#94a3b8;font-weight:400">Consult a healthcare professional for ${diseaseName}.</small>`
    : `<span style="color:#ef4444">🚨 High Risk</span><br><small style="color:#94a3b8;font-weight:400">Please seek medical advice for ${diseaseName} assessment.</small>`;

  // Factor bars
  factors.innerHTML = vals.map(({ field, val }) => {
    const range = field.max - field.min;
    let pct = Math.round(Math.max(0, Math.min(100, (val - field.min) / range * 100)));
    const fc = pct > 70 ? '#ef4444' : pct > 40 ? '#f59e0b' : '#10b981';
    const factorName = cfg.factors[cfg.fields.indexOf(field)] || field.label;
    return `<div class="rfactor">
      <span class="rfactor-label">${factorName}</span>
      <div class="rfactor-bar"><div class="rfactor-fill" style="width:0%;background:${fc}" data-w="${pct}%"></div></div>
    </div>`;
  }).join('');

  // Animate factor bars
  setTimeout(() => {
    factors.querySelectorAll('.rfactor-fill').forEach(b => b.style.width = b.dataset.w);
  }, 100);
}

// Init disease form on load
document.addEventListener('DOMContentLoaded', () => {
  renderDiseaseForm('diabetes');
});
// Also init immediately in case DOM is already ready
if (document.readyState !== 'loading') renderDiseaseForm('diabetes');


/* ---- 7. 3D SKILL SPHERE ---- */
(function initSkillSphere() {
  const sphere = document.getElementById('skill-sphere');
  if (!sphere) return;
  const tags = ['Python','ML','OpenCV','Pandas','NumPy','Flask','MySQL','Power BI','Excel','Scikit-learn','TensorFlow','MediaPipe','Data Analysis','Visualization','AI Tools','ChatGPT','Gemini','C Language','HTML','Matplotlib'];
  tags.forEach((tag, i) => {
    const phi = Math.acos(1 - 2 * (i + 0.5) / tags.length);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const r = 130;
    const el = document.createElement('div');
    el.className = 'sphere-tag';
    el.textContent = tag;
    el.style.setProperty('--tag-transform',
      `translate(-50%,-50%) translate3d(${r*Math.sin(phi)*Math.cos(theta)}px,${r*Math.sin(phi)*Math.sin(theta)}px,${r*Math.cos(phi)}px)`);
    sphere.appendChild(el);
  });
})();


/* ---- 8. SCROLL REVEAL ---- */
(function initReveal() {
  const els = document.querySelectorAll(
    '.section-label,.section-title,.section-subtitle,.about-lead,.about-text p,.highlight-item,.about-link,.about-card-3d,.skill-card-3d,.project-card,.cert-card,.strength-item,.contact-card,.contact-form,.stat,.edu-item'
  );
  els.forEach(el => el.classList.add('reveal'));
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  els.forEach(el => obs.observe(el));
})();


/* ---- 9. 3D TILT CARD ---- */
(function initTilt() {
  const card = document.getElementById('about-card');
  if (!card) return;
  const inner = card.querySelector('.card-inner');
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    inner.style.transform = `rotateX(${((e.clientY-r.top-r.height/2)/(r.height/2))*-10}deg) rotateY(${((e.clientX-r.left-r.width/2)/(r.width/2))*10}deg)`;
  });
  card.addEventListener('mouseleave', () => inner.style.transform = 'rotateX(0) rotateY(0)');
})();


/* ---- 10. CONTACT FORM ---- */
function handleSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('submit-btn');
  const success = document.getElementById('form-success');
  btn.disabled = true;
  btn.querySelector('span').textContent = 'Sending…';
  setTimeout(() => {
    btn.querySelector('span').textContent = 'Send Message';
    btn.disabled = false;
    success.style.display = 'block';
    document.getElementById('contact-form').reset();
    setTimeout(() => success.style.display = 'none', 5000);
  }, 1500);
}


/* ---- 11. MODAL SYSTEM ---- */
function openModal(content) {
  document.getElementById('modal-content').innerHTML = content;
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

function openGestureDetails() {
  openModal(`
    <h2>🖐️ Face Gesture-Based Virtual Mouse</h2>
    <p>An AI system enabling hands-free computer control using real-time webcam facial landmark & hand gesture detection.</p>
    <ul>
      <li>468-point MediaPipe facial landmark detection</li>
      <li>Nose-tip coordinates mapped to screen cursor via OpenCV</li>
      <li>Blink detection → left-click; mouth open → scroll</li>
      <li>&lt;30ms end-to-end latency in the detection pipeline</li>
      <li>MySQL logging for session data and accuracy metrics</li>
      <li>Optimized for varied lighting & face orientations</li>
    </ul>
    <div class="modal-stack">
      <span class="modal-tag">Python</span><span class="modal-tag">OpenCV</span>
      <span class="modal-tag">MediaPipe</span><span class="modal-tag">PyAutoGUI</span>
      <span class="modal-tag">NumPy</span><span class="modal-tag">MySQL</span>
    </div>
  `);
}

function openDiseaseDetails() {
  openModal(`
    <h2>🏥 AI Multi-Disease Prediction System</h2>
    <p>A full-stack healthcare prediction platform for early detection of Diabetes, Heart Disease, and Kidney Disease using ML models.</p>
    <ul>
      <li>Random Forest + SVM + Logistic Regression ensemble</li>
      <li>Data preprocessing: missing value imputation, normalization, feature selection</li>
      <li>Flask REST API with MySQL patient data backend</li>
      <li>3 disease modules: Diabetes (PIMA dataset), Heart (Cleveland), Kidney (UCI)</li>
      <li>Responsive dashboard with prediction history and confidence scores</li>
      <li>Validated for accuracy, efficiency, and scalability</li>
    </ul>
    <div class="modal-stack">
      <span class="modal-tag">Python</span><span class="modal-tag">Flask</span>
      <span class="modal-tag">Scikit-learn</span><span class="modal-tag">MySQL</span>
      <span class="modal-tag">Pandas</span><span class="modal-tag">NumPy</span>
    </div>
  `);
}


/* ---- 12. HERO PARALLAX ---- */
window.addEventListener('scroll', () => {
  const hero = document.getElementById('hero');
  if (hero && window.scrollY < window.innerHeight)
    hero.style.transform = `translateY(${window.scrollY * 0.3}px)`;
});


/* ---- 13. CURSOR GLOW FOLLOW ---- */
(function initCursorGlow() {
  const glow = document.createElement('div');
  glow.style.cssText = `position:fixed;pointer-events:none;z-index:9998;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(168,85,247,.04) 0%,transparent 70%);transform:translate(-50%,-50%);transition:left .12s ease,top .12s ease;will-change:left,top;`;
  document.body.appendChild(glow);
  window.addEventListener('mousemove', e => { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; });
})();
