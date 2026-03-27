# Homography

# Resources:
2d and 3d transformations article
vertex shader article

- [MIT vision](https://visionbook.mit.edu/homography.html)

- This is a great video lecture [series](https://www.youtube.com/playlist?list=PLhwIOYE-ldwL6h-peJADfNm8bbO3GlKEy) that goes into [homography](https://www.youtube.com/watch?v=1PJZNCU9yRo&t=729s) and also [Total Least Squares](https://www.youtube.com/watch?v=zstTZf5AiWE&list=PLhwIOYE-ldwL6h-peJADfNm8bbO3GlKEy&index=52) by UC Berk. Hany Farid.


## Pre-note / observation:
In computer graphics during perspective transform we map known 3D coordinates onto an image plane while homography is a general projective mapping between two image planes. However, if the 3D object is planar then 3D projection reduces to homography. So it is interesting to go back to the vertex shader article and contrast the two techniques as they both share many similarities.

# Definition

A homography or projective transformation is a linear geometric transformation that preserves straight lines ie homography is simply a function $h$ that maps points $p$ to points $p'$ with the property that if the points $p$ are colinear then their transformed points $p'$ are also colinear.
$$p' = h(p)$$

$$
\begin{bmatrix}
    x' \\
    y' \\
    w'
    \end{bmatrix}
    =
    \begin{bmatrix}
    a & b & c \\
    d & e & f \\
    g & h & i
    \end{bmatrix}
    \begin{bmatrix}
    x \\
    y \\
    1
    \end{bmatrix}
    \equiv
    p' = Hp
$$

Homographic transformations can represent the all the linear transformations that takes one image plane to another image plane. This can be very useful for:
- image stitching
- document rectification
- planar pose estimation
Or any transformation that takes a flat and turns it into another flat plane. 

$\star$
In short, a homography works iff all observed points lie on a single 3D plane OR the camera undergoes pure rotation.

If you have points with different depths in a scene then you cannot use  only homography to model the transformation that takes you from one view to another. Similarly if your camera moves in a scene with depth variation then the mapping is no longer planar. 


# Planar Homography

Lets say you have a picture of a wall, tabletop, or any planar object in 3D and want to find the transformation that maps the 3D coordinates of the object to the image plane. 
<img src="image.png" alt="plane-to-plane" width="60%">
Since the world coordinate system can be defined anywhere lets place it relative to the plane such that the plane is defined by $Z_w = 0$.

In general, when doing perspective projection we transform the homogeneous world-space coordinates of an object into the homogeneous image-plane coordinates which we transform into 2D image coordinates by doing a perspective divide (division by $s$).

The full perspective projection equation in matrix form is

$$s \begin{bmatrix}
u \\ v \\ 1
\end{bmatrix} = K
\begin{bmatrix}
R & t
\end{bmatrix}
\begin{bmatrix}
X_w \\ Y_w \\ Z_w \\ 1
\end{bmatrix}
$$

where
- $(X_w, Y_w, Z_w)$ are the world coordinates of a 3D point  
- $(u, v)$ are the pixel coordinates in the image  
- $R$ is the $3 \times 3$ rotation matrix describing the camera orientation  
- $t$ is the $3 \times 1$ translation vector describing the camera position  
- $K$ is the camera intrinsic matrix  

The intrinsic matrix is
$$
K = \begin{bmatrix}
f_x & 0 & c_x \\
0 & f_y & c_y \\
0 & 0 & 1
\end{bmatrix}
$$
where
- $f_x, f_y$ are the focal lengths measured in pixels  
- $(c_x, c_y)$ is the principal point (the optical center of the image)

Expanding the projection equation gives

$$ s
\begin{bmatrix}
u \\ v \\ 1
\end{bmatrix} = K
\begin{bmatrix}
r_{11} & r_{12} & r_{13} & t_1 \\
r_{21} & r_{22} & r_{23} & t_2 \\
r_{31} & r_{32} & r_{33} & t_3
\end{bmatrix}
\begin{bmatrix}
X_w \\ Y_w \\ Z_w \\ 1
\end{bmatrix}
$$

Finally the 2D pixel coordinates are obtained by performing the perspective divide

$$ u = \frac{x'}{s}, \quad v = \frac{y'}{s}$$  
where

$$
\begin{bmatrix}
x' \\ y' \\ s
\end{bmatrix} = K
\begin{bmatrix}
R & t
\end{bmatrix}
\begin{bmatrix}
X_w \\ Y_w \\ Z_w \\ 1
\end{bmatrix}
$$

$\star$ But since we defined the plane such that $Z_w = 0$ the world point becomes:

$$
\begin{bmatrix}
X_w \\
Y_w \\
0 \\
1
\end{bmatrix}
$$

Substituting into the projection equation gives

$$
s
\begin{bmatrix}
u \\
v \\
1
\end{bmatrix}
=
K
\begin{bmatrix}
r_1 & r_2 & t
\end{bmatrix}
\begin{bmatrix}
X_w \\
Y_w \\
1
\end{bmatrix}
$$

where $r_1$ and $r_2$ are the first two columns of the rotation matrix.

We can define
$$
H = K
\begin{bmatrix}
r_1 & r_2 & t
\end{bmatrix}
$$  
which gives  

$$
s \begin{bmatrix}
u \\ v \\ 1
\end{bmatrix}
= H
\begin{bmatrix}
X_w \\ Y_w \\ 1
\end{bmatrix}
$$

Thus the full 3D camera projection reduces to a $3 \times 3$ homography matrix, which is really just a combination of a 2D translation and rotation matrix times the camera intrinsic matrix. Now that we have the equality above we can equivalently say that their cross product has to be equal to 0 since the cross product of two equivalent vectors is equal to 0.

$$
s \begin{bmatrix}
u \\ v \\ 1
\end{bmatrix}
\times H
\begin{bmatrix}
X_w \\ Y_w \\ 1
\end{bmatrix} = 0
$$

Expanding the entire equation we get:

$$
H =
\begin{bmatrix}
h_{1} & h_{2} & h_{3} \\
h_{4} & h_{5} & h_{6} \\
h_{7} & h_{8} & h_{9}
\end{bmatrix}
$$

$$
s
\begin{bmatrix}
u \\
v \\
1
\end{bmatrix}
\times
\begin{bmatrix}
h_{1}X_w + h_{2}Y_w + h_{3} \\
h_{4}X_w + h_{5}Y_w + h_{6} \\
h_{7}X_w + h_{8}Y_w + h_{9}
\end{bmatrix} = \begin{bmatrix} 0 \\ 0 \\ 0 \end{bmatrix}
$$

$$
\begin{bmatrix}
s v (h_{7}X_w + h_{8}Y_w + h_{9}) - s (h_{4}X_w + h_{5}Y_w + h_{6}) \\
s (h_{1}X_w + h_{2}Y_w + h_{3}) - s u (h_{7}X_w + h_{8}Y_w + h_{9}) \\
s u (h_{4}X_w + h_{5}Y_w + h_{6}) - s v (h_{1}X_w + h_{2}Y_w + h_{3})
\end{bmatrix} = \begin{bmatrix} 0 \\ 0 \\ 0 \end{bmatrix} 
$$

Since the homogeneous scalar $s$ that we divide by to go from homogeneous coordinates to 2D screen space is present on the left and the right is all 0s lets divide by $s$ so we can solve directly for the screen space coordinates. 

$$
\begin{bmatrix}
v (h_{7}X_w + h_{8}Y_w + h_{9}) - (h_{4}X_w + h_{5}Y_w + h_{6}) \\
(h_{1}X_w + h_{2}Y_w + h_{3}) - u (h_{7}X_w + h_{8}Y_w + h_{9}) \\
u (h_{4}X_w + h_{5}Y_w + h_{6}) - v (h_{1}X_w + h_{2}Y_w + h_{3})
\end{bmatrix}
=
\begin{bmatrix} 0 \\ 0 \\ 0 \end{bmatrix}
$$

Notice however that the third equation is actually linearly dependent on the first two. We can see this by rewriting it as

$$
u (h_{4}X_w + h_{5}Y_w + h_{6}) - v (h_{1}X_w + h_{2}Y_w + h_{3})
=$$

$$u\Big((h_{4}X_w + h_{5}Y_w + h_{6}) - v(h_{7}X_w + h_{8}Y_w + h_{9})\Big)
+
v\Big((h_{1}X_w + h_{2}Y_w + h_{3}) - u(h_{7}X_w + h_{8}Y_w + h_{9})\Big)
$$

which shows that the third row is simply a linear combination of the first two. Therefore it does not provide any additional independent constraint and can be discarded.

Keeping only the two independent equations gives

$$
v (h_{7}X_w + h_{8}Y_w + h_{9}) - (h_{4}X_w + h_{5}Y_w + h_{6}) = 0
$$

$$
(h_{1}X_w + h_{2}Y_w + h_{3}) - u (h_{7}X_w + h_{8}Y_w + h_{9}) = 0
$$

Now we can rearrange these equations so that the unknown homography entries are factored out:

$$
0\cdot h_1 + 0\cdot h_2 + 0\cdot h_3
- X_w h_4 - Y_w h_5 - h_6
+ vX_w h_7 + vY_w h_8 + v h_9
= 0
$$

$$
X_w h_1 + Y_w h_2 + h_3
+ 0\cdot h_4 + 0\cdot h_5 + 0\cdot h_6
- uX_w h_7 - uY_w h_8 - u h_9
= 0
$$

Nice, so now we just have a system of linear equations with 9 unknowns (the $h$s) that we can rewrite compactly as

$$
\begin{bmatrix}
0 & 0 & 0 & -X_w & -Y_w & -1 & vX_w & vY_w & v \\
X_w & Y_w & 1 & 0 & 0 & 0 & -uX_w & -uY_w & -u
\end{bmatrix}
\begin{bmatrix}
h_1 \\ h_2 \\ h_3 \\ h_4 \\ h_5 \\ h_6 \\ h_7 \\ h_8 \\ h_9
\end{bmatrix}
=
\begin{bmatrix}
0 \\ 0
\end{bmatrix}
$$

Phew, ok that was a lot of algebra and symbolic manipulation, but to recap we are trying to find a transformation matrix that maps planes in 3D to the image plane. Each known point $(X_w, Y_w, Z_w)$ gives us screen coordinates $(u, v)$ which contributes two independent linear constraints on the entries of the homography matrix.

Because the homography has 9 parameters but is defined only up to scale (that is the magnitude of $H = 1$), it has 8 degrees of freedom. Since each point gives two independent equations, we need at least four correspondences to solve for the homography:
$$4 \text{ points} \times 2 \text{ equations per point} = 8$$
This is why four corners of a planar object are enough to estimate its homography. Remember that we defined the world coordinates relative to the plane so if the world-space origin is in the center of a rectangular plane with some width $w$ and height $h$ we can simply plug in the four edge coordinates of the rectangle to satisfy the homography.

Of course, in practice we usually have more than four correspondences. Suppose we observe $N$ points on the plane, where the $i$th planar point
$
\begin{bmatrix}
X_i \\ Y_i \\ 1
\end{bmatrix}^T
$
maps to the image point
$
\begin{bmatrix}
u_i \\ v_i \\ 1
\end{bmatrix}^T
$
Then each correspondence contributes the same two linear constraints as before:


So for each point $i$ we can define the $2 \times 9$ block

$$
A_i =
\begin{bmatrix}
0 & 0 & 0 & -X_i & -Y_i & -1 & v_i X_i & v_i Y_i & v_i \\
X_i & Y_i & 1 & 0 & 0 & 0 & -u_i X_i & -u_i Y_i & -u_i
\end{bmatrix}
$$

and the homography parameter vector

$$
h =
\begin{bmatrix}
h_1 \\ h_2 \\ h_3 \\ h_4 \\ h_5 \\ h_6 \\ h_7 \\ h_8 \\ h_9
\end{bmatrix}
$$

Then each individual correspondence satisfies  
$$A_i h = 0$$

Stacking the equations for all $N$ correspondences gives one large linear system:  

$$Ah = 0$$  

where  

$$
A =
\begin{bmatrix}
A_1 \\
A_2 \\
\vdots \\
A_N
\end{bmatrix}
=
\begin{bmatrix}
0 & 0 & 0 & -X_1 & -Y_1 & -1 & v_1 X_1 & v_1 Y_1 & v_1 \\
X_1 & Y_1 & 1 & 0 & 0 & 0 & -u_1 X_1 & -u_1 Y_1 & -u_1 \\
0 & 0 & 0 & -X_2 & -Y_2 & -1 & v_2 X_2 & v_2 Y_2 & v_2 \\
X_2 & Y_2 & 1 & 0 & 0 & 0 & -u_2 X_2 & -u_2 Y_2 & -u_2 \\
\vdots & \vdots & \vdots & \vdots & \vdots & \vdots & \vdots & \vdots & \vdots \\
0 & 0 & 0 & -X_N & -Y_N & -1 & v_N X_N & v_N Y_N & v_N \\
X_N & Y_N & 1 & 0 & 0 & 0 & -u_N X_N & -u_N Y_N & -u_N
\end{bmatrix}.
$$

So if we have $N$ point correspondences, then $A$ is a $2N \times 9$ matrix. In the ideal noise-free case, we would like to find a nonzero vector $h$ such that
$$Ah = 0.$$

This is the standard homogeneous linear system used in homography estimation. When exactly four perfect correspondences are available, $A$ has 8 rows and we can solve for the homography up to scale. When more than four correspondences are available, the system becomes overdetermined, which is actually useful because it lets us estimate the homography more robustly in the presence of measurement noise.


# Total Least Squares / Normalized DLT

Of course, in real computer vision problems our point correspondences are never perfect. Corner detections are noisy, pixels are discrete, and even small localization errors mean that there will usually be no nonzero vector $h$ such that $Ah = 0$ exactly.

So instead of trying to solve the system exactly, we look for the homography vector $h$ that makes the residual as small as possible. Since the trivial solution $h = 0$ would make the residual zero but does not define a useful homography, we must also constrain the scale of $h$. A common choice is to require

$$
\|h\|^2 = 1
$$

This gives the optimization problem

$$
\min_{h} \|Ah\|^2
\quad
\text{subject to}
\quad
\|h\|^2 = 1
$$

This is a **total least squares** problem because the entries of $A$ are themselves built from noisy measurements, so we are not treating one side of the system as exact and the other as noisy. Instead we are looking for the unit-length vector $h$ that gets us as close as possible to the nullspace of $A$.

We can expand the objective as
$$ \|Ah\|^2 = (Ah)^T(Ah) = h^T A^T A h$$

So the constrained minimization becomes
$$ \min_{h} h^T A^T A h \quad \text{subject to} \quad h^T h = 1$$

To solve this, we introduce a [Lagrange multiplier](article.html?slug=\programming\misc\Lagrangian\Lagrangian) $\lambda$ and define the Lagrangian

$$\mathcal{L}(h, \lambda) = h^T A^T A h - \lambda(h^Th - 1)$$

Taking the derivative with respect to $h$ and setting it equal to zero gives:
$$\frac{\partial \mathcal{L}}{\partial h} = 0$$
which yields
$$2A^TAh - 2\lambda h = 0$$

Rearranging gives
$$A^T A h = \lambda h$$

This is just an eigenvalue problem. The homography vector $h$ must be an eigenvector of $A^T A$, and because we are minimizing the quadratic form $h^T A^TA h$ subject to unit norm, we choose the eigenvector corresponding to the **smallest eigenvalue**.

So the computational recipe is:

1. build the matrix $A$ from all point correspondences  
2. compute the matrix $A^TA$  
3. find the eigenvector of $A^TA$ with the smallest eigenvalue  
4. reshape that 9-vector back into the $3 \times 3$ homography matrix

$$
H =
\begin{bmatrix}
h_1 & h_2 & h_3 \\
h_4 & h_5 & h_6 \\
h_7 & h_8 & h_9
\end{bmatrix}
$$

If the data were perfectly noise free, then $A$ would have an exact nullspace and the smallest eigenvalue would be exactly zero. In practice, noise perturbs the system so the smallest eigenvalue is only approximately zero, and the corresponding eigenvector gives the best approximate homography in the total least squares sense.

## Why Normalize the Points?

In principle this already solves the homography problem, but in practice there is one more important numerical detail. The coordinates used to construct $A$ may live on very different scales. For example:

- image points might be in pixel coordinates like $(183, 27)$
- planar world points might be in coordinates like $(-1,1)$ or in centimeters

This mismatch in scale can make the matrix $A$ poorly conditioned, which makes the computed homography less accurate and less stable numerically.

To fix this, we first normalize both the image points and the planar points before constructing $A$. This is the idea behind the **Normalized Direct Linear Transform (Normalized DLT)**.

Let the original planar point be

$$
X_i =
\begin{bmatrix}
X_i \\ Y_i \\ 1
\end{bmatrix}
$$

and the original image point be

$$
x_i =
\begin{bmatrix}
u_i \\ v_i \\ 1
\end{bmatrix}
$$

We define two normalization transforms:
- $T_w$ for the planar coordinates
- $T_i$ for the image coordinates

and compute normalized points
$$\tilde{X}_i = T_w X_i$$
$$\tilde{x}_i = T_i x_i.$$

Typically these normalization transforms:

- translate the points so their centroid is at the origin
- scale the points so that their average distance from the origin is $\sqrt{2}$

This keeps all coordinates roughly centered and on the same order of magnitude, which greatly improves numerical stability.

Using the normalized correspondences, we build the normalized linear system
$$\tilde{A}\tilde{h} = 0$$
and solve it exactly the same way as before:
$$\tilde{A}^T \tilde{A} \tilde{h} = \lambda \tilde{h}.$$

The eigenvector corresponding to the smallest eigenvalue gives the normalized homography vector $\tilde{h}$, which we reshape into the normalized homography matrix $\tilde{H}$. Finally, we convert the homography back to the original coordinate system using

$$H = T_i^{-1} \tilde{H} T_w.$$

This is the full **Normalized DLT** algorithm.

## Normalized DLT Algorithm Summary

Given $N$ planar/image point correspondences:

1. compute a normalization transform $T_w$ for the planar points  
2. compute a normalization transform $T_i$ for the image points  
3. transform all correspondences into normalized coordinates  
4. build the normalized matrix $\tilde{A}$  
5. compute the smallest-eigenvalue eigenvector of $\tilde{A}^T\tilde{A}$  
6. reshape it into $\tilde{H}$  
7. denormalize using

$$
H = T_i^{-1}\tilde{H}T_w
$$

8. optionally rescale $H$ so that $h_9 = 1$


The DLT derivation gives us a clean linear formulation of the homography problem, and the normalization step makes that formulation numerically stable. This is why normalized DLT is the standard first step in many computer vision pipelines such as:

- document rectification
- image stitching
- planar marker tracking
- planar pose estimation

For low power systems, this formulation is also attractive because the matrix dimensions are very small. Even with several point correspondences, the matrix $A^TA$ is always only $9 \times 9$, so solving for the smallest eigenvector is computationally manageable.

That said, if we know ahead of time that we will always have exactly four correspondences, such as the four corners of a square marker, there is an even simpler approach: we can fix the arbitrary scale of the homography and solve directly for the remaining eight unknowns as an $8 \times 8$ linear system.


# Less general but faster version AprilTag style

If we know ahead of time that we will always have exactly four correspondences, such as the four corners of a square marker, then we can avoid the more general total least squares formulation and use a cheaper direct linear solve instead. This is essentially the approach used in the AprilTag detector hot path: once a quad has already been detected and its four corners have been estimated from the intersections of fitted edge lines, the homography is computed directly from those four corners rather than from a larger overdetermined system.


So suppose we have exactly four correspondences

$$(X_i, Y_i) \leftrightarrow (u_i, v_i),
\qquad i \in \{1,2,3,4\} $$

From the derivation above, each point contributes the two independent equations:
$$- X_i h_4 - Y_i h_5 - h_6 + v_i X_i h_7 + v_i Y_i h_8 + v_i h_9 = 0$$
$$X_i h_1 + Y_i h_2 + h_3 - u_i X_i h_7 - u_i Y_i h_8 - u_i h_9 = 0$$

Since a homography is only defined up to an arbitrary scale factor, we are free to fix one parameter. A common choice, and the one used by the direct AprilTag-style solver, is to set $h_9 = 1.$

Now the unknown vector only contains eight entries:

$$
g =
\begin{bmatrix}
h_1 \\ h_2 \\ h_3 \\ h_4 \\ h_5 \\ h_6 \\ h_7 \\ h_8
\end{bmatrix}
$$

Substituting $h_9 = 1$ into the two equations above and moving the constant terms to the right-hand side gives

$$- X_i h_4 - Y_i h_5 - h_6 + v_i X_i h_7 + v_i Y_i h_8 = -v_i$$
$$X_i h_1 + Y_i h_2 + h_3 - u_i X_i h_7 - u_i Y_i h_8 = u_i.$$

We can rewrite these as a standard linear system
$$Bg = c$$

where each correspondence contributes the $2 \times 8$ block

$$
B_i =
\begin{bmatrix}
0 & 0 & 0 & -X_i & -Y_i & -1 & v_i X_i & v_i Y_i \\
X_i & Y_i & 1 & 0 & 0 & 0 & -u_i X_i & -u_i Y_i
\end{bmatrix}
$$

and the corresponding right-hand side block

$$
c_i =
\begin{bmatrix}
-v_i \\
u_i
\end{bmatrix}
$$

Stacking the four point correspondences gives

$$
B =
\begin{bmatrix}
B_1 \\
B_2 \\
B_3 \\
B_4
\end{bmatrix},
\qquad
c =
\begin{bmatrix}
c_1 \\
c_2 \\
c_3 \\
c_4
\end{bmatrix}
$$

so that

$$
\begin{bmatrix}
0 & 0 & 0 & -X_1 & -Y_1 & -1 & v_1 X_1 & v_1 Y_1 \\
X_1 & Y_1 & 1 & 0 & 0 & 0 & -u_1 X_1 & -u_1 Y_1 \\
0 & 0 & 0 & -X_2 & -Y_2 & -1 & v_2 X_2 & v_2 Y_2 \\
X_2 & Y_2 & 1 & 0 & 0 & 0 & -u_2 X_2 & -u_2 Y_2 \\
0 & 0 & 0 & -X_3 & -Y_3 & -1 & v_3 X_3 & v_3 Y_3 \\
X_3 & Y_3 & 1 & 0 & 0 & 0 & -u_3 X_3 & -u_3 Y_3 \\
0 & 0 & 0 & -X_4 & -Y_4 & -1 & v_4 X_4 & v_4 Y_4 \\
X_4 & Y_4 & 1 & 0 & 0 & 0 & -u_4 X_4 & -u_4 Y_4
\end{bmatrix}
\begin{bmatrix}
h_1 \\ h_2 \\ h_3 \\ h_4 \\ h_5 \\ h_6 \\ h_7 \\ h_8
\end{bmatrix}
=
\begin{bmatrix}
-v_1 \\
u_1 \\
-v_2 \\
u_2 \\
-v_3 \\
u_3 \\
-v_4 \\
u_4
\end{bmatrix}
$$

This is now an $8 \times 8$ linear system, so if the four points are in general position we can solve it directly using Gaussian elimination, LU decomposition, or any other small dense linear solver. Once the eight unknowns have been recovered, we reconstruct the full homography as

$$
H =
\begin{bmatrix}
h_1 & h_2 & h_3 \\
h_4 & h_5 & h_6 \\
h_7 & h_8 & 1
\end{bmatrix}
$$

This is computationally attractive because it avoids building $A^TA$, avoids an eigenvalue or singular value decomposition, and reduces the problem to a single direct solve on a tiny $8 \times 8$ matrix. The current AprilTag reference detector uses this kind of specialized four-corner homography solve in its detection path, solving the fixed-scale system by Gaussian elimination with pivoting.

The tradeoff is that this method is less general and usually a bit less numerically robust than normalized DLT. If more than four correspondences are available, or if the correspondences are significantly noisy, then the total least squares formulation is usually preferable. But for planar fiducial markers, where the detector already gives us one refined quad with exactly four ordered corners, this direct solver is often the best choice because it is both simple and fast.

So in practice there are really two useful homography solvers to keep in mind:

- **Normalized DLT / total least squares**: best when you have many correspondences and want the most numerically stable estimate
- **Direct 4-point linear solve**: best when you already have exactly four refined corners and want the cheapest possible computation

