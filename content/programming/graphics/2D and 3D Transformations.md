# 2D Transformations in Computer Graphics

In computer graphics, transformations are fundamental operations used to manipulate the position, size, and orientation of objects. These transformations are typically represented by matrices, allowing complex operations to be combined efficiently.

## Affine Transformation
An affine transformation is a transformation $T$ that preserves straight lines and parallelism, but not necessarily distances or angles. 

Formally, an affine transformation is an function $f:\mathbb{R}^n \rightarrow \mathbb{R}^n$ of the form: 
$$f(x) = Ax+b$$
where:
- $A$ is an $n \times n$ linear transformation matrix (rotation, scaling, shear, reflection, etc.)
- $b$ is an $n \times 1$ translation vector. 

Examples of affine transformations:  
![affine transformations](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcaJ-AwcJM1icCEud5t4cc9cIPOuQfZ5HsTA&s)

## Homogeneous Coordinates

While basic operations like scaling and rotation can be represented by $2 \times 2$ matrices, translation cannot; it requires vector addition ($p' = p + t$). To unify all transformations into a single matrix multiplication framework, we use **homogeneous coordinates**. This is achieved by representing a 2D point $(x, y)$ as a 3D vector $(x, y, 1)$. This allows us to use $3 \times 3$ matrices for all 2D affine transformations.

An affine transformation matrix in homogeneous coordinates has the general form:
$$\begin{pmatrix} a & b & t_x \\\ d & e & t_y \\\ 0 & 0 & 1 \end{pmatrix} \begin{pmatrix} x \\\ y \\\ 1 \end{pmatrix} = \begin{pmatrix} x' \\\ y' \\\ 1 \end{pmatrix}$$
The final row is always $(0, 0, 1)$ for affine transformations.

---

# Basic (Affine) 2D Transformations

## Translation
Translation moves an object from one position to another without changing its orientation or size. This is done by adding a translation vector $(t_x, t_y)$ to the point's coordinates.

**Homogeneous Translation Matrix:**
    $$T(t_x, t_y) = \begin{pmatrix} 1 & 0 & t_x \\\ 0 & 1 & t_y \\\ 0 & 0 & 1 \end{pmatrix}$$

## Scaling
Scaling changes the size of an object. It can be uniform (scaling by the same factor in all directions) or non-uniform. The operation is centered on the origin.

**Homogeneous Scaling Matrix:**
    $$S(s_x, s_y) = \begin{pmatrix} s_x & 0 & 0 \\\ 0 & s_y & 0 \\\ 0 & 0 & 1 \end{pmatrix}$$

**Mirroring (Reflection)**: Mirroring is a special case of scaling where one of the scale factors is -1. For example, $S(-1, 1)$ mirrors an object across the y-axis.

## Rotation
Rotation changes the orientation of an object by rotating it around a point, typically the origin, by an angle $\theta$. The derivation uses polar coordinates and trigonometric identities. A point $(x, y)$ is rotated to $(x', y')$ by:

$$x' = x \cos\theta - y \sin\theta$$
$$y' = x \sin\theta + y \cos\theta$$

**Homogeneous Rotation Matrix (for counter-clockwise rotation):**
    $$R(\theta) = \begin{pmatrix} \cos\theta & -\sin\theta & 0 \\\ \sin\theta & \cos\theta & 0 \\\ 0 & 0 & 1 \end{pmatrix}$$

## Shearing
Shearing skews an object; the effect is like pushing a deck of cards from the side. The amount of distortion depends on the point's distance from an invariant axis.


**Horizontal Shear (x-shear):** Shifts x-coordinates based on the y-coordinate. The x-axis is invariant.

$$Sh_x(\beta) = \begin{pmatrix} 1 & \alpha & 0 \\\ 0 & 1 & 0 \\\ 0 & 0 & 1 \end{pmatrix}
\implies
\begin{pmatrix} x' \\\ y' \\\ 1 \end{pmatrix} = \begin{pmatrix} x + \alpha y \\\ y \\\ 1 \end{pmatrix}$$ 

**Vertical Shear (y-shear):** Shifts y-coordinates based on the x-coordinate. The y-axis is invariant.
    $$Sh_y(\beta) = \begin{pmatrix} 1 & 0 & 0 \\\ \beta & 1 & 0 \\\ 0 & 0 & 1 \end{pmatrix}$$

---

## Properties of Transformation Matrices

### The Orthonormal Rotation Matrix
A rotation matrix is a special type of matrix known as **orthonormal**. This means its column vectors (and row vectors) are **mutually orthogonal** (their dot product is 0) and are all **unit vectors** (their magnitude is 1).

A key property of any orthonormal matrix $R$ is that its inverse is simply its transpose:
$$R^{-1} = R^T$$
This is computationally very efficient, as finding the transpose is much faster than calculating a general matrix inverse.

### Inverse Transformations
The inverse of a transformation, $M^{-1}$, is a transformation that undoes the original one, such that $M^{-1}M = I$ (the identity matrix).

* **Translation Inverse**: $T(t_x, t_y)^{-1} = T(-t_x, -t_y)$
* **Scaling Inverse**: $S(s_x, s_y)^{-1} = S(1/s_x, 1/s_y)$.
* **Rotation Inverse**: $R(\theta)^{-1} = R(-\theta) = R(\theta)^T$.

---

## Composing and Chaining Transformations

### Transformations About a Pivot Point
Standard scaling and rotation operations occur relative to the origin. To rotate or scale an object around an arbitrary **pivot point** $(x_c, y_c)$, we must compose several transformations:

1.  **Translate** the object so the pivot point moves to the origin: $T_{in} = T(-x_c, -y_c)$.
2.  **Perform** the desired scaling or rotation: $S(s_x, s_y)$ or $R(\theta)$.
3.  **Translate** the object back to its original position: $T_{out} = T(x_c, y_c)$.

The final transformation matrix $M$ is the product of these individual matrices. Because matrices are applied from right to left, the order is crucial:

$$M = T_{out} \cdot S \cdot T_{in} \quad \text{or} \quad M = T_{out} \cdot R \cdot T_{in}$$
It's far more efficient to pre-multiply these matrices to get a single composite matrix $M$, which can then be applied to every vertex of the object.

### Hierarchical Transformations (Scene Graphs)
Complex objects, like characters or robots, are often modeled as a hierarchy of parts. For example, a character's lower arm moves with the upper arm, and both move with the torso. This relationship can be represented as a tree structure or **scene graph**.


* **Nodes** in the tree represent the geometry of a part (e.g., "Left Upper Arm").
* **Edges** in the tree represent the transformation matrix that positions a child relative to its parent.

To find the final position of a part in the world, you "walk up the chain" from the part to the root of the tree, multiplying the transformation matrices along the way. For a point $p$ on the hand, its final world position $p''$ would be:

$$p'' = M_{Shoulder} \cdot M_{Elbow} \cdot p$$
This structure allows for complex, articulated motion where transforming a parent automatically transforms all of its children.

---

# 3D Transformations in Computer Graphics

Just as in 2D, transformations in 3D graphics manipulate objects in space — translating, rotating, scaling, and shearing them. However, instead of $(3 \times 3)$ matrices, 3D transformations use $(4 \times 4)$ homogeneous matrices so that **translation** can also be expressed as a matrix operation.

A 3D point ((x, y, z)) is represented in homogeneous coordinates as:
$$
\begin{pmatrix} x \\\ y \\\ z \\\ 1 \end{pmatrix}
$$

and transformed as:

$$
\begin{pmatrix} x' \\\ y' \\\ z' \\\ 1 \end{pmatrix}
= M
\begin{pmatrix} x \\ y \\ z \\ 1 \end{pmatrix}
$$

Any 3D affine transformation can be represented as:

$$
M =
\begin{pmatrix}
a_{11} & a_{12} & a_{13} & t_x \\
a_{21} & a_{22} & a_{23} & t_y \\
a_{31} & a_{32} & a_{33} & t_z \\
0 & 0 & 0 & 1
\end{pmatrix}
$$

where the upper-left $(3 \times 3)$ submatrix encodes **rotation, scaling, and shear**,
and the last column encodes **translation**.

---

## Translation

Translation moves an object by a displacement vector $(t_x, t_y, t_z)$.

**Homogeneous Translation Matrix:**

$$
T(t_x, t_y, t_z) =
\begin{pmatrix}
1 & 0 & 0 & t_x \\
0 & 1 & 0 & t_y \\
0 & 0 & 1 & t_z \\
0 & 0 & 0 & 1
\end{pmatrix}
$$

$$
\begin{pmatrix} x' \\ y' \\ z' \\ 1 \end{pmatrix}
=
T(t_x, t_y, t_z)
\begin{pmatrix} x \\ y \\ z \\ 1 \end{pmatrix}
=
\begin{pmatrix}
x + t_x \\
y + t_y \\
z + t_z \\
1
\end{pmatrix}
$$

---

## Scaling

Scaling changes the size of an object by factors $(s_x, s_y, s_z)$ along the respective axes.

**Homogeneous Scaling Matrix:**
$$
S(s_x, s_y, s_z) =
\begin{pmatrix}
s_x & 0 & 0 & 0 \\
0 & s_y & 0 & 0 \\
0 & 0 & s_z & 0 \\
0 & 0 & 0 & 1
\end{pmatrix}
$$

---

## Rotation

3D rotation can occur about any of the three principal axes or an arbitrary axis.

### Rotation about the **x-axis**

$$
R_x(\theta) =
\begin{pmatrix}
1 & 0 & 0 & 0 \\
0 & \cos\theta & -\sin\theta & 0 \\
0 & \sin\theta & \cos\theta & 0 \\
0 & 0 & 0 & 1
\end{pmatrix}
$$

### Rotation about the **y-axis**

$$
R_y(\theta) =
\begin{pmatrix}
\cos\theta & 0 & \sin\theta & 0 \\
0 & 1 & 0 & 0 \\
-\sin\theta & 0 & \cos\theta & 0 \\
0 & 0 & 0 & 1
\end{pmatrix}
$$

### Rotation about the **z-axis**
$$
R_z(\theta) =
\begin{pmatrix}
\cos\theta & -\sin\theta & 0 & 0 \\
\sin\theta & \cos\theta & 0 & 0 \\
0 & 0 & 1 & 0 \\
0 & 0 & 0 & 1
\end{pmatrix}
$$

---

## Shearing

Shearing skews an object so that its shape is deformed along one or more axes.
In 3D, there are **six possible shear coefficients** one for each pair of axes.

**General 3D Shear Matrix:**
$$
Sh =
\begin{pmatrix}
1 & sh_{xy} & sh_{xz} & 0 \\
sh_{yx} & 1 & sh_{yz} & 0 \\
sh_{zx} & sh_{zy} & 1 & 0 \\
0 & 0 & 0 & 1
\end{pmatrix}
$$

Each $(sh_{ij})$ controls how much the $i$-coordinate shifts in proportion to $j$.

---

## Reflection (Mirroring)

Reflection is a special case of scaling where one of the scaling factors is negative.

For example:

* Reflection across the **xy-plane** (negate z):
$$
  R_{xy} =
  \begin{pmatrix}
  1 & 0 & 0 & 0 \\
  0 & 1 & 0 & 0 \\
  0 & 0 & -1 & 0 \\
  0 & 0 & 0 & 1
  \end{pmatrix}
$$

* Reflection across the **yz-plane** (negate x):
$$
  R_{yz} =
  \begin{pmatrix}
  -1 & 0 & 0 & 0 \\
  0 & 1 & 0 & 0 \\
  0 & 0 & 1 & 0 \\
  0 & 0 & 0 & 1
  \end{pmatrix}
$$


## Composite Transformations

As in 2D, multiple 3D transformations can be combined by **matrix multiplication**.

For instance, to **rotate, then translate**, the combined transformation is:
$$
M = T(t_x, t_y, t_z) \cdot R_y(\theta)
$$
so that:
$$
p' = M \cdot p
$$

Because matrix multiplication is **not commutative**, the order matters $(R \cdot T \neq T \cdot R)$.



