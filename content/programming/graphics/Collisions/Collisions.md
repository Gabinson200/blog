# Collisions

## Axis-aligned bounding boxes (AABB)

Given a shape defined by a set of points the AABB of the shape is the rectangle defined by the minimum and maximum values the dimensions of the shape can reach. Explicitly, the corners of the 2D bounding box are:
$(x_{min}, y_{min}), (x_{max}, y_{min}), (x_{max}, y_{max}), (x_{min}, y_{max})$.

Collision occurs along a dimension of two objects if:
$$(d2_{min} \geq d1_{min} \text{ && } d2_{min} \leq d1_{max}) \text{ || }(d1_{min} \geq d2_{min} \text{ && } d1_{min} \leq d2_{max})$$

Bounding box collision does not guarantee object collision. 

## Oriented Bounding Box (OBB)

Still a bounding rectangle but instead of using the global (world) axes it can fit to the object's local "best fit" axes.

### Finding OBB

The first way is to just find the local-space AABB of the mesh once when the mesh is created and then apply the same transformations to the AABB as we do to the mesh. The local space AABB is defined by the center point  $c_l$ in the volumetric center of the mesh with orthogonal local basis $e_x, e_y, e_z$
![axis](https://www.oreilly.com/api/v2/epubs/urn\:orm\:book:9781787123663/files/graphics/B05887_7_6.jpg)

Another approach to compute OBB if we didn't keep track of it is to compute it on the fly by using the point cloud of the object and finding a "best fit" frame.

If we have $N$ points $p_i \in \mathbb{R}^3$ (mesh vertices, sampled surface points, etc.), we can use PCA to find the principal directions of the shape and use those as the axes of the OBB.

First we compute the geometric mean (centroid) of our points:
$$
\mu = \frac{1}{N}\sum_{i=1}^N p_i
$$

Then we compute the covariance matrix:
Let $q_i = p_i - \mu$. Then
$$
\Sigma = \frac{1}{N}\sum_{i=1}^N q_i q_i^T
$$
$\Sigma$ is a $3\times 3$ symmetric matrix. (For more on outer products check out the [Products article])

Then we finally find the eigenvectors along which most of the variance is captured, these will become our new basis.

Compute eigenpairs $(\lambda_k, u_k)$ of $\Sigma$ with $\lambda_1 \ge \lambda_2 \ge \lambda_3$.
Then:
* $u_1$ is the direction of maximum variance (long axis)
* $u_2$ is the next most significant axis
* $u_3$ is the remaining orthogonal axis

These orthonormal vectors become the OBB axes:
$$
U = [u_1\ u_2\ u_3]
$$

We then project points into this PCA basis:  
For each point:
$$
\tilde{p}_i = U^Tq_i = U^T (p_i - \mu)
$$
Now each $\tilde{p}_i$ is expressed in the PCA-aligned coordinate system.

Now we simply use the AABB algorithm above to find min/max extents in PCA space:  
$$
m_{min} = (\min_i \tilde{p}*{i,x},\ \min_i \tilde{p}*{i,y},\ \min_i \tilde{p}*{i,z})
$$
$$
m*{max} = (\max_i \tilde{p}*{i,x},\ \max_i \tilde{p}*{i,y},\ \max_i \tilde{p}_{i,z})
$$

Then the half-extents are:
$$
e = \frac{m_{max} - m_{min}}{2}
$$
and the center in PCA-coordinates is:
$$
\tilde{c} = \frac{m_{max} + m_{min}}{2}
$$

Lastly we transform center back to world-space OBB where the center is:
$$
c = \mu + U\tilde{c}
$$

So, to recap, the PCA OBB is defined by:
- center $c$
- axes $u_1,u_2,u_3$
- half-extents $e_x,e_y,e_z$ (the components of $e$)

PCA gives a very good OBB for many shapes and is fast, but it is not guaranteed to be the minimum volume OBB. It is a "best fit" in the variance sense.

#### Rotating calipers (tight OBB in 2D)

In 2D, if you want the minimum-area oriented bounding rectangle, we can:
1. Compute the **convex hull** of the point set.
2. Use **rotating calipers** on the hull to check only a finite set of candidate orientations.

The main idea is that the minimum-area bounding rectangle of a convex polygon occurs when one of the rectangle edges is collinear with an edge of the convex hull. So instead of searching all angles, we only test angles defined by hull edges.

**Quick algo:**  

Let the convex hull be a polygon with vertices in CCW order.

1. For each hull edge direction, take an edge from $h_k$ to $h_{k+1}$:
$$a = \frac{h_{k+1}-h_k}{|h_{k+1}-h_k|}$$
and its perpendicular:
$$b = \begin{bmatrix} -a_y \ a_x \end{bmatrix}$$

2. Project hull points onto these axes by, for all $h_i$, computing:
$$s_i = a \cdot h_i,\quad t_i = b \cdot h_i$$

3. Compute min/max projections
$$
s_{min}=\min_i s_i,\ s_{max}=\max_i s_i,\quad
t_{min}=\min_i t_i,\ t_{max}=\max_i t_i
$$

4. Rectangle area for this orientation with width $w$ and height $h$:
$$w = s_{max}-s_{min},\quad h = t_{max}-t_{min}$$
Area:
$$A = w h$$

5. Finally, we just keep the best orientation by storing the axis $a$ (and $b$) that produces the smallest area.

Rotating calipers is efficient because as you iterate edges around the convex hull, the support points that achieve $s_{min}, s_{max}, t_{min}, t_{max}$ move monotonically, so you can update them in amortized constant time rather than scanning all points every time.

**Note:** In 3D, the exact minimum-volume OBB problem is more complex. In practice most engines use either the object's transform (local AABB carried along) or PCA-based best-fit axes.

### OBB Collision

One approach we can use is to transform one OBB into the other's coordinate frame and check whether any corner lies inside (and repeat swapped). This can miss collisions where boxes intersect edge-to-edge without any corner containment.

The standard method for OBB-vs-OBB intersection is the **Separating Axis Theorem (SAT)** which states that:

Two convex shapes do not intersect iff there exists an axis along which their projections are disjoint. Or in other words if you can draw a line / plane between the two objects then they are not colliding. 

For OBBs in 3D, the candidate separating axes are the face normals and cross products of edges:
- All face normals of A
- All face normals of B
- All (edge direction of $A$) $\times$(edge direction of $B$)
So a common worst-case bound is:
$$F_A+F_B+E_AE_B$$
where:
$F$ = number of faces and $E$ = number of edges.

So, for a box we get:
- the 3 face normals (axes) of box 1: $u_1, u_2, u_3$
- the 3 face normals (axes) of box 2: $v_1, v_2, v_3$
- the 9 cross-product axes: $u_i \times v_j$ for $i,j \in {1,2,3}$

Total: $3 + 3 + 9 = 15$ axes.

For each axis $a$ (unit length), define the center difference:
$$d = c_2 - c_1$$

We test whether projections overlap:
$$
|d \cdot a| \le r_1(a) + r_2(a)
$$

Where the projection radius of an OBB onto axis $a$ is:  
For box 1 with half-extents $(e_{1x}, e_{1y}, e_{1z})$ along axes $(u_1,u_2,u_3)$:
$$
r_1(a) = e_{1x}|a\cdot u_1| + e_{1y}|a\cdot u_2| + e_{1z}|a\cdot u_3|
$$
Similarly for box 2:
$$
r_2(a) = e_{2x}|a\cdot v_1| + e_{2y}|a\cdot v_2| + e_{2z}|a\cdot v_3|
$$

If the inequality fails for any axis, then we found a separating axis meaning no collision.
If it holds for all 15 axes then there is a collision. 


**SAT in 2D (OBR vs OBR)**

In 2D, there are no cross-product axes, so we test only the 2 axes of each rectangle (4 axes total). The same projection idea applies:

* axes: $u_1,u_2$ from rect 1 and $v_1,v_2$ from rect 2
* overlap test: $|d\cdot a| \le r_1(a)+r_2(a)$


# Bounding Sphere 

## Ritter's algorithm:
Given a set of points (ex: mesh vertices) we often want a fast bounding sphere that contains every point. A common approach is Ritter's algorithm, which builds an approximate minimal sphere in linear time and is usually tight enough for collision culling.

### Step 1: pick an initial diameter
Start with any point $p_0$ from the set.

1. Find the point farthest from $p_0$:
$$p_1 = \arg\max_{p_i} |p_i - p_0|$$

2. Find the point farthest from $p_1$:
$$p_2 = \arg\max_{p_i} |p_i - p_1|$$

Treat the segment $p_1p_2$ as an approximate diameter. Initialize the sphere center and radius as:
$$c = \frac{p_1 + p_2}{2}, \quad r = \frac{|p_2 - p_1|}{2}$$

This gives a sphere that already contains $p_1$ and $p_2$ and is often a decent starting guess.

### Step 2: grow the sphere to include all points

Now iterate through all points $p_i$. If a point is already inside the sphere, do nothing: $$|p_i - c| \le r$$

If a point lies outside, expand the sphere just enough to include it while keeping the sphere as small as possible given the current center direction.

Let:
$$d = |p_i - c|$$
If $d > r$, update:
- new radius is halfway between $r$ and $d$:
$$r' = \frac{r + d}{2}$$
- shift the center towards $p_i$ along the direction from $c$ to $p_i$:
$$c' = c + \left(\frac{r' - r}{d}\right)(p_i - c)$$
Then set $c = c'$, $r = r'$ and continue.

