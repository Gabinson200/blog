window.addEventListener("DOMContentLoaded", () => {
  const TWO_PI = Math.PI * 2;
  const NUM_POINTS = 1000;

  const COLOR_AXIS = "#555";
  const COLOR_GRID = "rgba(255,255,255,0.06)";
  const COLOR_TEXT = "#aaa";
  const COLOR_SIGNAL = "#42a5f5";
  const COLOR_WRAP = "rgba(66, 165, 245, 0.62)";
  const COLOR_CM = "#ef5350";

  let k = 0;
  let waveType = "offset-cos";
  let resizeRaf = null;

  const tValues = [];
  for (let i = 0; i <= NUM_POINTS; i++) {
    tValues.push(-Math.PI + TWO_PI * (i / NUM_POINTS));
  }

  const dims = {
    time: { w: 0, h: 0 },
    wrap: { w: 0, h: 0, cx: 0, cy: 0, scale: 0 }
  };

  const widget = document.querySelector(".fourier-winding");
  const grid = document.querySelector(".visualization-grid");
  const leftPanel = document.querySelector(".left-panel");
  const wrapPanel = document.querySelector(".wrap-panel");

  const selectWave = document.getElementById("wave-select");
  const sliderK = document.getElementById("k-slider");
  const displayK = document.getElementById("k-display");
  const displayEq = document.getElementById("equation-display");
  const displayVal = document.getElementById("value-display");

  const canvasTime = document.getElementById("canvas-time");
  const canvasWrap = document.getElementById("canvas-wrap");
  const ctxTime = canvasTime.getContext("2d");
  const ctxWrap = canvasWrap.getContext("2d");

  function getSignal(type, t) {
    if (type === "offset-cos") return 1 + Math.cos(2 * t);
    if (type === "pure-cos") return Math.cos(3 * t);
    if (type === "combo") return Math.cos(2 * t) + Math.sin(3 * t);
    if (type === "pulse") return Math.abs(t) < 0.5 ? 1 : 0;
    return 0;
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
    dims.time = resizeCanvas(canvasTime, ctxTime);
    dims.wrap = resizeCanvas(canvasWrap, ctxWrap);

    dims.wrap.cx = dims.wrap.w / 2;
    dims.wrap.cy = dims.wrap.h / 2;
    dims.wrap.scale = Math.min(dims.wrap.cx, dims.wrap.cy) * 0.36;
  }

  function scheduleResize() {
    if (resizeRaf !== null) {
      cancelAnimationFrame(resizeRaf);
    }

    resizeRaf = requestAnimationFrame(() => {
      updateDimensions();
      render();
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

  function drawAxesTime(ctx, w, h) {
    const cy = h / 2;
    const cx = w / 2;

    ctx.save();
    ctx.strokeStyle = COLOR_GRID;
    ctx.lineWidth = 1;

    for (let x = 0; x <= w; x += 48) {
      drawLine(ctx, x, 0, x, h, COLOR_GRID, 1);
    }

    for (let y = 0; y <= h; y += 48) {
      drawLine(ctx, 0, y, w, y, COLOR_GRID, 1);
    }

    ctx.restore();

    drawLine(ctx, 0, cy, w, cy, COLOR_AXIS, 1.2);
    drawLine(ctx, cx, 0, cx, h, COLOR_AXIS, 1.2);

    drawText(ctx, "t", Math.max(12, w - 20), cy - 14, COLOR_TEXT, 12);
    drawText(ctx, "f(t)", cx + 10, 18, COLOR_TEXT, 12);
  }

  function drawAxesWrap(ctx, w, h, cx, cy) {
    ctx.save();
    ctx.strokeStyle = COLOR_GRID;
    ctx.lineWidth = 1;

    for (let x = 0; x <= w; x += 48) {
      drawLine(ctx, x, 0, x, h, COLOR_GRID, 1);
    }

    for (let y = 0; y <= h; y += 48) {
      drawLine(ctx, 0, y, w, y, COLOR_GRID, 1);
    }

    ctx.restore();

    drawLine(ctx, 0, cy, w, cy, COLOR_AXIS, 1.2);
    drawLine(ctx, cx, 0, cx, h, COLOR_AXIS, 1.2);

    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, dims.wrap.scale, 0, TWO_PI);
    ctx.stroke();
    ctx.restore();

    drawText(ctx, "Re", Math.max(12, w - 28), cy - 14, COLOR_TEXT, 12);
    drawText(ctx, "Im", cx + 10, 18, COLOR_TEXT, 12);
  }

  function renderEquation() {
    const latex = `c_{${k}}=\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi} f(t)e^{-i(${k})t}\\,dt`;

    if (window.katex) {
      katex.render(latex, displayEq, {
        throwOnError: false,
        displayMode: true
      });
    } else {
      displayEq.innerText = latex;
    }
  }

  function render() {
    if (dims.time.w <= 1 || dims.time.h <= 1 || dims.wrap.w <= 1 || dims.wrap.h <= 1) {
      return;
    }

    ctxTime.clearRect(0, 0, dims.time.w, dims.time.h);
    ctxWrap.clearRect(0, 0, dims.wrap.w, dims.wrap.h);

    drawAxesTime(ctxTime, dims.time.w, dims.time.h);
    drawAxesWrap(ctxWrap, dims.wrap.w, dims.wrap.h, dims.wrap.cx, dims.wrap.cy);

    const pathWrap = [];

    let sumReal = 0;
    let sumImag = 0;

    const xScaleT = dims.time.w / TWO_PI;
    const yScaleT = dims.time.h / 4;
    const cyT = dims.time.h / 2;
    const cxT = dims.time.w / 2;
    const dt = TWO_PI / NUM_POINTS;

    ctxTime.save();
    ctxTime.beginPath();
    ctxTime.strokeStyle = COLOR_SIGNAL;
    ctxTime.lineWidth = 2.5;

    for (let i = 0; i < tValues.length; i++) {
      const t = tValues[i];
      const val = getSignal(waveType, t);

      const screenX = cxT + t * xScaleT;
      const screenY = cyT - val * yScaleT;

      if (i === 0) {
        ctxTime.moveTo(screenX, screenY);
      } else {
        ctxTime.lineTo(screenX, screenY);
      }

      const angle = -k * t;
      const realPart = val * Math.cos(angle);
      const imagPart = val * Math.sin(angle);

      if (i < tValues.length - 1) {
        sumReal += realPart * dt;
        sumImag += imagPart * dt;
      }

      pathWrap.push({
        x: dims.wrap.cx + realPart * dims.wrap.scale,
        y: dims.wrap.cy - imagPart * dims.wrap.scale
      });
    }

    ctxTime.stroke();
    ctxTime.restore();

    ctxWrap.save();
    ctxWrap.beginPath();
    ctxWrap.strokeStyle = COLOR_WRAP;
    ctxWrap.lineWidth = 1.6;

    for (let i = 0; i < pathWrap.length; i++) {
      if (i === 0) {
        ctxWrap.moveTo(pathWrap[i].x, pathWrap[i].y);
      } else {
        ctxWrap.lineTo(pathWrap[i].x, pathWrap[i].y);
      }
    }

    ctxWrap.stroke();
    ctxWrap.restore();

    const cmReal = sumReal / TWO_PI;
    const cmImag = sumImag / TWO_PI;

    const cmScreenX = dims.wrap.cx + cmReal * dims.wrap.scale;
    const cmScreenY = dims.wrap.cy - cmImag * dims.wrap.scale;

    drawLine(ctxWrap, dims.wrap.cx, dims.wrap.cy, cmScreenX, cmScreenY, COLOR_CM, 3);

    ctxWrap.save();
    ctxWrap.fillStyle = COLOR_CM;
    ctxWrap.beginPath();
    ctxWrap.arc(cmScreenX, cmScreenY, 6, 0, TWO_PI);
    ctxWrap.fill();
    ctxWrap.restore();

    renderEquation();

    const magnitude = Math.sqrt(cmReal * cmReal + cmImag * cmImag);
    displayVal.innerText = `| c_${k} | ≈ ${magnitude.toFixed(3)}    Re ≈ ${cmReal.toFixed(3)}, Im ≈ ${cmImag.toFixed(3)}`;
  }

  function notifyParentHeight() {
    const height = Math.ceil(document.documentElement.scrollHeight);

    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: "fourier-widget-resize",
          id: "fourier-winding",
          height
        },
        "*"
      );
    }
  }

  selectWave.addEventListener("change", (event) => {
    waveType = event.target.value;
    render();
    notifyParentHeight();
  });

  sliderK.addEventListener("input", (event) => {
    k = parseInt(event.target.value, 10);
    displayK.innerText = k;
    render();
  });

  if (window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(() => {
      scheduleResize();
      notifyParentHeight();
    });

    [widget, grid, leftPanel, wrapPanel, canvasTime, canvasWrap].forEach((el) => {
      if (el) resizeObserver.observe(el);
    });
  }

  window.addEventListener("resize", () => {
    scheduleResize();
    notifyParentHeight();
  });

  displayK.innerText = k;

  updateDimensions();
  render();
  notifyParentHeight();
  scheduleResize();
});
