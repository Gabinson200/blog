window.addEventListener("DOMContentLoaded", () => {
  // --- Constants & Config ---
  const TWO_PI = Math.PI * 2;
  const NUM_POINTS = 1000;
  
  // Palette
  const COLOR_AXIS = "#444";
  const COLOR_TEXT = "#aaa";
  const COLOR_SIGNAL = "#42a5f5"; 
  const COLOR_WRAP = "rgba(66, 165, 245, 0.6)"; 
  const COLOR_CM = "#ef5350"; 

  // State
  let k = 0; // Now an exact integer
  let waveType = 'offset-cos';
  let tValues = [];
  
  // Populate time array from -PI to PI
  for (let i = 0; i <= NUM_POINTS; i++) {
    tValues.push(-Math.PI + (TWO_PI * (i / NUM_POINTS)));
  }

  // --- Dimensions State ---
  let dims = {
    time: { w: 0, h: 0 },
    wrap: { w: 0, h: 0, cx: 0, cy: 0, scale: 0 }
  };

  // --- DOM Elements ---
  const selectWave = document.getElementById('wave-select');
  const sliderK = document.getElementById('k-slider');
  const displayK = document.getElementById('k-display');
  const displayEq = document.getElementById('equation-display');
  const displayVal = document.getElementById('value-display');

  const canvasTime = document.getElementById('canvas-time');
  const canvasWrap = document.getElementById('canvas-wrap');
  const ctxTime = canvasTime.getContext('2d');
  const ctxWrap = canvasWrap.getContext('2d');

  // --- Functions ---
  function getSignal(type, t) {
    if (type === 'offset-cos') return 1 + Math.cos(2 * t);
    if (type === 'pure-cos') return Math.cos(3 * t);
    if (type === 'combo') return Math.cos(2 * t) + Math.sin(3 * t);
    if (type === 'pulse') return Math.abs(t) < 0.5 ? 1 : 0;
    return 0;
  }

  // --- Resize Handling (Responsive Canvas) ---
  function resizeCanvas(canvas, ctx) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    return { w: rect.width, h: rect.height };
  }

  function updateDimensions() {
    dims.time = resizeCanvas(canvasTime, ctxTime);
    dims.wrap = resizeCanvas(canvasWrap, ctxWrap);
    
    dims.wrap.cx = dims.wrap.w / 2;
    dims.wrap.cy = dims.wrap.h / 2;
    // Scale factor leaves padding on the edges (assuming max amplitude ~2)
    dims.wrap.scale = Math.min(dims.wrap.cx, dims.wrap.cy) * 0.40; 
  }

  // Observer ensures canvas scales automatically when window size changes
  const resizeObserver = new ResizeObserver(() => {
    updateDimensions();
    render();
  });
  resizeObserver.observe(document.querySelector('.visualization-grid'));

  // --- Events ---
  selectWave.addEventListener('change', (e) => {
    waveType = e.target.value;
    render();
  });

  sliderK.addEventListener('input', (e) => {
    k = parseInt(e.target.value, 10);
    displayK.innerText = k;
    render();
  });

  // --- Rendering Helpers ---
  function drawAxesTime(ctx, w, h) {
    const cy = h / 2;
    ctx.beginPath();
    ctx.strokeStyle = COLOR_AXIS;
    ctx.lineWidth = 1;
    ctx.moveTo(0, cy); ctx.lineTo(w, cy); // x-axis
    ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); // y-axis
    ctx.stroke();
    
    ctx.fillStyle = COLOR_TEXT;
    ctx.font = "12px -apple-system, sans-serif";
    ctx.fillText("Time (t)", w - 50, cy - 10);
    ctx.fillText("f(t)", w/2 + 10, 20);
  }

  function drawAxesWrap(ctx, w, h, cx, cy) {
    ctx.beginPath();
    ctx.strokeStyle = COLOR_AXIS;
    ctx.lineWidth = 1;
    ctx.moveTo(0, cy); ctx.lineTo(w, cy); 
    ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
    ctx.stroke();

    // Draw unit circle reference
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.arc(cx, cy, dims.wrap.scale, 0, TWO_PI);
    ctx.stroke();
    
    ctx.fillStyle = COLOR_TEXT;
    ctx.font = "12px -apple-system, sans-serif";
    ctx.fillText("Real", w - 35, cy - 10);
    ctx.fillText("Imaginary", cx + 10, 20);
  }

  function renderEquation() {
    // Note: No $$ wrappers. displayMode: true handles the centering and layout.
    // Negative sign is handled directly in the exponent logic.
    let latex = `c_{${k}} = \\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi} f(t) e^{-i(${k})t} \\,dt`;
    
    if (window.katex) {
      katex.render(latex, displayEq, { throwOnError: false, displayMode: true });
    } else {
      displayEq.innerText = latex;
    }
  }

  // --- Main Draw Loop ---
  function render() {
    if (dims.wrap.w === 0) return; // Wait for initial resize

    // Clear canvases
    ctxTime.clearRect(0, 0, dims.time.w, dims.time.h);
    ctxWrap.clearRect(0, 0, dims.wrap.w, dims.wrap.h);

    drawAxesTime(ctxTime, dims.time.w, dims.time.h);
    drawAxesWrap(ctxWrap, dims.wrap.w, dims.wrap.h, dims.wrap.cx, dims.wrap.cy);

    const pathWrap = [];
    let sumReal = 0;
    let sumImag = 0;

    // Mapping scales for time domain
    const xScaleT = dims.time.w / TWO_PI;
    const yScaleT = dims.time.h / 4; 
    const cyT = dims.time.h / 2;
    const cxT = dims.time.w / 2;

    ctxTime.beginPath();
    ctxTime.strokeStyle = COLOR_SIGNAL;
    ctxTime.lineWidth = 2.5;

    const dt = TWO_PI / NUM_POINTS;

    // Evaluate integral & plot coordinates
    for (let i = 0; i < tValues.length; i++) {
      let t = tValues[i];
      let val = getSignal(waveType, t);

      // 1. Time Domain Point
      let screenX = cxT + (t * xScaleT);
      let screenY = cyT - (val * yScaleT);
      
      if (i === 0) ctxTime.moveTo(screenX, screenY);
      else ctxTime.lineTo(screenX, screenY);

      // 2. Complex Plane Point: f(t) * e^{-ikt}
      let angle = -k * t;
      let realPart = val * Math.cos(angle);
      let imagPart = val * Math.sin(angle); // y is flipped in canvas

      // Integration: Sum(value * dt)
      if (i < tValues.length - 1) { 
        sumReal += realPart * dt;
        sumImag += imagPart * dt;
      }

      // Convert to Wrap Screen Coordinates
      let wScreenX = dims.wrap.cx + (realPart * dims.wrap.scale);
      let wScreenY = dims.wrap.cy - (imagPart * dims.wrap.scale);
      pathWrap.push({ x: wScreenX, y: wScreenY });
    }
    ctxTime.stroke();

    // Draw Wrapped Path
    ctxWrap.beginPath();
    ctxWrap.strokeStyle = COLOR_WRAP;
    ctxWrap.lineWidth = 1.5;
    for (let i = 0; i < pathWrap.length; i++) {
      if (i === 0) ctxWrap.moveTo(pathWrap[i].x, pathWrap[i].y);
      else ctxWrap.lineTo(pathWrap[i].x, pathWrap[i].y);
    }
    ctxWrap.stroke();

    // Center of Mass = (1/2PI) * Integral
    let cmReal = sumReal / TWO_PI;
    let cmImag = sumImag / TWO_PI;

    let cmScreenX = dims.wrap.cx + (cmReal * dims.wrap.scale);
    let cmScreenY = dims.wrap.cy - (cmImag * dims.wrap.scale); // Canvas Y is inverted

    // Draw Center of Mass Vector
    ctxWrap.beginPath();
    ctxWrap.strokeStyle = COLOR_CM;
    ctxWrap.lineWidth = 3;
    ctxWrap.moveTo(dims.wrap.cx, dims.wrap.cy);
    ctxWrap.lineTo(cmScreenX, cmScreenY);
    ctxWrap.stroke();

    // Vector Tip
    ctxWrap.beginPath();
    ctxWrap.fillStyle = COLOR_CM;
    ctxWrap.arc(cmScreenX, cmScreenY, 6, 0, TWO_PI);
    ctxWrap.fill();

    // Update Readouts
    renderEquation();
    let magnitude = Math.sqrt(cmReal*cmReal + cmImag*cmImag);
    displayVal.innerText = `| c_${k} | \u2248 ${magnitude.toFixed(3)}`;
  }

  // Init
  updateDimensions();
  render();
});
