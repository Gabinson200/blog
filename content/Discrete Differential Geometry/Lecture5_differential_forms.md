# Differential Forms (Discrete Differential Geometry / DEC)

## Goal + motivation
**Goal:** develop **Discrete Exterior Calculus (DEC)** — a language that lets us replace “by-hand” vector calculus with **computations on meshes** (edges, triangles, tetrahedra, …).

**Why forms?** Many geometric/physical quantities are naturally “k-dimensional measurements” (flux through an area, circulation along a curve, volume density, curvature-like quantities). Differential forms are built to represent **k-dimensional quantities varying over space (and time)**.


## Recap: exterior algebra / forms
- **k-vectors**: “little oriented k-volumes” built from vectors via the **wedge product**; they carry **magnitude + orientation**.
- **Hodge star**: describes **complementary volumes** (orthogonal complement + orientation convention).
- **k-forms**: “little measurement devices” for k-vectors. A key mental model is: **project** the k-vector onto the k-form’s directions and compute the resulting k-volume (determinant-style).


## Flat vs. curved spaces (why this matters later)
For now we work in flat spaces (like the plane) to keep things simple; the big payoff is on curved spaces where vectors and forms are no longer “basically the same,” and the distinction ties closely to curvature (geometry) and mass (physics).


## What is a differential k-form?
A **differential k-form** is an **assignment of a k-form to each point** in space (a “field of k-forms”). People often shorten “differential k-form” to just “k-form” (context-dependent, mildly confusing).

### Examples
- **Differential 0-form**: a scalar at each point, just a **scalar function**.
- **Differential 1-form**: a 1-form (covector) at each point, not the same as a vector field even if drawings look similar. A 1-form is a linear map “vector to scalar” at each point.
- **Differential 2-form** (in 3D): an area measurement at each point; measuring a 2-vector field against it produces a scalar function describing how much they “line up.”


## Measuring fields with forms

### 1-forms measure vector fields
Given a differential 1-form $\alpha$ and a vector field $X$, the value
$ \alpha(X) $ is a **scalar function** (a 0-form): at each point it tells “how strong the flow of $X$ is along the direction specified by $\alpha$.”

### 2-forms measure 2-vector fields (and give scalar functions)
A differential 2-form measures a 2-vector field pointwise; the output is again a scalar function describing alignment / signed area captured.


## Pointwise operations
Most operations on differential forms are just the usual finite-dimensional operations applied at each point:
- $(\star \alpha)_p := \star(\alpha_p)$
- $(\alpha \wedge \beta)_p := \alpha_p \wedge \beta_p$
- $\alpha(X_1,\dots,X_k)_p := \alpha_p\big((X_1)_p,\dots,(X_k)_p\big)$

Notation convention: we usually **omit** the point $p$ and write $\star\alpha$, $\alpha\wedge\beta$, $\alpha(X,Y)$, etc.


## Differential forms in coordinates

### Basis vector fields
In $\mathbb{R}^n$, the standard basis for vector fields are constant unit fields along coordinate axes, traditionally written like:
$ \frac{\partial}{\partial x^1},\dots,\frac{\partial}{\partial x^n}. $
You’ll save yourself pain by treating these as basis vector fields first (not “derivatives”) until the notation becomes natural.

Any vector field expands as
$X = \sum_i a^i(x)\,\frac{\partial}{\partial x^i},$
where the coefficients $a^i(x)$ are **functions** (they vary over space).

### Basis 1-forms and duality
The dual basis of differential 1-forms is written
$ dx^1,\dots,dx^n, $
and is characterized by the duality rule
$ dx^i\!\left(\frac{\partial}{\partial x^j}\right)=\delta^i_j \quad(\text{pointwise}). $
Interpretation: $dx^i$ measures the $i$-th coordinate component of a vector field.

### Why do these symbols look like derivatives?
Because the derivative of each coordinate function yields a constant basis field.
Also, if you switch coordinate systems $(x^i)$ vs $(y^i)$, the notation keeps bases unambiguous.

## Examples

### Example A: Hodge star of a 1-form in 2D
In 2D, the 1-form Hodge star acts like a **quarter-turn** (with sign convention). So if $\alpha$ is a spatially varying 1-form, $\star \alpha$ is obtained by rotating each little measurement arrow accordingly.

### Example B: Wedge of two 1-forms (gives a 2-form)
Taking $\alpha\wedge\beta$ pointwise yields a **differential 2-form**. In the plane, **every 2-form is a scalar multiple of $dx\wedge dy$**. So typically:
$ \alpha\wedge\beta = f(x,y)\,dx\wedge dy $
for some scalar function $f$.

### Volume form (top-degree form)
In $n$ dimensions, any **positive multiple** of the standard top-form is called a **volume form**, giving a meaningful notion of (nonnegative) volume.

---

## Big-picture summary
We build the whole tower as:
1. Start with a vector space $V$ (e.g., $\mathbb{R}^n$).
2. **1-forms**: dual space $V^*$ = covectors = linear measurements of vectors.
3. **k-forms**: wedge together $k$ covectors to measure k-dimensional volumes.
4. **Differential k-forms**: put a k-form at **each point** in space.

**Next:** exterior calculus will define how these forms **change** (generalizing divergence/curl), then DEC discretizes everything on meshes.
