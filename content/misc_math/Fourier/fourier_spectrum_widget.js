window.addEventListener("DOMContentLoaded", () => {
  const functionSelect = document.getElementById("function-select");
  const kSlider = document.getElementById("k-slider");
  const kRangeDisplay = document.getElementById("k-range-display");
  const formulaDisplay = document.getElementById("formula-display");

  const spectrumPlot = document.getElementById("spectrum-plot");
  const reconstructionPlot = document.getElementById("reconstruction-plot");
  const widget = document.querySelector(".fourier-spectrum-widget");

  const PI = Math.PI;
  const TWO_PI = 2 * Math.PI;

  const MAX_K = 16;
  const SAMPLE_COUNT = 2048;
  const PLOT_COUNT = 900;

  let resizeRaf = null;

  const sampleXs = linspace(-PI, PI, SAMPLE_COUNT, false);
  const plotXs = linspace(-PI, PI, PLOT_COUNT, true);

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

    if (type === "pulse") {
      return Math.abs(w) < 0.55 ? 1 : 0;
    }

    if (type === "triangle") {
      return 1 - (2 * Math.abs(w)) / PI;
    }

    return 0;
  }

  function getFunctionName(type) {
    if (type === "complex") return "Complex mixed wave";
    if (type === "square") return "Square wave";
    if (type === "sawtooth") return "Sawtooth wave";
    if (type === "pulse") return "Narrow pulse";
    if (type === "triangle") return "Triangle wave";
    return "Function";
  }

  function getTargetEquation(type) {
    if (type === "complex") {
      return "f(x)=0.25+0.55\\cos(x)+0.35\\sin(x)-0.25\\cos(2x)+0.30\\sin(2x)+\\cdots";
    }

    if (type === "square") {
      return "f(x)=\\operatorname{sgn}(\\sin x)";
    }

    if (type === "sawtooth") {
      return "f(x)=x/\\pi,\\qquad -\\pi<x\\le \\pi";
    }

    if (type === "pulse") {
      return "f(x)=\\begin{cases}1,& |x|<0.55\\\\0,&\\text{otherwise}\\end{cases}";
    }

    if (type === "triangle") {
      return "f(x)=1-\\frac{2|x|}{\\pi},\\qquad -\\pi\\le x\\le \\pi";
    }

    return "";
  }

  function computeCoefficients(type) {
    const coeffs = new Map();
    const dx = TWO_PI / SAMPLE_COUNT;

    for (let k = -MAX_K; k <= MAX_K; k++) {
      let real = 0;
      let imag = 0;

      for (const x of sampleXs) {
        const f = getFunctionValue(type, x);
        const angle = -k * x;

        real += f * Math.cos(angle) * dx;
        imag += f * Math.sin(angle) * dx;
      }

      real /= TWO_PI;
      imag /= TWO_PI;

      coeffs.set(k, {
        real,
        imag,
        mag: Math.sqrt(real * real + imag * imag)
      });
    }

    return coeffs;
  }

  function reconstructAt(x, coeffs, kIncluded) {
    let y = 0;

    for (let k = -kIncluded; k <= kIncluded; k++) {
      const c = coeffs.get(k);

      if (!c) continue;

      y += c.real * Math.cos(k * x) - c.imag * Math.sin(k * x);
    }

    return y;
  }

  function formatNumber(value) {
    if (Math.abs(value) < 1e-10) return "0";
    return Number(value.toFixed(3)).toString();
  }

  function buildFormula(type, kIncluded) {
    const target = getTargetEquation(type);

    if (kIncluded === 0) {
      return `${target}\\qquad f_{0}(x)=c_0`;
    }

    return `${target}\\qquad f_{${kIncluded}}(x)=\\sum_{k=-${kIncluded}}^{${kIncluded}}c_k e^{ikx}`;
  }

  function renderFormula(type, kIncluded) {
    const latex = buildFormula(type, kIncluded);

    if (window.katex) {
      katex.render(latex, formulaDisplay, {
        throwOnError: false,
        displayMode: true
      });
    } else {
      formulaDisplay.textContent = latex;
    }
  }

  function makeSpectrumPlot(type, coeffs, kIncluded) {
    const ks = [];
    const mags = [];
    const colors = [];
    const hoverText = [];

    for (let k = -MAX_K; k <= MAX_K; k++) {
      const c = coeffs.get(k);

      ks.push(k);
      mags.push(c.mag);

      const included = Math.abs(k) <= kIncluded;
      colors.push(included ? "#42a5f5" : "rgba(210,210,210,0.28)");

      hoverText.push(
        `k=${k}<br>` +
        `|c_k|=${formatNumber(c.mag)}<br>` +
        `Re=${formatNumber(c.real)}<br>` +
        `Im=${formatNumber(c.imag)}`
      );
    }

    const traces = [
      {
        x: ks,
        y: mags,
        type: "bar",
        name: "|c_k|",
        marker: {
          color: colors,
          line: {
            color: "rgba(255,255,255,0.25)",
            width: 1
          }
        },
        text: hoverText,
        hovertemplate: "%{text}<extra></extra>"
      }
    ];

    const maxMag = Math.max(...mags, 0.05);

    const layout = {
      title: `${getFunctionName(type)}: Fourier coefficient magnitudes`,
      paper_bgcolor: "#1b1b1b",
      plot_bgcolor: "#101010",
      font: { color: "#f5f5f5" },
      margin: { t: 42, b: 48, l: 58, r: 18 },
      autosize: true,
      bargap: 0.18,
      xaxis: {
        title: "frequency index k",
        range: [-MAX_K - 0.75, MAX_K + 0.75],
        dtick: 2,
        gridcolor: "#333",
        zerolinecolor: "#888",
        automargin: true
      },
      yaxis: {
        title: "|c_k|",
        range: [0, maxMag * 1.18],
        gridcolor: "#333",
        zerolinecolor: "#777",
        automargin: true
      },
      shapes: [
        {
          type: "rect",
          xref: "x",
          yref: "paper",
          x0: -kIncluded - 0.5,
          x1: kIncluded + 0.5,
          y0: 0,
          y1: 1,
          fillcolor: "rgba(66,165,245,0.08)",
          line: { width: 0 },
          layer: "below"
        }
      ]
    };

    Plotly.react(spectrumPlot, traces, layout, {
      displayModeBar: false,
      responsive: true
    });
  }

  function makeReconstructionPlot(type, coeffs, kIncluded) {
    const targetY = plotXs.map((x) => getFunctionValue(type, x));
    const reconY = plotXs.map((x) => reconstructAt(x, coeffs, kIncluded));

    const traces = [
      {
        x: plotXs,
        y: targetY,
        type: "scatter",
        mode: "lines",
        name: "Original target",
        line: {
          color: "rgba(220,220,220,0.75)",
          width: 2,
          dash: "dash"
        },
        hovertemplate: "x=%{x:.3f}<br>target=%{y:.3f}<extra></extra>"
      },
      {
        x: plotXs,
        y: reconY,
        type: "scatter",
        mode: "lines",
        name: `Reconstruction |k| ≤ ${kIncluded}`,
        line: {
          color: "#42a5f5",
          width: 3
        },
        hovertemplate: "x=%{x:.3f}<br>recon=%{y:.3f}<extra></extra>"
      }
    ];

    const yValues = [...targetY, ...reconY];
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const yPad = Math.max(0.2, (yMax - yMin) * 0.12);

    const layout = {
      title: `Reconstruction using frequencies k = -${kIncluded}, ..., ${kIncluded}`,
      paper_bgcolor: "#1b1b1b",
      plot_bgcolor: "#101010",
      font: { color: "#f5f5f5" },
      margin: { t: 42, b: 52, l: 58, r: 18 },
      autosize: true,
      xaxis: {
        title: "x",
        range: [-PI, PI],
        tickvals: [-PI, -PI / 2, 0, PI / 2, PI],
        ticktext: ["-π", "-π/2", "0", "π/2", "π"],
        gridcolor: "#333",
        zerolinecolor: "#777",
        automargin: true
      },
      yaxis: {
        title: "amplitude",
        range: [yMin - yPad, yMax + yPad],
        gridcolor: "#333",
        zerolinecolor: "#777",
        automargin: true
      },
      legend: {
        orientation: "h",
        y: -0.24
      }
    };

    Plotly.react(reconstructionPlot, traces, layout, {
      displayModeBar: false,
      responsive: true
    });
  }

  function notifyParentHeight() {
    const height = Math.ceil(document.documentElement.scrollHeight);

    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: "fourier-widget-resize",
          id: "fourier-spectrum-widget",
          height
        },
        "*"
      );
    }
  }

  function resizePlots() {
    if (!window.Plotly) return;

    Plotly.Plots.resize(spectrumPlot);
    Plotly.Plots.resize(reconstructionPlot);
  }

  function scheduleResize() {
    if (resizeRaf !== null) {
      cancelAnimationFrame(resizeRaf);
    }

    resizeRaf = requestAnimationFrame(() => {
      resizePlots();
      notifyParentHeight();
      resizeRaf = null;
    });
  }

  function updateWidget() {
    const type = functionSelect.value;
    const kIncluded = Number(kSlider.value);

    kRangeDisplay.textContent = `-${kIncluded} to ${kIncluded}`;

    const coeffs = computeCoefficients(type);

    renderFormula(type, kIncluded);
    makeSpectrumPlot(type, coeffs, kIncluded);
    makeReconstructionPlot(type, coeffs, kIncluded);

    scheduleResize();
  }

  functionSelect.addEventListener("change", updateWidget);
  kSlider.addEventListener("input", updateWidget);

  if (window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(scheduleResize);

    [widget, spectrumPlot, reconstructionPlot].forEach((el) => {
      if (el) resizeObserver.observe(el);
    });
  }

  window.addEventListener("resize", scheduleResize);

  updateWidget();
});
