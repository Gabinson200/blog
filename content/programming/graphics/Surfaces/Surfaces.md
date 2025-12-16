# Surfaces


## Check out my [parametric surface visualizer](https://gabinson200.github.io/parametric_surface_visualizer/) website


## Core Representations: Implicit vs. Parametric

There are two primary mathematical frameworks for defining 3D surfaces.

---
| Feature | **Implicit Representation** | **Parametric Representation** |
| :---    | :---                        | :--- |
| **Definition** | A scalar function $f(x,y,z) = 0$ that defines a surface as a level set. | A vector-valued function $p(t)$ or $p(u, v)$ that maps free parameters to points in 3D space. |
| **Use** | Used to test if a point is on ($=0$), inside ($<0$), or outside ($>0$) the surface. | Used to sample points on the surface. |
| **Example (Line)** | $f(x,y) = y - mx - b = 0$ | $p(t) = p_0 + t(p_1 - p_0)$. |
---

## 3D Primitives & Equations

### Spheres
#### Implicit Equation:
For a sphere centered at the origin with radius $r$:
$$f(x,y,z) = x^2 + y^2 + z^2 - r^2 = 0$$ 
For a sphere with center $C = (C_x, C_y, C_z)$:
$$(x-C_x)^2 + (y-C_y)^2 + (z-C_z)^2 = r^2$$ 

#### Parametric Equation:
Using latitude $\phi$ and longitude $\theta$:
$$
\begin{aligned}
x &= r \cos\phi \cos\theta \\
y &= r \cos\phi \sin\theta \\
z &= r \sin\phi
\end{aligned}
$$
Ranges $-\frac{\pi}{2} \le \phi \le \frac{\pi}{2}$ and $-\pi \le \theta \le \pi$.
Tessellation: You can generate a triangle mesh by looping through $\phi$ and $\theta$ steps.

### Ellipsoids
An ellipsoid is a sphere scaled by different radii ($r_x, r_y, r_z$) along the axes.

#### Implicit Equation:
$$f(x,y,z) = \left(\frac{x}{r_x}\right)^2 + \left(\frac{y}{r_y}\right)^2 + \left(\frac{z}{r_z}\right)^2 - 1 = 0$$

#### Parametric Equation:
$$
\begin{aligned}
x &= r_x \cos\phi \cos\theta \\
y &= r_y \cos\phi \sin\theta \\
z &= r_z \sin\phi
\end{aligned}
$$

### Cylinders
A cylinder is often defined as a circle extruded along an axis.

#### Implicit Equation (Infinite, along z-axis):
$$x^2 + y^2 - r^2 = 0$$
Note: $z$ is absent because the cross-section is constant.

#### Parametric Equation:
$$
\begin{aligned}
x &= r \cos\theta \\
y &= r \sin\theta \\
z &= u
\end{aligned}
$$
Ranges:
$-\pi \le \theta \le \pi$ and $u_{min} \le u \le u_{max}$ for a finite cylinder.

### Cones
A cone is like a cylinder where the radius scales linearly with the height ($z$).

#### Implicit Equation:
$$f(x,y,z) = \left(\frac{x}{r}\right)^2 + \left(\frac{y}{r}\right)^2 - z^2 = 0$$

#### Parametric Equation:
$$
\begin{aligned}
x &= (r u) \cos\theta \\
y &= (r u) \sin\theta \\
z &= u
\end{aligned}
$$
Note: the radius is a function of $u$ (the height).

### Tori (Donut Shapes)
A torus is a "revolved surface" created by spinning a circle of radius $r$ (at distance $R$ from the origin) around the z-axis.

#### Parametric Equation:
$$
\begin{aligned}
x &= (R + r \cos\phi) \cos\theta \\
y &= (R + r \cos\phi) \sin\theta \\
z &= r \sin\phi
\end{aligned}
$$

#### Implicit Derivation:
The distance from a point $(x,y)$ to the axis is $\sqrt{x^2+y^2}$. The distance from that point to the tube center must be the tube radius $r$.
$$(\sqrt{x^2+y^2} - R)^2 + z^2 - r^2 = 0$$


