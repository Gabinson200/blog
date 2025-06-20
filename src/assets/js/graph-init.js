// src/assets/js/graph-init.js

document.addEventListener("DOMContentLoaded", () => {
  const dataEl = document.getElementById("graph-data");
  if (!dataEl) {
    console.warn("No #graph-data element found");
    return;
  }

  // Grab and trim the JSON payload
  const raw = dataEl.textContent.trim();
  if (!raw) {
    console.warn("No JSON inside #graph-data");
    return;
  }

  let elements;
  try {
    elements = JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse graph JSON:", e, "\nRaw content:", raw);
    return;
  }

  // Render only if we actually have nodes/edges
  if (!Array.isArray(elements) || !elements.length) {
    console.warn("No graph elements to render", elements);
    return;
  }

  const cy = window.cytoscape({
    container: document.getElementById("graph-container"),
    elements,
    layout:  { name: "cose", animate: true },
    style: [
      {
        selector: "node", style: {
          label:            "data(label)",
          "text-valign":    "center",
          "text-wrap":      "wrap",
          "text-max-width": "80px",
          "font-size":      "8px",
          "background-color":"#60A5FA",
          color:            "#fff",
          width:            "label",
          padding:          "4px"
        }
      },
      {
        selector: "edge", style: {
          width:        1,
          "line-color": "#CBD5E1"
        }
      }
    ]
  });

  cy.on("tap","node", evt => {
    const url = evt.target.data("url");
    if (url) window.location.href = url;
  });
});
