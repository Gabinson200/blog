window.addEventListener("DOMContentLoaded", () => {
  let time = 0;
  let isPlaying = true;
  let freq = 1.0;
  let mode = "euler";
  let history = [];
  let lastTimestamp = null;
  let resizeRaf = null;

  const MAX_HISTORY = 900;
  const TIME_WINDOW = 8.0;

  const dims = {
    circle: { w: 0, h: 0, cx: 0, cy: 0, r: 0 },
    sine: { w: 0, h: 0 },
    cosine: { w: 0, h: 0 }
  };

  const COLOR_AXIS = "#555";
  const COLOR_GRID = "rgba(255,255,255,0.06)";
  const COLOR_TEXT = "#aaa";
  const COLOR_VEC1 = "#42a5f5";
  const COLOR_VEC2 = "#ffa726";
  const COLOR_SINE = "#66bb6a";
  const COLOR_COSINE = "#42a5f5";
  const COLOR_RESULT = "#ef5350";

  const widget = document.querySelector(".euler-visualizer");
  const grid = document.querySelector(".visualization-grid");
  const circlePanel = document.querySelector(".circle-panel");
  const sinePanel = document.querySelector(".sine-panel");
  const cosinePanel = document.querySelector(".cosine-panel");
  const formulaBox = document.querySelector(".formula-box");

  const btnPlay = document.getElementById("btn-play");
  const selectMode = document.getElementById("mode-select");
  const sliderFreq = document.getElementById("freq-slider");
  const displayFreq = document.getElementById("freq-display");
  const displayEq = document.getElementById("equation-display");

  const canvasCircle = document.getElementById("canvas-circle");
  const canvasSine = document.getElementById("canvas-sine");
  const canvasCosine = document.getElementById("canvas-cosine");

  const ctxCircle = canvasCircle.getContext("2d");
  const ctxSine = canvasSine.getContext("2d");
  const ctxCosine = canvasCosine.getContext("2d");

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

    return {
      w: cssWidth,
      h: cssHeight
    };
  }

  function updateDimensions() {
    const circleDims = resizeCanvas(canvasCircle, ctxCircle);

    dims.circle.w = circleDims.w;
    dims.circle.h = circleDims.h;
    dims.circle.cx = circleDims.w / 2;
    dims.circle.cy = circleDims.h / 2;
    dims.circle.r = Math.min(circleDims.w, circleDims.h) * 0.36;

    dims.sine = resizeCanvas(canvasSine, ctxSine);
    dims.cosine = resizeCanvas(canvasCosine, ctxCosine);
  }

  function notifyParentHeight() {
    const height = Math.ceil(document.documentElement.scrollHeight);

    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: "fourier-widget-resize",
          id: "euler-visualizer",
          height
        },
        "*"
      );
    }
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

  function updateEquation() {
    const w = Number(freq.toFixed(1));
    const wText = Math.abs(w - 1.0) < 1e-12 ? "" : w.toFixed(1);

    let latex = "";

    if (mode === "euler") {
      latex = `e^{i ${wText} t}=\\cos(${wText}t)+i\\sin(${wText}t)`;
    } else if (mode === "cosine") {
      latex = `\\cos(${wText}t)=\\frac{e^{i ${wText}t}+e^{-i ${wText}t}}{2}`;
    } else if (mode === "sine") {
      latex = `\\sin(${wText}t)=\\frac{e^{i ${wText}t}-e^{-i ${wText}t}}{2i}`;
    }

    if (window.katex) {
      katex.render(latex, displayEq, {
        throwOnError: false,
        displayMode: true
      });
    } else {
      displayEq.innerText = latex;
    }

    notifyParentHeight();
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

  function drawGrid(ctx, width, height, centerX, centerY, labelX, labelY) {
    ctx.clearRect(0, 0, width, height);

    for (let x = 0; x <= width; x += 48) {
      drawLine(ctx, x, 0, x, height, COLOR_GRID, 1);
    }

    for (let y = 0; y <= height; y += 48) {
      drawLine(ctx, 0, y, width, y, COLOR_GRID, 1);
    }

    drawLine(ctx, 0, centerY, width, centerY, COLOR_AXIS, 1.2);
    drawLine(ctx, centerX, 0, centerX, height, COLOR_AXIS, 1.2);

    if (labelX) {
      drawText(ctx, labelX, Math.max(12, width - 36), centerY - 14, COLOR_TEXT, 12);
    }

    if (labelY) {
      drawText(ctx, labelY, centerX + 10, 18, COLOR_TEXT, 12);
    }
  }

  function drawVector(ctx, startX, startY, endX, endY, color, width = 2.5, radius = 4) {
    drawLine(ctx, startX, startY, endX, endY, color, width);

    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(endX, endY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function toCanvas(mathX, mathY, centerX, centerY, radius) {
    return {
      x: centerX + mathX * radius,
      y: centerY - mathY * radius
    };
  }

  function computeVectors(theta) {
    let v1 = { x: 0, y: 0 };
    let v2 = null;
    let result = { x: 0, y: 0 };

    if (mode === "euler") {
      v1 = {
        x: Math.cos(theta),
        y: Math.sin(theta)
      };

      result = v1;
    } else if (mode === "cosine") {
      v1 = {
        x: 0.5 * Math.cos(theta),
        y: 0.5 * Math.sin(theta)
      };

      v2 = {
        x: 0.5 * Math.cos(-theta),
        y: 0.5 * Math.sin(-theta)
      };

      result = {
        x: v1.x + v2.x,
        y: v1.y + v2.y
      };
    } else if (mode === "sine") {
      v1 = {
        x: 0.5 * Math.cos(theta - Math.PI / 2),
        y: 0.5 * Math.sin(theta - Math.PI / 2)
      };

      v2 = {
        x: 0.5 * Math.cos(-theta + Math.PI / 2),
        y: 0.5 * Math.sin(-theta + Math.PI / 2)
      };

      result = {
        x: v1.x + v2.x,
        y: v1.y + v2.y
      };
    }

    return { v1, v2, result };
  }

  function drawCirclePanel(v1, v2, result) {
    const { w, h, cx, cy, r } = dims.circle;

    drawGrid(ctxCircle, w, h, cx, cy, "Re", "Im");

    ctxCircle.save();
    ctxCircle.strokeStyle = "rgba(255,255,255,0.13)";
    ctxCircle.lineWidth = 1.2;
    ctxCircle.beginPath();
    ctxCircle.arc(cx, cy, r, 0, Math.PI * 2);
    ctxCircle.stroke();
    ctxCircle.restore();

    const p1 = toCanvas(v1.x, v1.y, cx, cy, r);
    const pres = toCanvas(result.x, result.y, cx, cy, r);

    if (mode === "euler") {
      drawVector(ctxCircle, cx, cy, p1.x, p1.y, COLOR_VEC1, 2.8, 5);
    } else if (v2) {
      const p2Start = p1;
      const p2End = pres;

      drawVector(ctxCircle, cx, cy, p1.x, p1.y, COLOR_VEC1, 2.4, 4);
      drawVector(ctxCircle, p2Start.x, p2Start.y, p2End.x, p2End.y, COLOR_VEC2, 2.4, 4);

      ctxCircle.save();
      ctxCircle.fillStyle = COLOR_RESULT;
      ctxCircle.beginPath();
      ctxCircle.arc(pres.x, pres.y, 5.5, 0, Math.PI * 2);
      ctxCircle.fill();
      ctxCircle.restore();
    }

    drawLine(ctxCircle, pres.x, pres.y, pres.x, cy, COLOR_COSINE, 1.5, [5, 5]);
    drawLine(ctxCircle, pres.x, pres.y, cx, pres.y, COLOR_SINE, 1.5, [5, 5]);

    drawText(ctxCircle, `cos ≈ ${result.x.toFixed(3)}`, cx, h - 18, COLOR_COSINE, 12, "center");
    drawText(ctxCircle, `sin ≈ ${result.y.toFixed(3)}`, cx, 18, COLOR_SINE, 12, "center");
  }

  function drawSinePanel(currentY) {
    const { w, h } = dims.sine;
    const midY = h / 2;
    const amp = h * 0.36;

    drawGrid(ctxSine, w, h, 0, midY, "time", "sin");

    ctxSine.save();
    ctxSine.strokeStyle = mode === "cosine" ? "rgba(102,187,106,0.22)" : COLOR_SINE;
    ctxSine.lineWidth = 2.5;
    ctxSine.beginPath();

    let started = false;

    for (const point of history) {
      const age = time - point.time;

      if (age < 0 || age > TIME_WINDOW) {
        continue;
      }

      const x = w - (age / TIME_WINDOW) * w;
      const y = midY - point.y * amp;

      if (!started) {
        ctxSine.moveTo(x, y);
        started = true;
      } else {
        ctxSine.lineTo(x, y);
      }
    }

    ctxSine.stroke();
    ctxSine.restore();

    const currentScreenY = midY - currentY * amp;

    drawLine(ctxSine, 0, currentScreenY, w, currentScreenY, COLOR_SINE, 1.2, [5, 5]);

    ctxSine.save();
    ctxSine.fillStyle = COLOR_SINE;
    ctxSine.beginPath();
    ctxSine.arc(w - 7, currentScreenY, 5, 0, Math.PI * 2);
    ctxSine.fill();
    ctxSine.restore();
  }

  function drawCosinePanel(currentX) {
    const { w, h } = dims.cosine;
    const midX = w / 2;
    const amp = w * 0.36;

    drawGrid(ctxCosine, w, h, midX, 0, "cos", "time");

    ctxCosine.save();
    ctxCosine.strokeStyle = mode === "sine" ? "rgba(66,165,245,0.22)" : COLOR_COSINE;
    ctxCosine.lineWidth = 2.5;
    ctxCosine.beginPath();

    let started = false;

    for (const point of history) {
      const age = time - point.time;

      if (age < 0 || age > TIME_WINDOW) {
        continue;
      }

      const x = midX + point.x * amp;
      const y = (age / TIME_WINDOW) * h;

      if (!started) {
        ctxCosine.moveTo(x, y);
        started = true;
      } else {
        ctxCosine.lineTo(x, y);
      }
    }

    ctxCosine.stroke();
    ctxCosine.restore();

    const currentScreenX = midX + currentX * amp;

    drawLine(ctxCosine, currentScreenX, 0, currentScreenX, h, COLOR_COSINE, 1.2, [5, 5]);

    ctxCosine.save();
    ctxCosine.fillStyle = COLOR_COSINE;
    ctxCosine.beginPath();
    ctxCosine.arc(currentScreenX, 7, 5, 0, Math.PI * 2);
    ctxCosine.fill();
    ctxCosine.restore();
  }

  function renderFrame(timestamp) {
    if (lastTimestamp === null) {
      lastTimestamp = timestamp;
    }

    const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
    lastTimestamp = timestamp;

    if (isPlaying) {
      time += dt;
    }

    const theta = freq * time;
    const { v1, v2, result } = computeVectors(theta);

    history.push({
      time,
      x: result.x,
      y: result.y
    });

    if (history.length > MAX_HISTORY) {
      history.shift();
    }

    if (dims.circle.w > 1 && dims.sine.w > 1 && dims.cosine.w > 1) {
      drawCirclePanel(v1, v2, result);
      drawSinePanel(result.y);
      drawCosinePanel(result.x);
    }

    requestAnimationFrame(renderFrame);
  }

  btnPlay.addEventListener("click", () => {
    isPlaying = !isPlaying;
    btnPlay.innerText = isPlaying ? "Pause" : "Play";
  });

  sliderFreq.addEventListener("input", (event) => {
    freq = parseFloat(event.target.value);
    displayFreq.innerText = freq.toFixed(1);
    history = [];
    updateEquation();
  });

  selectMode.addEventListener("change", (event) => {
    mode = event.target.value;
    history = [];
    updateEquation();
  });

  if (window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(() => {
      scheduleResize();
      notifyParentHeight();
    });

    [widget, grid, circlePanel, sinePanel, cosinePanel, formulaBox, canvasCircle, canvasSine, canvasCosine].forEach((el) => {
      if (el) resizeObserver.observe(el);
    });
  }

  window.addEventListener("resize", () => {
    scheduleResize();
    notifyParentHeight();
  });

  displayFreq.innerText = freq.toFixed(1);

  updateDimensions();
  updateEquation();
  notifyParentHeight();
  scheduleResize();
  requestAnimationFrame(renderFrame);
});
