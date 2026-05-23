window.addEventListener("DOMContentLoaded", () => {
  const type1Select = document.getElementById("type1");
  const type2Select = document.getElementById("type2");
  const freq1Slider = document.getElementById("freq1");
  const freq2Slider = document.getElementById("freq2");
  const freq1Val = document.getElementById("freq1-val");
  const freq2Val = document.getElementById("freq2-val");
  const resultDisplay = document.getElementById("integral-result");

  const numPoints = 1200;
  const minX = -Math.PI;
  const maxX = Math.PI;
  const dx = (maxX - minX) / (numPoints - 1);

  const xValues = Array.from(
    { length: numPoints },
    (_, i) => minX + i * dx
  );

  function applyTrig(type, value) {
    return type === "sin" ? Math.sin(value) : Math.cos(value);
  }

  function waveLabel(type, frequency) {
    const name = type === "sin" ? "sin" : "cos";
    return `${name}(${frequency}x)`;
  }

  function resizePlots() {
    if (!window.Plotly) {
      return;
    }

    Plotly.Plots.resize("plot-waves");
    Plotly.Plots.resize("plot-product");
  }

  function updatePlots() {
    if (!window.Plotly) {
      resultDisplay.textContent = "Plotly failed to load.";
      resultDisplay.style.color = "#ef5350";
      return;
    }

    const type1 = type1Select.value;
    const type2 = type2Select.value;
    const m = Number(freq1Slider.value);
    const n = Number(freq2Slider.value);

    freq1Val.textContent = m;
    freq2Val.textContent = n;

    const y1 = [];
    const y2 = [];
    const yProduct = [];
    const yProductPositive = [];
    const yProductNegative = [];

    let integralSum = 0;

    for (let i = 0; i < xValues.length; i++) {
      const x = xValues[i];

      const val1 = applyTrig(type1, m * x);
      const val2 = applyTrig(type2, n * x);
      const product = val1 * val2;

      y1.push(val1);
      y2.push(val2);
      yProduct.push(product);

      yProductPositive.push(product >= 0 ? product : 0);
      yProductNegative.push(product < 0 ? product : 0);

      const trapezoidWeight = i === 0 || i === xValues.length - 1 ? 0.5 : 1;
      integralSum += trapezoidWeight * product * dx;
    }

    if (Math.abs(integralSum) < 1e-10) {
      integralSum = 0;
    }

    resultDisplay.textContent =
      integralSum.toFixed(3) + (integralSum === 0 ? " (Orthogonal)" : "");

    resultDisplay.style.color = integralSum === 0 ? "#66bb6a" : "#ef5350";

    const commonLayout = {
    paper_bgcolor: "#121212",
    plot_bgcolor: "#121212",
    font: { color: "#f5f5f5" },
    margin: { t: 42, b: 78, l: 72, r: 26 },
    hovermode: "closest",
    xaxis: {
        title: "x",
        range: [-Math.PI, Math.PI],
        tickvals: [-Math.PI, 0, Math.PI],
        ticktext: ["-π", "0", "π"],
        gridcolor: "#333",
        zerolinecolor: "#666",
        ticks: "outside",
        ticklen: 6,
        automargin: true
    },
    yaxis: {
        range: [-1.2, 1.2],
        gridcolor: "#333",
        zerolinecolor: "#666",
        ticks: "outside",
        ticklen: 8,
        ticklabelposition: "outside",
        automargin: true
    },
    legend: {
        orientation: "h",
        y: -0.28
    }
    };

    const trace1 = {
      x: xValues,
      y: y1,
      mode: "lines",
      name: waveLabel(type1, m),
      line: { color: "#42a5f5", width: 2 },
      hovertemplate: "x: %{x:.3f}<br>y: %{y:.3f}<extra>Wave 1</extra>"
    };

    const trace2 = {
      x: xValues,
      y: y2,
      mode: "lines",
      name: waveLabel(type2, n),
      line: { color: "#ffa726", width: 2, dash: "dot" },
      hovertemplate: "x: %{x:.3f}<br>y: %{y:.3f}<extra>Wave 2</extra>"
    };

    Plotly.react(
      "plot-waves",
      [trace1, trace2],
      {
        ...commonLayout,
        title: "Individual Waves"
      },
      {
        displayModeBar: false,
        responsive: true
      }
    );

    const tracePositiveArea = {
      x: xValues,
      y: yProductPositive,
      mode: "none",
      fill: "tozeroy",
      fillcolor: "rgba(102, 187, 106, 0.45)",
      name: "Positive Area",
      hoverinfo: "skip"
    };

    const traceNegativeArea = {
      x: xValues,
      y: yProductNegative,
      mode: "none",
      fill: "tozeroy",
      fillcolor: "rgba(239, 83, 80, 0.45)",
      name: "Negative Area",
      hoverinfo: "skip"
    };

    const traceProductLine = {
      x: xValues,
      y: yProduct,
      mode: "lines",
      name: "Product",
      line: { color: "#eeeeee", width: 2 },
      hovertemplate:
        "x: %{x:.3f}<br>product: %{y:.3f}<extra>Inner product integrand</extra>"
    };

    Plotly.react(
      "plot-product",
      [tracePositiveArea, traceNegativeArea, traceProductLine],
      {
        ...commonLayout,
        title: "Product Wave: Area = Inner Product"
      },
      {
        displayModeBar: false,
        responsive: true
      }
    );

    setTimeout(resizePlots, 50);
  }

  type1Select.addEventListener("change", updatePlots);
  type2Select.addEventListener("change", updatePlots);
  freq1Slider.addEventListener("input", updatePlots);
  freq2Slider.addEventListener("input", updatePlots);

  window.addEventListener("resize", resizePlots);

  updatePlots();
});
