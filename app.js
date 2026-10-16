(() => {
  "use strict";
  const $ = (selector) => document.querySelector(selector);
  const canvas = $("#simulation");
  const ctx = canvas.getContext("2d");
  const controlsRoot = $("#controls");
  const state = { lab: "particles", running: true, energy: 64, count: 48, attraction: 35, frequency: 3, amplitude: 52, damping: 22, gravity: 55, speed: 45, mass: 60, time: 0, frame: 0, particles: [], width: 0, height: 0, dpr: 1 };
  const labs = {
    particles: { code: "EXPERIMENTO / 001", title: "Campo de partículas", description: "Observa cómo cambia el movimiento al ajustar la energía del sistema.", label: "PARTICLE FIELD", hint: "CAMPO DINÁMICO", metrics: [["PARTÍCULAS", "count", "elementos"], ["ENERGÍA", "energy", "nivel relativo"], ["ESTADO", "status", "simulación local"]], controls: [
      { key: "count", label: "Cantidad de partículas", min: 12, max: 100, step: 1, value: 48, unit: "" },
      { key: "energy", label: "Energía del sistema", min: 10, max: 100, step: 1, value: 64, unit: "%" },
      { key: "attraction", label: "Fuerza de atracción", min: 0, max: 100, step: 1, value: 35, unit: "%" }
    ]},
    waves: { code: "EXPERIMENTO / 002", title: "Laboratorio de ondas", description: "Modifica la frecuencia y amplitud para explorar cómo se propaga una onda.", label: "WAVE OSCILLATOR", hint: "PROPAGACIÓN DE ONDA", metrics: [["FRECUENCIA", "frequency", "oscilaciones relativas"], ["AMPLITUD", "amplitude", "altura relativa"], ["LONGITUD", "wavelength", "unidades visuales"]], controls: [
      { key: "frequency", label: "Frecuencia", min: 1, max: 8, step: 0.5, value: 3, unit: " Hz" },
      { key: "amplitude", label: "Amplitud", min: 10, max: 100, step: 1, value: 52, unit: "%" },
      { key: "damping", label: "Atenuación", min: 0, max: 80, step: 1, value: 22, unit: "%" }
    ]},
    orbit: { code: "EXPERIMENTO / 003", title: "Mecánica orbital", description: "Ajusta la gravedad, la velocidad y la masa para cambiar la trayectoria orbital.", label: "ORBITAL MECHANICS", hint: "CAMPO GRAVITACIONAL", metrics: [["GRAVEDAD", "gravity", "nivel relativo"], ["VELOCIDAD", "speed", "velocidad inicial"], ["MASA CENTRAL", "mass", "masa relativa"]], controls: [
      { key: "gravity", label: "Gravedad", min: 10, max: 100, step: 1, value: 55, unit: "%" },
      { key: "speed", label: "Velocidad orbital", min: 10, max: 100, step: 1, value: 45, unit: "%" },
      { key: "mass", label: "Masa central", min: 10, max: 100, step: 1, value: 60, unit: "%" }
    ]}
  };
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const random = (min, max) => min + Math.random() * (max - min);
  function resize() {
    const rect = canvas.getBoundingClientRect();
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.width = Math.max(1, rect.width); state.height = Math.max(1, rect.height);
    canvas.width = Math.round(state.width * state.dpr); canvas.height = Math.round(state.height * state.dpr);
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    if (!state.particles.length) seedParticles();
    draw();
  }
  function seedParticles() {
    state.particles = Array.from({ length: state.count }, () => ({ x: random(0, state.width), y: random(0, state.height), vx: random(-.5, .5), vy: random(-.5, .5), radius: random(1.2, 2.7), phase: random(0, Math.PI * 2) }));
  }
  function renderControls() {
    const config = labs[state.lab];
    controlsRoot.innerHTML = config.controls.map(c => `<div class="control"><div class="control-top"><label for="range-${c.key}">${c.label}</label><output id="out-${c.key}" for="range-${c.key}">${state[c.key]}${c.unit}</output></div><input id="range-${c.key}" data-key="${c.key}" type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${state[c.key]}" aria-label="${c.label}"><div class="range-ends"><span>${c.min}${c.unit}</span><span>${c.max}${c.unit}</span></div></div>`).join("");
    controlsRoot.querySelectorAll('input[type="range"]').forEach(input => input.addEventListener("input", () => {
      const key = input.dataset.key; state[key] = Number(input.value);
      const cfg = config.controls.find(c => c.key === key);
      $("#out-" + key).textContent = state[key] + cfg.unit;
      if (key === "count") { state.particles = []; seedParticles(); }
      updateMetrics(); draw();
    }));
  }
  function formatMetric(key) {
    if (key === "status") return state.running ? "Activo" : "Pausado";
    if (key === "wavelength") return (Math.round((state.width / (state.frequency * 2.5)) * 10) / 10).toString();
    return String(state[key] ?? "—");
  }
  function updateMetrics() {
    const metrics = labs[state.lab].metrics;
    metrics.forEach((m, i) => {
      $("#metricLabel" + (i + 1)).textContent = m[0];
      $("#metricValue" + (i + 1)).textContent = formatMetric(m[1]);
      $("#metricUnit" + (i + 1)).textContent = m[2];
      if (m[1] === "energy" || m[1] === "amplitude" || m[1] === "gravity" || m[1] === "mass") $("#metricValue" + (i + 1)).innerHTML = `${formatMetric(m[1])}<span class="metric-unit">%</span>`;
    });
  }
  function switchLab(lab) {
    if (!labs[lab]) return;
    state.lab = lab;
    document.querySelectorAll(".lab-nav").forEach(button => button.classList.toggle("active", button.dataset.lab === lab));
    const config = labs[lab];
    $("#experimentCode").textContent = config.code; $("#experimentTitle").textContent = config.title;
    $("#experimentDescription").textContent = config.description; $("#visualLabel").textContent = config.label;
    $("#canvasHint").textContent = config.hint;
    state.particles = []; seedParticles(); renderControls(); updateMetrics(); draw();
  }
  function background() {
    ctx.clearRect(0, 0, state.width, state.height);
    ctx.fillStyle = "#090d17"; ctx.fillRect(0, 0, state.width, state.height);
    ctx.strokeStyle = "rgba(131,145,185,.075)"; ctx.lineWidth = 1;
    const spacing = 28;
    for (let x = 0; x < state.width; x += spacing) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, state.height); ctx.stroke(); }
    for (let y = 0; y < state.height; y += spacing) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(state.width, y); ctx.stroke(); }
  }
  function drawParticles() {
    const cx = state.width / 2, cy = state.height / 2;
    const energy = state.energy / 100, force = state.attraction / 100;
    state.particles.length = state.count;
    state.particles.forEach((p, i) => {
      if (state.running) {
        const dx = cx - p.x, dy = cy - p.y, dist = Math.sqrt(dx * dx + dy * dy) + 1;
        p.vx += (dx / dist) * force * .025 + random(-.012, .012) * energy;
        p.vy += (dy / dist) * force * .025 + random(-.012, .012) * energy;
        p.vx *= .992; p.vy *= .992;
        p.x += p.vx * (0.5 + energy * 2); p.y += p.vy * (0.5 + energy * 2);
        if (p.x < 0 || p.x > state.width) p.vx *= -1;
        if (p.y < 0 || p.y > state.height) p.vy *= -1;
        p.x = clamp(p.x, 0, state.width); p.y = clamp(p.y, 0, state.height);
      }
      for (let j = i + 1; j < state.particles.length; j++) {
        const q = state.particles[j], dx = p.x - q.x, dy = p.y - q.y, d = Math.hypot(dx, dy);
        if (d < 90) { ctx.strokeStyle = `rgba(156,140,255,${(1 - d / 90) * .18})`; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
      }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.radius + energy, 0, Math.PI * 2);
      ctx.fillStyle = i % 5 === 0 ? "#6fe2cf" : "#a99aff"; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 8; ctx.fill(); ctx.shadowBlur = 0;
    });
    ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fillStyle = "#f3f0ff"; ctx.fill();
  }
  function drawWaves() {
    const mid = state.height / 2, amp = state.amplitude * .95, cycles = state.frequency * 1.1;
    for (let layer = 0; layer < 3; layer++) {
      ctx.beginPath();
      for (let x = 0; x <= state.width; x += 2) {
        const attenuation = 1 - state.damping / 100 * (x / state.width);
        const y = mid + Math.sin((x / state.width) * Math.PI * 2 * cycles - state.time * (1.2 + layer * .24) + layer * .7) * amp * attenuation * (layer === 0 ? 1 : .55);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = layer === 0 ? "#a99aff" : layer === 1 ? "#6fe2cf" : "#7888d8";
      ctx.lineWidth = layer === 0 ? 2.2 : 1.2; ctx.globalAlpha = layer === 0 ? .95 : .5; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = layer === 0 ? 12 : 0; ctx.stroke(); ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    }
    ctx.strokeStyle = "#ffffff19"; ctx.setLineDash([3, 6]); ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(state.width, mid); ctx.stroke(); ctx.setLineDash([]);
  }
  function drawOrbit() {
    const cx = state.width / 2, cy = state.height / 2, radius = Math.min(state.width, state.height) * (.18 + state.speed / 100 * .18);
    const gravity = state.gravity / 100, mass = state.mass / 100;
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.strokeStyle = "#a99aff66"; ctx.setLineDash([4, 6]); ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(cx, cy, radius * 1.38, 0, Math.PI * 2); ctx.strokeStyle = "#ffffff12"; ctx.stroke();
    const angle = state.time * (.6 + gravity * 1.8) * (1.1 - state.speed / 180);
    const x = cx + Math.cos(angle) * radius, y = cy + Math.sin(angle) * radius * (.55 + state.speed / 220);
    const glow = ctx.createRadialGradient(cx, cy, 1, cx, cy, 65 + mass * 20);
    glow.addColorStop(0, "#a99aff55"); glow.addColorStop(1, "#a99aff00"); ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, 85, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, 12 + mass * 8, 0, Math.PI * 2); ctx.fillStyle = "#a99aff"; ctx.shadowColor = "#a99aff"; ctx.shadowBlur = 24; ctx.fill(); ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fillStyle = "#6fe2cf"; ctx.shadowColor = "#6fe2cf"; ctx.shadowBlur = 15; ctx.fill(); ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.strokeStyle = "#6fe2cf35"; ctx.stroke();
  }
  function draw() {
    if (!ctx || !state.width || !state.height) return;
    background();
    if (state.lab === "particles") drawParticles();
    else if (state.lab === "waves") drawWaves();
    else drawOrbit();
    $("#frameCounter").textContent = "SIM · " + String(state.frame).padStart(4, "0");
    updateMetrics();
  }
  function tick() {
    if (state.running) { state.time += .016; state.frame++; draw(); }
    requestAnimationFrame(tick);
  }
  document.querySelectorAll(".lab-nav").forEach(button => button.addEventListener("click", () => switchLab(button.dataset.lab)));
  $("#playButton").addEventListener("click", () => {
    state.running = !state.running;
    $("#playIcon").textContent = state.running ? "Ⅱ" : "▶";
    $("#playText").textContent = state.running ? "Pausar simulación" : "Continuar simulación";
    updateMetrics();
  });
  $("#resetButton").addEventListener("click", () => {
    const config = labs[state.lab];
    config.controls.forEach(c => { state[c.key] = c.value; });
    state.time = 0; state.frame = 0; state.particles = []; seedParticles(); renderControls(); updateMetrics(); draw();
  });
  $("#themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("light");
    const isLight = document.body.classList.contains("light");
    $("#themeToggle").textContent = isLight ? "☾" : "☼";
    $("#themeToggle").setAttribute("aria-label", isLight ? "Cambiar a tema oscuro" : "Cambiar a tema claro");
  });
  window.addEventListener("resize", resize);
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas.parentElement);
  switchLab("particles"); resize(); tick();
})();