Intuition: the new sphere is the smallest sphere that contains the old sphere and the point $p_i$, and the new center lies on the line segment from $c$ to $p_i$.

### Computational Notes:
- Runtime is $O(N)$ (two farthest-point scans + one pass to grow).
- The result is not guaranteed to be the true minimum bounding sphere, but it is usually very close for real geometry.
- If you want it tighter, you can run the algorithm multiple times with different starting points and keep the smallest sphere.

## Sphere-Sphere Collision

If we have two sphere with centers $c_1$ and $c_2$ and radii $r_1$ and $r_2$ respectively, then they collide only if the distance between their centers is less than or equal to the sum of their radii.
$$|c_1 - c_2| \leq r_1 + r_2$$

## Sphere-Plane Collision

A plane can be represented by a point $p_0$ on the plane and a unit normal $N$. The signed distance from a point $x$ to the plane is:
$$d(x) = (x - p_0)\cdot N$$
For a sphere with center $c$ and radius $r$, collision occurs when the sphere intersects or touches the plane:
$$(c - p_0)\cdot N \le r$$
(If the plane is two-sided, use $|(c - p_0)\cdot N| \le r$.)

### Sphere-Plane Collision Response

The easiest way to "bounce off" the wall is to just reflect back off it by mirroring our incoming velocity vector in the direction normal to the plane. If we have a plane in the y-axis $(0, 1, 0)$ then its normal $N = (1, 0, 0)$ (x-axis), to reflect we invert the sign(s) of the velocity component along the normal. For this specific case:
$$v' = (-v_x,\ v_y,\ v_z)$$

In general, if $N$ is a unit normal and $v$ is incoming velocity, the reflection formula is:
$$v' = v - 2(v\cdot N)N$$

### Computational Notes:
To avoid sinking into the wall due to numerical error, we can also apply a positional correction. If $d = (c - p_0)\cdot N$ and $d < r$ then penetration depth is $\delta = r - d$ and we push the center out:
$$c' = c + \delta N$$

