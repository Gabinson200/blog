---
title: "Gesture Recognition on Microcontrollers"
date: "2025-09-01"
tags: ["ai", "tinyml", "gesture"]
links: []
---

## Overview

Gesture recognition allows devices to respond to human motions without the need for buttons or touchscreens. In this tutorial we'll build a simple classifier that recognises a few hand gestures using accelerometer data and deploy it on a microcontroller.

### Collecting Data

Use an accelerometer connected to your development board (e.g. ESP32 or nRF52840) to record sequences of XYZ acceleration values for each gesture. Be sure to capture multiple examples to account for variation.

### Training the Model

We'll use TensorFlow Lite Micro to train a lightweight neural network. Preprocess the data by normalising each axis and segmenting into windows.

### Deployment

After training, convert the model to a TFLite format with 8‑bit quantisation and integrate it into your firmware. Test the classifier in real time and refine as necessary.