window.addEventListener("DOMContentLoaded", () => {
  // --- State ---
  let t = 0;
  let isPlaying = true;
  let freq = 1.0;
  let mode = 'euler';
  let history = []; // Stores {t, x, y}
  
  // Dimensions (calculated dynamically)
  let dims = {
    circle: { w: 0, h: 0, cx: 0, cy: 0, r: 0 },
    sine:   { w: 0, h: 0 },
    cosine: { w: 0, h: 0 }
  };

  // Color Palette
  const COLOR_AXIS = "#444";
  const COLOR_TEXT = "#aaa";
  const COLOR_VEC1 = "#42a5f5"; 
  const COLOR_VEC2 = "#ffa726"; 
  const COLOR_SINE = "#66bb6a"; 
  const COLOR_COSINE = "#42a5f5"; 
  const COLOR_RESULT = "#ef5350"; 

  // --- DOM Elements ---
  const btnPlay = document.getElementById('btn-play');
  const selectMode = document.getElementById('mode-select');
  const sliderFreq = document.getElementById('freq-slider');
  const displayFreq = document.getElementById('freq-display');
  const displayEq = document.getElementById('equation-display');

  const canvasCircle = document.getElementById('canvas-circle');
  const canvasSine = document.getElementById('canvas-sine');
  const canvasCosine = document.getElementById('canvas-cosine');
  const ctxCircle = canvasCircle.getContext('2d');
  const ctxSine = canvasSine.getContext('2d');
  const ctxCosine = canvasCosine.getContext('2d');

  // --- Resize Handling (Responsiveness) ---
  function resizeCanvas(canvas, ctx) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    // Set actual internal resolution to match screen pixels (prevents blur)
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    // Normalize coordinate system back to CSS pixels
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    return { w: rect.width, h: rect.height };
  }

  function updateDimensions() {
    const cDims = resizeCanvas(canvasCircle, ctxCircle);
    dims.circle.w = cDims.w;
    dims.circle.h = cDims.h;
    dims.circle.cx = cDims.w / 2;
    dims.circle.cy = cDims.h / 2;
    // Radius leaves a little padding from the edges
    dims.circle.r = Math.min(dims.circle.cx, dims.circle.cy) * 0.8;

    dims.sine = resizeCanvas(canvasSine, ctxSine);
    dims.cosine = resizeCanvas(canvasCosine, ctxCosine);
  }

  // Observe container size changes
  const resizeObserver = new ResizeObserver(() => {
    updateDimensions();
  });
  resizeObserver.observe(document.querySelector('.visualization-grid'));

  // --- Event Listeners ---
  btnPlay.addEventListener('click', () => {
    isPlaying = !isPlaying;
    btnPlay.innerText = isPlaying ? "Pause" : "Play";
  });

  sliderFreq.addEventListener('input', (e) => {
    freq = parseFloat(e.target.value);
    displayFreq.innerText = freq.toFixed(1);
    updateEquation();
  });

  selectMode.addEventListener('change', (e) => {
    mode = e.target.value;
    history = []; 
    updateEquation();
  });

  // --- Equation Rendering ---
  function updateEquation() {
    let latex = "";
    const w = freq === 1.0 ? "" : freq.toFixed(1);
    
    if (mode === 'euler') {
      latex = `e^{i ${w} t} = \\cos(${w} t) + i\\sin(${w} t)`;
    } else if (mode === 'cosine') {
      latex = `\\cos(${w} t) = \\frac{e^{i ${w} t} + e^{-i ${w} t}}{2}`;
    } else if (mode === 'sine') {
      latex = `\\sin(${w} t) = \\frac{e^{i ${w} t} - e^{-i ${w} t}}{2i}`;
    }
    
    if (window.katex) {
      katex.render(latex, displayEq, { throwOnError: false, displayMode: true });
    } else {
      displayEq.innerText = latex;
    }
  }

  // --- Canvas Helpers ---
  function toCanvas(mathX, mathY, centerX, centerY) {
    return { x: centerX + mathX, y: centerY - mathY }; 
  }

  function drawGrid(ctx, width, height, centerX, centerY, labelX, labelY) {
    ctx.clearRect(0, 0, width, height);
    
    ctx.beginPath();
    ctx.strokeStyle = COLOR_AXIS;
    ctx.lineWidth = 1;
    ctx.moveTo(0, centerY); ctx.lineTo(width, centerY); // X-axis
    ctx.moveTo(centerX, 0); ctx.lineTo(centerX, height); // Y-axis
    ctx.stroke();
    
    ctx.fillStyle = COLOR_TEXT;
    ctx.font = "13px -apple-system, sans-serif";
    if (labelX) ctx.fillText(labelX, width - 40, centerY - 8);
    if (labelY) ctx.fillText(labelY, centerX + 8, 20);
  }

  function drawVector(ctx, startX, startY, endX, endY, color) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(endX, endY, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- Main Animation Loop ---
  function render() {
    if (dims.circle.w === 0) return requestAnimationFrame(render); // Wait for resize to fire

    if (isPlaying) t += 0.02 * freq;

    const R = dims.circle.r;
    const CX = dims.circle.cx;
    const CY = dims.circle.cy;

    let v1 = {x: 0, y: 0}, v2 = {x: 0, y: 0}, result = {x: 0, y: 0};

    // Calculate Math Coordinates
    if (mode === 'euler') {
      v1 = { x: R * Math.cos(t), y: R * Math.sin(t) };
      result = v1;
    } else if (mode === 'cosine') {
      v1 = { x: (R/2) * Math.cos(t), y: (R/2) * Math.sin(t) };
      v2 = { x: (R/2) * Math.cos(-t), y: (R/2) * Math.sin(-t) };
      result = { x: v1.x + v2.x, y: v1.y + v2.y };
    } else if (mode === 'sine') {
      v1 = { x: (R/2) * Math.cos(t), y: (R/2) * Math.sin(t) };
      v2 = { x: -(R/2) * Math.cos(-t), y: -(R/2) * Math.sin(-t) };
      result = { x: v1.x + v2.x, y: v1.y + v2.y };
    }

    history.push({ t: t, x: result.x, y: result.y });
    if (history.length > 800) history.shift(); // Prevent memory bloat

    // 1. Draw Complex Plane (Top Left)
    drawGrid(ctxCircle, dims.circle.w, dims.circle.h, CX, CY, "Re", "Im");
    
    ctxCircle.beginPath();
    ctxCircle.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctxCircle.arc(CX, CY, R, 0, Math.PI * 2);
    ctxCircle.stroke();

    const cv1 = toCanvas(v1.x, v1.y, CX, CY);
    const cRes = toCanvas(result.x, result.y, CX, CY);

    if (mode === 'euler') {
      drawVector(ctxCircle, CX, CY, cv1.x, cv1.y, COLOR_VEC1);
    } else {
      drawVector(ctxCircle, CX, CY, cv1.x, cv1.y, COLOR_VEC1);
      drawVector(ctxCircle, cv1.x, cv1.y, cRes.x, cRes.y, COLOR_VEC2);
      
      ctxCircle.beginPath();
      ctxCircle.fillStyle = COLOR_RESULT;
      ctxCircle.arc(cRes.x, cRes.y, 5, 0, Math.PI*2);
      ctxCircle.fill();
    }

    // 2. Draw Sine Wave (Top Right)
    // Align sine wave's baseline vertically with the circle's center
    drawGrid(ctxSine, dims.sine.w, dims.sine.h, 0, CY, "Time", "Im");
    
    if (mode === 'euler' || mode === 'sine') {
      ctxCircle.beginPath(); ctxCircle.setLineDash([4, 4]); ctxCircle.strokeStyle = COLOR_SINE;
      ctxCircle.moveTo(cRes.x, cRes.y); ctxCircle.lineTo(dims.circle.w, cRes.y);
      ctxCircle.stroke(); ctxCircle.setLineDash([]);
      
      ctxSine.beginPath(); ctxSine.setLineDash([4, 4]); ctxSine.strokeStyle = COLOR_SINE;
      ctxSine.moveTo(0, cRes.y); ctxSine.lineTo(dims.sine.w, cRes.y);
      ctxSine.stroke(); ctxSine.setLineDash([]);
    }

    ctxSine.beginPath();
    ctxSine.strokeStyle = mode === 'cosine' ? "rgba(102, 187, 106, 0.2)" : COLOR_SINE;
    ctxSine.lineWidth = 2.5;
    for (let i = 0; i < history.length; i++) {
      let h = history[i];
      let screenX = (t - h.t) * 60; 
      let screenY = CY - h.y;
      if (i === 0) ctxSine.moveTo(screenX, screenY);
      else ctxSine.lineTo(screenX, screenY);
    }
    ctxSine.stroke();

    // 3. Draw Cosine Wave (Bottom Left)
    // Align cosine wave's baseline horizontally with the circle's center
    drawGrid(ctxCosine, dims.cosine.w, dims.cosine.h, CX, 0, "Re", "Time");
    
    if (mode === 'euler' || mode === 'cosine') {
      ctxCircle.beginPath(); ctxCircle.setLineDash([4, 4]); ctxCircle.strokeStyle = COLOR_COSINE;
      ctxCircle.moveTo(cRes.x, cRes.y); ctxCircle.lineTo(cRes.x, dims.circle.h);
      ctxCircle.stroke(); ctxCircle.setLineDash([]);

      ctxCosine.beginPath(); ctxCosine.setLineDash([4, 4]); ctxCosine.strokeStyle = COLOR_COSINE;
      ctxCosine.moveTo(cRes.x, 0); ctxCosine.lineTo(cRes.x, dims.cosine.h);
      ctxCosine.stroke(); ctxCosine.setLineDash([]);
    }

    ctxCosine.beginPath();
    ctxCosine.strokeStyle = mode === 'sine' ? "rgba(66, 165, 245, 0.2)" : COLOR_COSINE;
    ctxCosine.lineWidth = 2.5;
    for (let i = 0; i < history.length; i++) {
      let h = history[i];
      let screenX = CX + h.x;
      let screenY = (t - h.t) * 60; 
      if (i === 0) ctxCosine.moveTo(screenX, screenY);
      else ctxCosine.lineTo(screenX, screenY);
    }
    ctxCosine.stroke();

    requestAnimationFrame(render);
  }

  // --- Initialization ---
  updateDimensions();
  updateEquation();
  render();
});
