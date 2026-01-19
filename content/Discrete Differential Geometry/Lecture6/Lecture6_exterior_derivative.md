# Lecture 6: Exterior Derivative

## Uses of exterior derivatives (Vector Calculus Review)

Why generalize? Standard vector calculus (grad, div, curl) is hard to apply to general volumes, requires a metric (notion of size/distance), and obscures the distinction between physical quantities (e.g., velocity vs. momentum).

**Derivatives on vector fields (in Coordinates):**
Consider a scalar function $\phi: \mathbb{R}^3 \to \mathbb{R}$ and a vector field $X = u\frac{\partial}{\partial x} + v\frac{\partial}{\partial y} + w\frac{\partial}{\partial z}$.

* **Gradient:** (Points in direction of quickest increase)
    $$\nabla\phi = \frac{\partial\phi}{\partial x}\frac{\partial}{\partial x} + \frac{\partial\phi}{\partial y}\frac{\partial}{\partial y} + \frac{\partial\phi}{\partial z}\frac{\partial}{\partial z}$$

* **Divergence:** (Measures how much the field spreads out)
    $$\nabla \cdot X = \frac{\partial u}{\partial x} + \frac{\partial v}{\partial y} + \frac{\partial w}{\partial z}$$

* **Curl:** (Measures how much the field spins/circulates)
    $$\nabla \times X = \left(\frac{\partial w}{\partial y} - \frac{\partial v}{\partial z}\right)\frac{\partial}{\partial x} + \left(\frac{\partial u}{\partial z} - \frac{\partial w}{\partial x}\right)\frac{\partial}{\partial y} + \left(\frac{\partial v}{\partial x} - \frac{\partial u}{\partial y}\right)\frac{\partial}{\partial z}$$

---

## Exterior Derivative Rules

The exterior derivative $d$ is a unique linear map $d: \Omega^k \to \Omega^{k+1}$ that satisfies the following properties:

1.  **Differential:** For $k=0$ (scalars), the derivative $d\phi(X)$ behaves like the directional derivative:
    $$d\phi(X) = D_X\phi$$

2.  **Product Rule (Leibniz Rule):** The derivative of a wedge product follows a graded product rule:
    $$d(\alpha \wedge \beta) = d\alpha \wedge \beta + (-1)^k \alpha \wedge d\beta$$
    *Note the $(-1)^k$ factor, where $k$ is the degree of form $\alpha$.*

3.  **Exactness:** Applying the derivative twice yields zero:
    $$d \circ d = 0$$

---

## Justification of Exterior Derivative Rules

### 1. Justification for Differential Rule

**Directional Derivative:**
The directional derivative of a scalar function $\phi$ at point $p$ with respect to vector $X$ is the rate at which the function increases as we move away from $p$ with velocity $X$.

$$D_X\phi|_p := \lim_{\epsilon \to 0} \frac{\phi(p + \epsilon X) - \phi(p)}{\epsilon}$$

**Gradient vs. Differential:**
While they look similar, there is a fundamental difference.
* **Gradient ($\nabla \phi$):** Defined via the inner product. It is the unique vector field such that $\langle \nabla \phi, X \rangle = D_X\phi$. **It depends on the metric (geometry/inner product).**
* **Differential ($d\phi$):** Defined directly as the linear map taking vectors to directional derivatives. **It does not depend on the metric (purely topological).**

**Equations:**
* **Gradient:** $\nabla\phi = \sum \frac{\partial \phi}{\partial x^i} \frac{\partial}{\partial x^i}$ (Vector Field)
* **Differential:** $d\phi = \sum \frac{\partial \phi}{\partial x^i} dx^i$ (1-Form)
* **Relationship:** They are linked by the musical isomorphisms (sharp and flat):
    $$(d\phi)^\sharp = \nabla \phi \quad \text{and} \quad (\nabla \phi)^\flat = d\phi$$

### 2. Justification for Product Rule

Geometrically, the product of derivatives relates to how areas/volumes change.
For standard calculus functions $f, g$:
$$(fg)' = f'g + fg'$$
This is visualized as a rectangle with sides $f$ and $g$. The change in area is the sum of the changes to the strips on the sides ($f'g$ and $fg'$). The corner piece ($df \cdot dg$) scales with $h^2$ and vanishes in the limit as $h \to 0$.

**For $k$-forms:**
The exterior derivative of a wedge product $d(\alpha \wedge \beta)$ captures the "growth" of the volume spanned by $\alpha \wedge \beta$. We sum the growth of $\alpha$ wedged with $\beta$, and $\alpha$ wedged with the growth of $\beta$.

**Recursive Evaluation Example:**
The product rule allows us to differentiate complex forms recursively until we reach 0-forms (scalars).
Given 1-forms $\alpha = u dx, \beta = v dy, \gamma = w dz$ and $\omega = \alpha \wedge \beta$:

To find $d(\omega \wedge \gamma)$:
$$d(\omega \wedge \gamma) = (d\omega) \wedge \gamma + (-1)^2 \omega \wedge (d\gamma)$$

We recursively evaluate the terms on the right:
1.  **$d\omega = d(\alpha \wedge \beta)$**:
    $$d\omega = (d\alpha) \wedge \beta + (-1)^1 \alpha \wedge (d\beta)$$
2.  **Base Cases ($d\alpha$, etc.)**:
    $$d\alpha = d(u \wedge dx) = du \wedge dx + u \underbrace{d(dx)}_{0} = du \wedge dx$$
    *Note: $d(dx) = 0$ because $dx$ is a constant basis form.*

  
### 3. Justification for Exactness ($d \circ d = 0$)

The rule $d \circ d = 0$ generalizes vector calculus identities regarding "derivatives of derivatives."

**Analogy to Vector Calculus:**
* **Curl of Gradient is 0:** $\nabla \times (\nabla \phi) = 0$.
    If we take the exterior derivative of a 0-form ($d\phi$), we get a 1-form (analogous to Gradient). If we take $d$ again, we get a 2-form. In $\mathbb{R}^3$, the 2-form $d(d\phi)$ components look like the curl. Thus $d^2=0$ captures $\text{curl}(\text{grad}) = 0$.
* **Divergence of Curl is 0:** $\nabla \cdot (\nabla \times X) = 0$.
    This corresponds to taking $d$ of a 1-form, then taking $d$ again.

**Algebraic Justification:**
If we compute $d(d\phi)$ in coordinates, we get terms involving mixed partial derivatives, e.g., $\frac{\partial^2 \phi}{\partial x \partial y} - \frac{\partial^2 \phi}{\partial y \partial x}$. By equality of mixed partials (Clairaut's theorem), these cancel out to zero.

**Summary of Correspondence:**
* **Gradient:** $\nabla \phi \iff (d\phi)^\sharp$
* **Curl:** $\nabla \times X \iff (\star d X^\flat)^\sharp$
* **Divergence:** $\nabla \cdot X \iff \star d \star X^\flat$
* **Laplacian:** $\Delta = \star d \star d$ (on scalars)
