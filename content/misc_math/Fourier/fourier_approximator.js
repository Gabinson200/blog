window.addEventListener("DOMContentLoaded", () => {
  const waveTypeSelect = document.getElementById("wave-type");
  const kSlider = document.getElementById("k-slider");
  const kDisplay = document.getElementById("k-display");
  const formulaDiv = document.getElementById("formula");
  const targetEquationDiv = document.getElementById("target-equation");

  const PI = Math.PI;
  const TWO_PI = 2 * Math.PI;

  const xValues = linspace(-2 * PI, 2 * PI, 1000);

  const complexCoefficients = {
    1: { an: 0.55, bn: 0.35 },
    2: { an: -0.25, bn: 0.30 },
    3: { an: 0.22, bn: -0.18 },
    4: { an: 0.00, bn: 0.16 },
    5: { an: -0.14, bn: 0.00 },
    6: { an: 0.10, bn: 0.09 },
    7: { an: 0.00, bn: -0.08 },
    8: { an: 0.07, bn: 0.00 }
  };

  function linspace(start, end, count) {
    const values = [];
    const step = (end - start) / (count - 1);

    for (let i = 0; i < count; i++) {
      values.push(start + i * step);
    }

    return values;
  }

  function wrapToPi(x) {
    return ((x + PI) % TWO_PI + TWO_PI) % TWO_PI - PI;
  }

  function numberLatex(value) {
    if (Math.abs(value) < 1e-12) return "0";

    const rounded = Number(value.toFixed(3));

    if (Number.isInteger(rounded)) {
      return `${rounded}`;
    }

    return `${rounded}`;
  }

  function getA0(type) {
    if (type === "complex") {
      return 0.50; // actual displayed constant is a0 / 2 = 0.25
    }

    return 0;
  }

  function targetValue(type, x) {
    const w = wrapToPi(x);

    if (type === "complex") {
      let y = getA0(type) / 2;

      for (let n = 1; n <= 8; n++) {
        const { an, bn } = getCoefficients(type, n);
        y += an * Math.cos(n * x) + bn * Math.sin(n * x);
      }

      return y;
    }

    if (type === "square") {
      const s = Math.sin(x);
      if (Math.abs(s) < 1e-12) return 0;
      return s > 0 ? 1 : -1;
    }

    if (type === "sawtooth") {
      return w / PI;
    }

    return 0;
  }

  function getCoefficients(type, n) {
    if (type === "complex") {
      return complexCoefficients[n] || { an: 0, bn: 0 };
    }

    if (type === "square") {
      return {
        an: 0,
        bn: n % 2 === 1 ? 4 / (n * PI) : 0
      };
    }

    if (type === "sawtooth") {
      return {
        an: 0,
        bn: (2 / (n * PI)) * (n % 2 === 1 ? 1 : -1)
      };
    }

    return { an: 0, bn: 0 };
  }

  function approximationValue(type, x, kMax) {
    let y = getA0(type) / 2;

    for (let n = 1; n <= kMax; n++) {
      const { an, bn } = getCoefficients(type, n);
      y += an * Math.cos(n * x) + bn * Math.sin(n * x);
    }

    return y;
  }

  function coefficientLatex(type, n, kind) {
    if (type === "complex") {
      const { an, bn } = getCoefficients(type, n);
      const value = kind === "cos" ? an : bn;

      if (Math.abs(value) < 1e-14) return "";
      return numberLatex(value);
    }

    if (type === "square" && kind === "sin" && n % 2 === 1) {
      return `\\frac{4}{${n === 1 ? "" : n}\\pi}`;
    }

    if (type === "sawtooth" && kind === "sin") {
      const sign = n % 2 === 1 ? "" : "-";
      return `${sign}\\frac{2}{${n === 1 ? "" : n}\\pi}`;
    }

    return "";
  }

  function appendTerm(terms, coeffLatex, trigLatex) {
    if (!coeffLatex) return;

    const isNegative = coeffLatex.startsWith("-");
    const cleanCoeff = isNegative ? coeffLatex.slice(1) : coeffLatex;

    let term;

    if (cleanCoeff === "1") {
      term = trigLatex;
    } else {
      term = `${cleanCoeff}${trigLatex}`;
    }

    if (terms.length === 0) {
      terms.push(isNegative ? `-${term}` : term);
    } else {
      terms.push(isNegative ? `- ${term}` : `+ ${term}`);
    }
  }

  function buildApproximationFormula(type, kMax) {
    const terms = [];

    const constantValue = getA0(type) / 2;
    terms.push(numberLatex(constantValue));

    for (let n = 1; n <= kMax; n++) {
      const { an, bn } = getCoefficients(type, n);

      if (Math.abs(an) > 1e-14) {
        const coeff = coefficientLatex(type, n, "cos");
        const arg = n === 1 ? "x" : `${n}x`;
        appendTerm(terms, coeff, `\\cos(${arg})`);
      }

      if (Math.abs(bn) > 1e-14) {
        const coeff = coefficientLatex(type, n, "sin");
        const arg = n === 1 ? "x" : `${n}x`;
        appendTerm(terms, coeff, `\\sin(${arg})`);
      }
    }

    return `f(x)\\approx ${terms.join(" ")}`;
  }

  function buildTargetEquation(type) {
    if (type === "complex") {
      return (
        `f(x)=0.25+0.55\\cos(x)+0.35\\sin(x)-0.25\\cos(2x)+0.30\\sin(2x)` +
        `+0.22\\cos(3x)-0.18\\sin(3x)+0.16\\sin(4x)` +
        `-0.14\\cos(5x)+0.10\\cos(6x)+0.09\\sin(6x)-0.08\\sin(7x)+0.07\\cos(8x)`
      );
    }

    if (type === "square") {
      return `f(x)=\\operatorname{sgn}(\\sin x)`;
    }

    if (type === "sawtooth") {
      return `f(x)=\\frac{x}{\\pi},\\qquad -\\pi < x \\le \\pi \\quad \\text{with periodic extension}`;
    }

    return "";
  }

  function getWaveTitle(type) {
    if (type === "complex") return "Complex Mixed Sine/Cosine Function";
    if (type === "square") return "Square Wave";
    if (type === "sawtooth") return "Sawtooth Wave";
    return "Wave";
  }

  function renderLatex(target, latex) {
    if (window.katex) {
      katex.render(latex, target, {
        throwOnError: false,
        displayMode: true
      });
    } else {
      target.textContent = latex;
    }
  }

  function updateFormula(type, kMax) {
    renderLatex(targetEquationDiv, buildTargetEquation(type));
    renderLatex(formulaDiv, buildApproximationFormula(type, kMax));
  }

  function updatePlot(type, kMax) {
    const targetY = xValues.map((x) => targetValue(type, x));
    const approxY = xValues.map((x) => approximationValue(type, x, kMax));

    const traces = [
      {
        x: xValues,
        y: targetY,
        type: "scatter",
        mode: "lines",
        name: "Ideal target",
        line: {
          color: "rgba(220, 220, 220, 0.75)",
          width: 2,
          dash: "dash"
        },
        hovertemplate: "x: %{x:.3f}<br>target: %{y:.3f}<extra></extra>"
      },
      {
        x: xValues,
        y: approxY,
        type: "scatter",
        mode: "lines",
        name: `Fourier approximation, k=${kMax}`,
        line: {
          color: "#42a5f5",
          width: 3
        },
        hovertemplate: "x: %{x:.3f}<br>approx: %{y:.3f}<extra></extra>"
      }
    ];

    const layout = {
      title: `${getWaveTitle(type)} Approximation`,
      paper_bgcolor: "#121212",
      plot_bgcolor: "#121212",
      font: { color: "#f5f5f5" },
      margin: { t: 45, b: 55, l: 58, r: 20 },
      xaxis: {
        title: "x",
        range: [-2 * PI, 2 * PI],
        tickvals: [-2 * PI, -PI, 0, PI, 2 * PI],
        ticktext: ["-2π", "-π", "0", "π", "2π"],
        gridcolor: "#333",
        zerolinecolor: "#777",
        automargin: true
      },
      yaxis: {
        title: "f(x)",
        range: [-2, 2],
        gridcolor: "#333",
        zerolinecolor: "#777",
        automargin: true
      },
      legend: {
        orientation: "h",
        y: -0.22
      }
    };

    Plotly.react("plot", traces, layout, {
      displayModeBar: false,
      responsive: true
    });
  }

  function updateWidget() {
    const type = waveTypeSelect.value;
    const kMax = Number(kSlider.value);

    kDisplay.textContent = kMax.toString();

    updatePlot(type, kMax);
    updateFormula(type, kMax);
  }

  waveTypeSelect.addEventListener("change", updateWidget);
  kSlider.addEventListener("input", updateWidget);

  window.addEventListener("resize", () => {
    if (window.Plotly) {
      Plotly.Plots.resize("plot");
    }
  });

  updateWidget();
});
