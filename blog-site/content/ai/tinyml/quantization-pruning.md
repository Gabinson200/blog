---
title: "Model Quantization and Pruning for TinyML"
date: "2025-09-12"
tags: ["ai", "tinyml", "optimization"]
links: ["gesture-recognition"]
---

## Why Optimise Models?

Embedded devices have limited memory and computational resources. To run neural networks on such hardware we often need to shrink the model without sacrificing too much accuracy. Two common techniques are quantisation and pruning.

### Quantisation

Quantisation reduces the precision of model weights and activations, typically from 32‑bit floating point to 8‑bit integers. This can dramatically reduce model size and inference latency while enabling the use of efficient integer arithmetic.

### Pruning

Pruning removes unimportant connections in the network, resulting in sparse weight matrices. Combined with specialised sparse kernels, pruning can accelerate inference and reduce memory footprint.

### Putting It All Together

By applying quantisation and pruning to your TinyML models you can achieve orders‑of‑magnitude reductions in model size. Be sure to evaluate the impact on accuracy and experiment with different sparsity levels.