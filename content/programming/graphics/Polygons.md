## Polygons: Basic Definitions

A polygon is a plane figure described by a finite number of straight line segments connected to form a closed polygonal chain. The two main classifications for simple (non-self-intersecting) polygons are convex and concave.

* Convex Polygon: A polygon is convex if for every pair of points within the polygon, the line segment connecting them is also entirely contained within the polygon. Visually, this means the polygon has no "dents" or inward-facing corners. An equivalent definition is that all interior angles are less than or equal to 180°.
* Concave Polygon: A polygon that is not convex is called concave. A concave polygon must have at least one interior angle greater than 180°, which creates a "dent" in its shape.

---
---

## Testing for Convexity

A robust method for determining if a polygon is convex involves analyzing the "turn" direction at each vertex as you traverse the boundary.

### The Cross Product Method

We can determine the direction of the turn at each vertex by using the cross product on adjacent edge vectors. For a polygon in the XY-plane, we can treat the vectors as 3D vectors with a z-component of 0.

Given two vectors, $a = (a_x, a_y, 0)$ and $b = (b_x, b_y, 0)$, their cross product is:
$$a \times b =
\begin{vmatrix}
\mathbf{i} & \mathbf{j} & \mathbf{k} \\\
a_x & a_y & 0 \\\
b_x & b_y & 0 \\\
\end{vmatrix}
= (0, 0, a_x b_y - a_y b_x)
$$



The sign of the resulting z-component tells us about the orientation of the vectors:
* Positive z-component: According to the right-hand rule, this means vector $b$ is to the "left" of vector $a$. In the context of a polygon, this corresponds to a left turn (a convex angle for CCW traversal).
* Negative z-component: This means vector $b$ is to the "right" of vector $a$, corresponding to a right turn (a concave angle for CCW traversal).
* Zero z-component: The vectors are collinear.  

  
### The Algorithm

To test if a polygon is convex, we assume its vertices $(v_0, v_1, ..., v_{n-1})$ are ordered in a consistent direction, typically counter-clockwise (CCW). We can then iterate through each vertex and calculate the cross product of the incoming and outgoing edge vectors.

For each vertex $v_i$:
1.  Define the incoming edge vector: $E_{prev} = v_i - v_{i-1}$.
2.  Define the outgoing edge vector: $E_{next} = v_{i+1} - v_i$.
3.  Calculate the cross product: $n = E_{prev} \times E_{next}$.
4.  Check the sign of the z-component of $n$.

If all vertices are processed and the z-component of the cross product is always non-negative (i.e., $\ge 0$) for every vertex, the polygon is convex. If even one vertex yields a negative z-component, the polygon is concave.

---
---

## The Point in Polygon (PIP) Problem

The Point in Polygon (PIP) problem is to determine whether a given point $p$ lies inside, outside, or on the boundary of a polygon.

A simple first step is to perform a Minimum Bounding Rectangle (MBR) test. If the point is outside the MBR of the polygon, it is trivially outside the polygon itself. If it's inside the MBR, more precise tests are needed.

### Method 1: Ray Casting (Even-Odd Rule)

This is one of the most common methods. The algorithm is as follows:
1.  Draw a ray (a semi-infinite line) from the point $p$ in any fixed direction (e.g., positive x-axis) to a point $q$ known to be outside the polygon.
2.  Count the number of times this ray intersects with the polygon's edges.
3.  Apply the Even-Odd Rule (or parity rule):
    * If the number of intersections is odd, the point $p$ is inside the polygon.
    * If the number of intersections is even (including zero), the point $p$ is outside the polygon.

Edge Cases: This simple rule has several edge cases that must be handled carefully:
* The ray passes directly through a vertex.
* The ray is collinear with a polygon edge.

To handle these, implementations often adopt conventions, such as only counting intersections with horizontal edges if the vertex endpoint with the larger y-value is part of the intersection. A simpler solution is to choose a different ray if a problematic intersection occurs.

### Method 2: Winding Number Algorithm

The winding number algorithm is a more robust method, especially for non-simple (self-intersecting) polygons. The winding number $w$ counts the net number of times the polygon wraps around the point $p$ in a counter-clockwise direction.

The algorithm works by summing the signed crossings of a ray cast from $p$:
1.  Initialize the winding number $w = 0$.
2.  Iterate through each edge of the polygon.
3.  For each edge that crosses the ray $pq$:
    * If the edge crosses from right-to-left (an upward crossing relative to the ray), increment $w$ ($w \mathrel{+}= 1$).
    * If the edge crosses from left-to-right (a downward crossing relative to the ray), decrement $w$ ($w \mathrel{-}= 1$).

After checking all edges, the point $p$ is outside if and only if the final winding number is zero ($w=0$). Any non-zero value ($w \ne 0$) means the point is inside.

---
---

## Comparison and Edge Cases

* Simple Polygons: For simple (non-self-intersecting) polygons, the ray casting and winding number algorithms give the same result. The winding number will be either 0 (outside) or 1 (inside, for CCW polygons).
* Complex Polygons: For polygons that self-intersect, the winding number provides more information. A point might be inside multiple "loops," resulting in a winding number like $w=2$. The even-odd rule may classify such a point as outside, which might not be the desired behavior.
* Polygon Orientation: The sign of the winding number depends on the polygon's vertex orientation. A CCW polygon will yield $w=1$ for an interior point, while a clockwise (CW) polygon will yield $w=-1$. The "is it inside?" test still works by checking for $w \ne 0$.
