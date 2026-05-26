window.addEventListener("DOMContentLoaded", () => {
  const PI = Math.PI;
  const TWO_PI = 2 * Math.PI;

  const MAX_K = 14;
  const COEFF_SAMPLE_COUNT = 4096;
  const WAVE_SAMPLE_COUNT = 900;
  const TRACE_HISTORY_MAX = 900;

  const COLOR_AXIS = "#555";
  const COLOR_GRID = "rgba(255,255,255,0.06)";
  const COLOR_TEXT = "#aaa";
  const COLOR_CIRCLE = "rgba(255,255,255,0.22)";
  const COLOR_CIRCLE_ACTIVE = "#ffa726";
  const COLOR_VECTOR = "#42a5f5";
  const COLOR_VECTOR_ACTIVE = "#ffa726";
  const COLOR_ENDPOINT = "#ef5350";
  const COLOR_TARGET = "rgba(220,220,220,0.72)";
  const COLOR_RECON = "#42a5f5";

  const widget = document.querySelector(".epicycle-widget");
  const grid = document.querySelector(".visualization-grid");

  const functionSelect = document.getElementById("function-select");
  const circleSlider = document.getElementById("circle-slider");
  const speedSlider = document.getElementById("speed-slider");
  const circleCountDisplay = document.getElementById("circle-count-display");
  const speedDisplay = document.getElementById("speed-display");
  const playButton = document.getElementById("play-button");
  const resetButton = document.getElementById("reset-button");
  const formulaDisplay = document.getElementById("formula-display");
  const tooltip = document.getElementById("circle-tooltip");

  const epicycleCanvas = document.getElementById("epicycle-canvas");
  const waveCanvas = document.getElementById("wave-canvas");

  const epicycleCtx = epicycleCanvas.getContext("2d");
  const waveCtx = waveCanvas.getContext("2d");

  const coeffCache = new Map();

  let functionType = functionSelect.value;
  let harmonicPairs = Number(circleSlider.value);
  let speed = Number(speedSlider.value);
  let isPlaying = true;
  let time = -PI;
  let lastTimestamp = null;
  let resizeRaf = null;
  let hoveredK = null;
  let currentCircleData = [];
  let traceHistory = [];

  const dims = {
    epi: { w: 0, h: 0, cx: 0, cy: 0, scale: 1 },
    wave: { w: 0, h: 0 }
  };

  const coeffSampleXs = linspace(-PI, PI, COEFF_SAMPLE_COUNT, false);
  const waveXs = linspace(-PI, PI, WAVE_SAMPLE_COUNT, true);

  function linspace(start, end, count, includeEndpoint) {
    const values = [];
    const denom = includeEndpoint ? count - 1 : count;
    const step = (end - start) / denom;

    for (let i = 0; i < count; i++) {
      values.push(start + i * step);
    }

    return values;
  }

  function wrapToPi(x) {
    return ((x + PI) % TWO_PI + TWO_PI) % TWO_PI - PI;
  }

  function getFunctionValue(type, x) {
    const w = wrapToPi(x);

    if (type === "complex") {
      return (
        0.25 +
        0.55 * Math.cos(x) +
        0.35 * Math.sin(x) -
        0.25 * Math.cos(2 * x) +
        0.30 * Math.sin(2 * x) +
        0.22 * Math.cos(3 * x) -
        0.18 * Math.sin(3 * x) +
        0.16 * Math.sin(4 * x) -
        0.14 * Math.cos(5 * x) +
        0.10 * Math.cos(6 * x) +
        0.09 * Math.sin(6 * x) -
        0.08 * Math.sin(7 * x) +
        0.07 * Math.cos(8 * x)
      );
    }

    if (type === "square") {
      const s = Math.sin(x);
      if (Math.abs(s) < 1e-12) return 0;
      return s > 0 ? 1 : -1;
    }

    if (type === "sawtooth") {
      return w / PI;
    }

    if (type === "triangle") {
      return 1 - (2 * Math.abs(w)) / PI;
    }

    if (type === "pulse") {
      return Math.abs(w) < 0.55 ? 1 : 0;
    }

    return 0;
  }

  function getFunctionName(type) {
    if (type === "complex") return "Complex mixed wave";
    if (type === "square") return "Square wave";
    if (type === "sawtooth") return "Sawtooth wave";
    if (type === "triangle") return "Triangle wave";
    if (type === "pulse") return "Narrow pulse";
    return "Function";
  }

  function computeCoefficients(type) {
    if (coeffCache.has(type)) {
      return coeffCache.get(type);
    }

    const coeffs = new Map();
    const dt = TWO_PI / COEFF_SAMPLE_COUNT;

    for (let k = -MAX_K; k <= MAX_K; k++) {
      let real = 0;
      let imag = 0;

      for (const t of coeffSampleXs) {
        const f = getFunctionValue(type, t);
        const angle = -k * t;

        real += f * Math.cos(angle) * dt;
        imag += f * Math.sin(angle) * dt;
      }

      real /= TWO_PI;
      imag /= TWO_PI;

      coeffs.set(k, {
        k,
        real,
        imag,
        mag: Math.sqrt(real * real + imag * imag),
        phase: Math.atan2(imag, real)
      });
    }

    coeffCache.set(type, coeffs);
    return coeffs;
  }

  function getFrequencyOrder(K) {
    const order = [0];

    for (let n = 1; n <= K; n++) {
      order.push(n);
      order.push(-n);
    }

    return order;
  }

  function complexTerm(coeff, t) {
    const angle = coeff.k * t;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    return {
      real: coeff.real * cosA - coeff.imag * sinA,
      imag: coeff.real * sinA + coeff.imag * cosA
    };
  }

  function reconstructAt(t, coeffs, K) {
    let y = 0;

    for (let k = -K; k <= K; k++) {
      const c = coeffs.get(k);
      if (!c) continue;

      const term = complexTerm(c, t);
      y += term.real;
    }

    return y;
  }

  function resizeCanvas(canvas, ctx) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const cssWidth = Math.max(1, rect.width);
    const cssHeight = Math.max(1, rect.height);

    const pixelWidth = Math.round(cssWidth * dpr);
    const pixelHeight = Math.round(cssHeight * dpr);

    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    return { w: cssWidth, h: cssHeight };
  }

  function updateDimensions() {
    const epi = resizeCanvas(epicycleCanvas, epicycleCtx);
    const wave = resizeCanvas(waveCanvas, waveCtx);

    dims.epi.w = epi.w;
    dims.epi.h = epi.h;
    dims.epi.cx = epi.w / 2;
    dims.epi.cy = epi.h / 2;

    dims.wave.w = wave.w;
    dims.wave.h = wave.h;

    updateScale();
  }

  function updateScale() {
    const coeffs = computeCoefficients(functionType);
    const order = getFrequencyOrder(harmonicPairs);

    let totalMagnitude = 0;

    for (const k of order) {
      const c = coeffs.get(k);
      if (c) totalMagnitude += c.mag;
    }

    const available = Math.min(dims.epi.w, dims.epi.h) * 0.42;
    dims.epi.scale = available / Math.max(totalMagnitude, 0.75);
  }

  function scheduleResize() {
    if (resizeRaf !== null) {
      cancelAnimationFrame(resizeRaf);
    }

    resizeRaf = requestAnimationFrame(() => {
      updateDimensions();
      notifyParentHeight();
      resizeRaf = null;
    });
  }

  function drawLine(ctx, x1, y1, x2, y2, color, width = 1, dash = []) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  function drawText(ctx, text, x, y, color = COLOR_TEXT, size = 12, align = "left") {
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = `${size}px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function drawGrid(ctx, w, h, cx, cy) {
    ctx.clearRect(0, 0, w, h);

    for (let x = 0; x <= w; x += 48) {
      drawLine(ctx, x, 0, x, h, COLOR_GRID, 1);
    }

    for (let y = 0; y <= h; y += 48) {
      drawLine(ctx, 0, y, w, y, COLOR_GRID, 1);
    }

    drawLine(ctx, 0, cy, w, cy, COLOR_AXIS, 1.2);
    drawLine(ctx, cx, 0, cx, h, COLOR_AXIS, 1.2);
  }

  function drawEpicycles() {
    const { w, h, cx, cy, scale } = dims.epi;

    drawGrid(epicycleCtx, w, h, cx, cy);

    const coeffs = computeCoefficients(functionType);
    const order = getFrequencyOrder(harmonicPairs);

    let currentX = cx;
    let currentY = cy;

    currentCircleData = [];

    for (const k of order) {
      const c = coeffs.get(k);
      if (!c) continue;

      const term = complexTerm(c, time);
      const radius = c.mag * scale;
      const nextX = currentX + term.real * scale;
      const nextY = currentY - term.imag * scale;

      const isHovered = hoveredK === k;

      if (radius > 0.5) {
        epicycleCtx.save();
        epicycleCtx.strokeStyle = isHovered ? COLOR_CIRCLE_ACTIVE : COLOR_CIRCLE;
        epicycleCtx.lineWidth = isHovered ? 3 : 1.2;
        epicycleCtx.beginPath();
        epicycleCtx.arc(currentX, currentY, radius, 0, TWO_PI);
        epicycleCtx.stroke();
        epicycleCtx.restore();
      }

      drawLine(
        epicycleCtx,
        currentX,
        currentY,
        nextX,
        nextY,
        isHovered ? COLOR_VECTOR_ACTIVE : COLOR_VECTOR,
        isHovered ? 3 : 2
      );

      epicycleCtx.save();
      epicycleCtx.fillStyle = isHovered ? COLOR_CIRCLE_ACTIVE : COLOR_VECTOR;
      epicycleCtx.beginPath();
      epicycleCtx.arc(nextX, nextY, isHovered ? 5.5 : 3.8, 0, TWO_PI);
      epicycleCtx.fill();
      epicycleCtx.restore();

      currentCircleData.push({
        k,
        cx: currentX,
        cy: currentY,
        radius,
        coeff: c,
        endpointX: nextX,
        endpointY: nextY
      });

      currentX = nextX;
      currentY = nextY;
    }

    epicycleCtx.save();
    epicycleCtx.fillStyle = COLOR_ENDPOINT;
    epicycleCtx.beginPath();
    epicycleCtx.arc(currentX, currentY, 6, 0, TWO_PI);
    epicycleCtx.fill();
    epicycleCtx.restore();

    drawLine(epicycleCtx, currentX, currentY, currentX, cy, COLOR_ENDPOINT, 1.5, [5, 5]);

    drawText(epicycleCtx, "Re", w - 28, cy - 14, COLOR_TEXT, 12, "center");
    drawText(epicycleCtx, "Im", cx + 12, 18, COLOR_TEXT, 12, "left");

    const approxValue = (currentX - cx) / scale;
    drawText(epicycleCtx, `f_K(t) ≈ ${formatNumber(approxValue)}`, cx, h - 18, COLOR_ENDPOINT, 12, "center");
  }

  function getWaveYRange(coeffs) {
    const target = waveXs.map((x) => getFunctionValue(functionType, x));
    const recon = waveXs.map((x) => reconstructAt(x, coeffs, harmonicPairs));

    const values = [...target, ...recon];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = Math.max(0.3, (max - min) * 0.15);

    return {
      min: min - pad,
      max: max + pad,
      target,
      recon
    };
  }

  function mapWaveX(x) {
    return ((x + PI) / TWO_PI) * dims.wave.w;
  }

  function mapWaveY(y, yMin, yMax) {
    return dims.wave.h - ((y - yMin) / (yMax - yMin)) * dims.wave.h;
  }

  function drawWavePlot() {
    const { w, h } = dims.wave;

    waveCtx.clearRect(0, 0, w, h);

    const coeffs = computeCoefficients(functionType);
    const range = getWaveYRange(coeffs);
    const midY = mapWaveY(0, range.min, range.max);

    for (let x = 0; x <= w; x += 48) {
      drawLine(waveCtx, x, 0, x, h, COLOR_GRID, 1);
    }

    for (let y = 0; y <= h; y += 48) {
      drawLine(waveCtx, 0, y, w, y, COLOR_GRID, 1);
    }

    drawLine(waveCtx, 0, midY, w, midY, COLOR_AXIS, 1.2);

    drawCurve(waveCtx, waveXs, range.target, range.min, range.max, COLOR_TARGET, 2, [7, 6]);
    drawCurve(waveCtx, waveXs, range.recon, range.min, range.max, COLOR_RECON, 3, []);

    const currentT = wrapToPi(time);
    const currentY = reconstructAt(currentT, coeffs, harmonicPairs);
    const px = mapWaveX(currentT);
    const py = mapWaveY(currentY, range.min, range.max);

    drawLine(waveCtx, px, 0, px, h, COLOR_ENDPOINT, 1.3, [5, 5]);

    waveCtx.save();
    waveCtx.fillStyle = COLOR_ENDPOINT;
    waveCtx.beginPath();
    waveCtx.arc(px, py, 5.5, 0, TWO_PI);
    waveCtx.fill();
    waveCtx.restore();

    drawText(waveCtx, "target", 14, 20, "#cccccc", 12, "left");
    drawText(waveCtx, "reconstruction", 14, 40, COLOR_RECON, 12, "left");
    drawText(waveCtx, `t = ${formatNumber(currentT)}`, w - 14, h - 18, COLOR_TEXT, 12, "right");
  }

  function drawCurve(ctx, xs, ys, yMin, yMax, color, width, dash) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(dash);
    ctx.beginPath();

    for (let i = 0; i < xs.length; i++) {
      const x = mapWaveX(xs[i]);
      const y = mapWaveY(ys[i], yMin, yMax);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
    ctx.restore();
  }

  function updateFormula() {
    const circleCount = 2 * harmonicPairs + 1;
    const latex = `f_{${harmonicPairs}}(t)=\\sum_{k=-${harmonicPairs}}^{${harmonicPairs}}c_k e^{ikt}\\qquad \\text{using }${circleCount}\\text{ circles}`;

    if (window.katex) {
      katex.render(latex, formulaDisplay, {
        throwOnError: false,
        displayMode: true
      });
    } else {
      formulaDisplay.textContent = latex;
    }
  }

  function formatNumber(value) {
    if (Math.abs(value) < 1e-10) return "0";
    return Number(value.toFixed(3)).toString();
  }

  function formatComplex(c) {
    const re = formatNumber(c.real);
    const imAbs = formatNumber(Math.abs(c.imag));
    const sign = c.imag < 0 ? "-" : "+";
    return `${re} ${sign} ${imAbs}i`;
  }

  function updateTooltip(mouseX, mouseY) {
    if (hoveredK === null) {
      tooltip.classList.add("hidden");
      return;
    }

    const circle = currentCircleData.find((item) => item.k === hoveredK);

    if (!circle) {
      tooltip.classList.add("hidden");
      return;
    }

    const c = circle.coeff;
    tooltip.innerHTML =
      `<strong>Coefficient c<sub>${hoveredK}</sub></strong><br>` +
      `c<sub>${hoveredK}</sub> ≈ ${formatComplex(c)}<br>` +
      `|c<sub>${hoveredK}</sub>| ≈ ${formatNumber(c.mag)}<br>` +
      `arg(c<sub>${hoveredK}</sub>) ≈ ${formatNumber(c.phase)} rad<br>` +
      `term: c<sub>${hoveredK}</sub>e<sup>i${hoveredK}t</sup>`;

    const parentRect = epicycleCanvas.getBoundingClientRect();
    const wrapRect = epicycleCanvas.parentElement.getBoundingClientRect();

    tooltip.style.left = `${mouseX + parentRect.left - wrapRect.left + 12}px`;
    tooltip.style.top = `${mouseY + parentRect.top - wrapRect.top + 12}px`;
    tooltip.classList.remove("hidden");
  }

  function handleHover(event) {
    const rect = epicycleCanvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    let best = null;
    let bestScore = Infinity;

    for (const circle of currentCircleData) {
      if (circle.radius < 4) continue;

      const dx = mouseX - circle.cx;
      const dy = mouseY - circle.cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const score = Math.abs(dist - circle.radius);

      if (score < bestScore && score < 10) {
        best = circle;
        bestScore = score;
      }
    }

    hoveredK = best ? best.k : null;
    updateTooltip(mouseX, mouseY);
  }

  function notifyParentHeight() {
    const height = Math.ceil(document.documentElement.scrollHeight);

    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: "fourier-widget-resize",
          id: "epicycle-visualization",
          height
        },
        "*"
      );
    }
  }

  function renderFrame(timestamp) {
    if (lastTimestamp === null) {
      lastTimestamp = timestamp;
    }

    const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
    lastTimestamp = timestamp;

    if (isPlaying) {
      time += dt * speed;
      if (time > PI) {
        time -= TWO_PI;
        traceHistory = [];
      }
    }

    drawEpicycles();
    drawWavePlot();

    requestAnimationFrame(renderFrame);
  }

  function resetAnimation() {
    time = -PI;
    traceHistory = [];
    lastTimestamp = null;
  }

  function handleFunctionChange() {
    functionType = functionSelect.value;
    resetAnimation();
    updateScale();
    updateFormula();
    notifyParentHeight();
  }

  function handleCircleChange() {
    harmonicPairs = Number(circleSlider.value);
    const circleCount = 2 * harmonicPairs + 1;
    circleCountDisplay.textContent = `K = ${harmonicPairs}, circles = ${circleCount}`;
    updateScale();
    updateFormula();
  }

  function handleSpeedChange() {
    speed = Number(speedSlider.value);
    speedDisplay.textContent = `${speed.toFixed(1)}×`;
  }

  function togglePlay() {
    isPlaying = !isPlaying;
    playButton.textContent = isPlaying ? "Pause" : "Play";
  }

  function initEvents() {
    functionSelect.addEventListener("change", handleFunctionChange);
    circleSlider.addEventListener("input", handleCircleChange);
    speedSlider.addEventListener("input", handleSpeedChange);
    playButton.addEventListener("click", togglePlay);
    resetButton.addEventListener("click", resetAnimation);

    epicycleCanvas.addEventListener("mousemove", handleHover);

    epicycleCanvas.addEventListener("mouseleave", () => {
      hoveredK = null;
      tooltip.classList.add("hidden");
    });

    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        scheduleResize();
        notifyParentHeight();
      });

      [widget, grid, epicycleCanvas, waveCanvas].forEach((el) => {
        if (el) resizeObserver.observe(el);
      });
    }

    window.addEventListener("resize", () => {
      scheduleResize();
      notifyParentHeight();
    });
  }

  initEvents();
  updateDimensions();
  handleCircleChange();
  handleSpeedChange();
  updateFormula();
  notifyParentHeight();

  requestAnimationFrame(renderFrame);
});
