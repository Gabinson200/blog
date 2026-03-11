# Lagrangian Optimization

Lagrangian optimization shows up in many domains such as ML but is not explicitly discussed in those classes even though the concept itself is quite simple. 

## Idea

The idea behind Lagrangian optimization is to optimize (usually minimize) a function with some constraints.

Say we want to minimize a function $f(x, y)$ subject to some constraint $g(x, y) = 0$ that only allows us to select a subset of points from the search space.
$$\text{min}f(x, y) \text{  subject to  } g(x,y) = 0$$

Geometrically $f(x, y)$ can be though of as a 3D topological heightmap where $g(x, y) = 0$ defines a curve on that surface, to which our search space is restricted to. The key insight is that when we move along the constraint curve the gradient $\nabla g$ is perpendicular to $g$ and at the optimum point on $f$ every derivative of $f$ tangent  to the curve must be zero since by definition we are at an optimum. So lets define $t$ as a tangent vector to the constraint curve, then $\nabla g \cdot t = 0$ since gradients are perpendicular to level sets and at the optimum $\nabla f \cdot t = 0$ because the gradient of $f$ is perpendicular to the tangent vector. (Otherwise there would be a better optimum). The only vector orthogonal to all tangent directions of the curve is the normal vector of the curve $\nabla g$ which means that $\nabla f$ must also point in that direction, thus:
$$\nabla f = \lambda \nabla g$$ where $\lambda$ is called the Lagrange multiplier which is just some scalar since we only care about the direction of the normal not its magnitude. 

In practice we can find $\nabla f = \lambda \nabla g$ by computing the piecewise gradient in each dimension giving us 2 equations. But we have 3 unknowns as we also introduced $\lambda$, which we can solve for by adding the constraint equation itself.

Instead of solving the constrained problem directly, we can define a new function:
$$\mathcal{L}(x, y, \lambda) = f(x, y) + \lambda g(x, y)$$
called the Lagrangian.

When we take the gradient of $\mathcal{L}(x, y, \lambda)$ the derivatices respect to all variables are:  
$
\frac{\partial \mathcal{L}}{\partial x} = 0
$,
$
\frac{\partial \mathcal{L}}{\partial y} = 0
$,
$
\frac{\partial \mathcal{L}}{\partial \lambda} = 0
$
where the last equation simply returns the constraint. So writing it in this way allows us to express the gradient of two functions as the taking of the gradient of one function which is especially useful in computer science settings since the solver just has to deal with one function.