### Texture Mapping:
Parametric variables such as $(\theta, \phi)$ can be mapped to texture coordinates $(u, v)$ by mapping the values in the range of one variable to the range of the other.
* $(u,v)=(1,1) \iff (\theta, \phi)=(\pi, \frac{\pi}{2})$.
* $(u,v)=(0,0) \iff (\theta, \phi)=(-\pi, -\frac{\pi}{2})$.

---

## Quadric Surfaces

Quadric surfaces are defined by second-degree implicit equations(Spheres, Cylinders, Ellipsoids, and Cones) and can be written in matrix form:
$$P^T Q P = 0$$
Where $P = [x, y, z, 1]^T$ and $Q$ is a $4 \times 4$ symmetric matrix.

$$
Q = \begin{bmatrix}
A & B & C & D \\
B & E & F & G \\
C & F & H & I \\
D & G & I & J
\end{bmatrix}
$$

Thus
$$P^T Q P = 
\begin{aligned}
Ax^2 + 2Bxy + 2Cxz + 2Dx + \\
Ey^2 + 2Fyz + 2Gy + \\
Hz^2+2Iz + \\
J
\end{aligned}
$$


#### Sphere Matrix:
For $x^2 + y^2 + z^2 - r^2 = 0$, the matrix $Q$ is diagonal:
$$
Q = \begin{bmatrix}
1 & 0 & 0 & 0 \\
0 & 1 & 0 & 0 \\
0 & 0 & 1 & 0 \\
0 & 0 & 0 & -r^2
\end{bmatrix}
$$

#### Ellipsoid Matrix:
$$
Q = \begin{bmatrix}
(1/r_x)^2 & 0 & 0 & 0 \\
0 & (1/r_y)^2 & 0 & 0 \\
0 & 0 & (1/r_z)^2 & 0 \\
0 & 0 & 0 & -1
\end{bmatrix}
$$

#### Cylinder Matrix:
$$
Q = \begin{bmatrix}
1 & 0 & 0 & 0 \\
0 & 1 & 0 & 0 \\
0 & 0 & 0 & 0 \\
0 & 0 & 0 & -r^2
\end{bmatrix}
$$
Note: The $z$ term is 0 because the cylinder extends infinitely along z

---

## Surface Normals

Surface normals are critical for lighting, shading, and physics.

### Parametric Normals
Given we have sampled some points along a surface we would like to find the normals at the points. To find the normal of a parametric surface $p(u, v)$, calculate the cross product of the partial derivatives (tangent vectors). Geometrically this makes sense, since the two parameters define points on the 2D surface where their derivatives gives the tangent of the surface at that point, then a cross-product between them will yield a vector perpendicular to the surface.
Note: We will usually ahve to normalize the normal.

$$n(u,v) = \frac{\partial p}{\partial u} \times \frac{\partial p}{\partial v}$$

> Example: (Sphere)
Computing $\frac{\partial p}{\partial \phi} \times \frac{\partial p}{\partial \theta}$ yields:

$$n(\phi, \theta) = 
\begin{bmatrix}
-r \sin\phi \cos\theta \\
-r \sin\phi \sin\theta \\
r \cos\phi \end{bmatrix}
\times
\begin{bmatrix} 
-r \cos\phi \sin\theta \\ 
r \cos\phi \cos\theta \\
0 
\end{bmatrix}
$$
    
> Which simplifies to a normalized vector:
$$\hat{n}(\phi, \theta) = 
\begin{bmatrix}
\cos\phi \cos\theta \\
\cos\phi \sin\theta \\
\sin\phi 
\end{bmatrix}$$

#### Implicit Normals
To find the normal of an implicit surface $f(x,y,z)=0$, simply calculate the gradient $\nabla f$.

$$n(x,y,z) =
\nabla f(x,y,z) = 
\begin{bmatrix}
\frac{\partial f}{\partial x} \\ 
\frac{\partial f}{\partial y} \\
\frac{\partial f}{\partial z} 
\end{bmatrix}$$

> Example (Sphere):
$$f = x^2 + y^2 + z^2 - r^2$$
$$
n = \nabla f = 
\begin{bmatrix}
2x \\ 2y \\ 2z 
\end{bmatrix}
$$

#### Quadric Normals:
For $P^T Q P = 0$, the normal is derived as:
$$n(P) = \nabla(P^T Q P) = 2 Q P$$
