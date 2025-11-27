GREAT RESOURCE: https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/projection-matrix-introduction.html

**Prerequisites**:
[2D and 3D Transformations], [Cameras]
So far we have looked at transformations you can apply to a set of points to change them in space and how homogeneous coordinates can be used to combine those transformations into a single matrix. Additionally, we have some background on how cameras are designed/defined both physically and conceptually. 
****

# Objective:

Our goal at this stage in the graphics pipeline is to take in the set of points and their attributes in addition to a camera object's position and orientation and transform those points as if they are "viewed" from our camera with perspective (or other types of projections) applied. Lastly, we want to transform our normalized device coordinates, which are device agnostic, into pixel coordinates from our frame buffers. 

To manage this objective, we’ll break it into a series of stages, each with its own subtopics that build the necessary foundation.
1. **[[#Model Transform]]**: Local space to world space
2. **[[#Camera Transform]]**: World to camera coordinates (mathematical background: change of bases)
3. **[[#Projection Transform]]**: Camera space to clip space (mathematical background: projection)
4. **Viewport transform**: NDC to pixel coordinates 

After these steps are complete we could perform rasterization and draw the pixels in our frame buffer onto the screen.

# Model Transform

Let's say we want to create a crate object in the shape of a cube that is defined by a set of 8 vertices in 3D. These vertices are typically defined in the cube’s **local (object) space**, not directly in their final position and orientation in the world. However, as we have seen in the [2D and 3D Transformations] article we can chain together our 4 by 4 homogeneous transformation matrices and apply a single composite transformation to our points to get them in our desired position and orientation. An important thing to keep in mind is that transformations are generally not commutative i.e. a translation followed by a rotation is not the same as a rotation followed by a translation. This is especially important since the local origin of the cube defines its pivot. Depending on how the coordinates of our cube were initially given the local origin of our cube may be one of the bottom corners of the cube, the center of the cube, or somewhere else entirely. Rotation and scaling will happen around that pivot point. In more complex designs such as a character, the upper arm, forearm, and hand each have their own local origin (pivot), and we arrange them in a hierarchy: the hand is transformed relative to the forearm, the forearm relative to the upper arm, and so on. Changing the parent’s model transform moves all its children, but each child still rotates around its own pivot in its own local space.
![[Pasted image 20251120180548.png]]Additionally, if we want to change the pivot around which we rotate an object we need to translate that pivot to be at the origin, apply the rotation, and translate back: $M_{pivot-rot}=T(p)RT(-p)$.
![[Pasted image 20251120180644.png]]Mathematically, if we have the points defining the vertices of our cube in 3D space as a list of x, y, and z coordinates: $[p_1, p_2, ... p_8]$ where $p_n = \begin{pmatrix}x_n & y_n & z_n\\ \end{pmatrix}$ we "lift" each point into homogeneous coordinates by appending a 1; $p_{h(n)} = \begin{pmatrix}x_n & y_n & z_n & 1\\ \end{pmatrix}$. Given a $4 \times 4$ **model matrix** $(M_{\text{model}})$, which encodes the combined scaling, rotation, and translation for the crate, we obtain the corresponding **world-space** positions by applying it to each point $p_{h(n)}$.
$$p_{m(n)} = M_{\text{model}} \, p_{h(n)}$$
If we stack all the homogeneous vertex positions into a single matrix
$$
P_h = \begin{bmatrix} p_{h(1)} &  p_{h(2)} & \dots &  p_{h(3)} \end{bmatrix},
$$
then the entire cube can be transformed in one shot as
$$
P_m = M_{\text{model}} \, P_h.
$$


# Camera Transform
## World to camera coordinates (change of bases)

### Motivation:
The goal of this first step is to express the position of a point in our 3D world with respect to our camera that is also located somewhere in our 3D world. 
### Setup:
We are going to be working with 3 coordinates in this step:
- **World Coordinate System**
- **Camera Coordinate System**
- **Object Coordinate System**

The **World Coordinate System** define points in the world space with respect to the world origin (0,0,0) in terms of three orthogonal unit axes we will be calling X, Y, and Z. Having this one world coordinate system will allow us to define an arbitrary amount of other **local coordinate systems** all in terms of the world coordinate system. For example, imagine you and some friends are sitting around a table playing a board game, then you ask yourself: how a piece on the board might look from the perspective of your friend. For this problem it is useful to define both the position of your friends eyes and the position of the game piece in the form of the world coordinate system where the origin may be the center of the table. 

Continuing with the analogy you can describe your friend's coordinate system in terms of the world coordinate system, where the origin is located at your friend's eyes and is defined by another set of 3 orthogonal and unit length basis vectors, this coordinate system is analogous to the **camera coordinate system**. In general any coordinate system that is not the world coordinate system is referred to as a **local coordinate system** be that of the camera or an object.
### Important mental reframing!!!

Before continuing I want to reframe how we think about transformations (translating, rotating, shearing etc. ) of a point and change of basis of a coordinate system. 
Let's imagine a real life grid paper on your computer, iPad, or tablet screen where each cell is one unit and the cells are indexed from the bottom left corner of the page; this is a pretty logical and familiar way of indexing coordinates that we are all taught early in life. Now let's place a dot in the intersection of lines at $(1,1)$ in the coordinate grid and take note of the actual physical location of the dot on your device's screen.
- If I now want to move the dot to the position $(2,2)$ I simply pick it up and actively drag it to the new location, in this scenario we are **actively** moving the point while our grid coordinate system remains static; please take note of the physical location of the moved point on the device's screen. (depending on your device size and resolution the point probably moved a few inches or centimeters in real world coordinates). This interpretation of transformations is what made logical sense to me and what I was comfortable with for a long time, but there is another way.
- What if instead of moving the point I zoom in or stretch out the display on my device's screen until the original point at $(1,1)$ is in the same physical spot on my device as when I translated it to $(2, 2)$. The point is still technically indexed at $(1,1)$ but now every grid on my screen is twice as big as before and every intersection of my grid is shifted up and right by some distance. In this scenario the point remained in the same spot with respect to the grid's coordinates but the stretching of the coordinate system moved it to a new spot. 
Try it for yourself with Desmos:
- place a dot at $(1, 1)$
- place a dot at $(2, 2)$
- place your mouse cursor at the origin $(0,0)$
1. Now place your middle finger onto your screen on point $(1, 1)$ 
2. Place your index finger on any point on the screen and note the coordinate it falls on in the Desmos graph, try placing your index finger on  $(2, 2)$, $(2, 0)$, $(0, 2)$, and $(3, 3)$. 
3. Now zoom out with your mouse cursor until your middle finger is on the same position as $(2,2)$. 
4. What position is your index finger pointing to now? 

Algebraically, both points of view are encoded by the same matrices: one time we think of them as “moving vectors in a fixed basis,” the other time as “changing the basis in which we describe fixed vectors.” I hope this demonstrates how change of basis or changing our way of indexing points in space is similar to moving the point in a static coordinate space. Namely in the first case we keep the coordinate system static and move the point and in the second case we keep the point in the same place but we stretch or rotate the coordinate space below it thus re-expressing its coordinates. I recommend watching this [3Blue1Brown video](https://www.youtube.com/watch?v=kYB8IZa5AuE&list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab&index=3) for some nice visuals and more intuition. 

## Coordinate System Transformation

![[Pasted image 20251120180817.png]]
**Here is the cool part**: As we have seen in the [2D and 3D Transformations] article we can express any 3D transformation as a 4 by 4 matrix. The transformation matrix to go from a point defined in the local coordinate system to the world coordinate system is defined as: a top left 3 by 3 matrix with columns being the $X_l, Y_l, Z_l$ basis of the local object and the fourth column being the origin of the object. all defined in world coordinates.
$$
LtoW =
\begin{pmatrix}
e_x & e_y & e_z & o \\
0 & 0 & 0 & 1
\end{pmatrix}
(column-vector\, convention)
$$
$$
LtoW =
\begin{pmatrix}
e_xx & e_xy & e_xz & o_x \\
e_yx & e_yy & e_yz & o_y \\
e_zx & e_zy & e_zz & o_z \\
0 & 0 & 0 & 1
\end{pmatrix}
$$
where $e_{(x,y,z)}x$ is the world coordinates of the unit length local basis vector $X_l$ , $e_{(x,y,z)}y$ and $e_{(x,y,z)}z$ similarly defined. The last column is the local origin expressed in the world coordinate system. In other words, we use the orientation of the $X_l, Y_l, Z_l$ basis and position of the object relative to the world coordinate system to construct a transformation matrix $LtoW$ that when applied to points defined in the local coordinate system returns their coordinates in the world coordinate system. Some notable properties / interpretations of this matrix are:
1. The transformation is affine (preserves straight lines and parallelism and also preserves ratios along lines).
2. In homogeneous coordinates where a 3D point $\begin{pmatrix}x\\y\\z \end{pmatrix}$ is defined as $\begin{pmatrix}x\\y\\z\\w \end{pmatrix}$ when $w=0$ it defines a  homogeneous direction/ vector, but when $w=1$ it defines a homogeneous point. Meaning that the 1 guarantees translations only affects points but not directions. The columns of $LtoW$ also demonstrate this as the columns that represent the basis vectors of the local coordinate system have $w=0$ since they define directions but the actual location of the object in 3D space is a point, meaning that the last column of $LtoW$ must have $w=1$.
3. The last column encodes a translation by $o_l$ (the local origin in world space), and the top-left 3×3 block encodes a rotation that aligns the object’s local basis with the world basis.

To transform a point in camera coordinates to world coordinates $(p_c\rightarrow p_w)$ we matrix multiplying the homogeneous transformation matrix $CtoW$ (same as the local-to-world matrix but now the arbitrary object is the camera) with a homogeneous point defined in camera coordinates $\begin{pmatrix}x_c&y_c&z_c&1 \end{pmatrix}^T$: $$\begin{pmatrix}
c_xx & c_xy & c_xz & o_x \\
c_yx & c_yy & c_yz & o_y \\
c_zx & c_zy & c_zz & o_z \\
0 & 0 & 0 & 1
\end{pmatrix}
\begin{pmatrix}x_c\\y_c\\z_c\\1 \end{pmatrix}
=
\begin{pmatrix}x_w\\y_w\\z_w\\1 \end{pmatrix}
$$
Inversely, we can apply the inverse of $CtoW$ (usually referred to as world-to-camera matrix, $WtoC$) to a world coordinate point to find its camera coordinate equivalent  $(p_w\rightarrow p_c)$:
$$\begin{pmatrix}
c_xx & c_xy & c_xz & o_x \\
c_yx & c_yy & c_yz & o_y \\
c_zx & c_zy & c_zz & o_z \\
0 & 0 & 0 & 1
\end{pmatrix}^{-1}
\begin{pmatrix}x_w\\y_w\\z_w\\1 \end{pmatrix}
=
\begin{pmatrix}x_c\\y_c\\z_c\\1 \end{pmatrix}
$$
This may seem a little backwards, after all the original camera to world transformation matrix was derived based on the representation of the local or camera coordinate system in terms of the world coordinate system so shouldn't applying this transformation to a point in the world coordinate give us a camera coordinate? A way to think about it is that the camera describes a point in space using a coordinate system or more abstractly a "language" that is defined by the camera's coordinate system and the transformation matrix $CtoW$ "reinterprets" or "translates" the camera's description of the point in terms of world coordinates. $CtoW$ answers the question “given the camera’s description of a point, where is it in world coordinates?". $WtoC$ answers “given the world’s description of a point, where is it relative to the camera?” I recommend this [3Blue1Brown change of basis video](https://www.youtube.com/watch?v=P2LTAUO1TdA) or [this](https://youtu.be/Qp96zg5YZ_8?si=BSzLqWSQxv9zOlWf)video to further explore change of basis. 
![[Pasted image 20251120180903.png]]


## A bit more on cameras (Z axis and Look-At)

### Z-axis

If you want a deeper dive into cameras i.e. hardware, intrinsic / extrinsic properties and graphics representation go to this post (add link here). What is noteworthy in this context is that in the common right-handed camera convention (e.g., OpenGL-style), the camera looks down the negative $Z_c$​ axis. That means that, in camera space, objects in front of the camera have negative z-values. When we construct the view matrix $WtoC$, we choose the basis vectors so that this convention holds; in practice, this often looks like a “sign flip” of the z-direction compared to a world coordinate system where $+Z_w$ points out of the screen. Going back to our previous discussion on coordinate transformations; a more geometric way to think about the camera transformation step is to think about the camera as a generic object that had some transformation matrix applied to it in the previous model transformation step to put it in our desired location / orientation. Then performing the inverse of this model transformation on the camera and every other point has the effect of moving the camera back to the world coordinate origin and lining the camera basis up with the world basis. This results in the camera coordinate system lining up with our global world coordinate system and all our points initially defined in world coordinates moved to a new location / orientation as a function of where the camera was moved in the model transform stage. This is why in many books or lectures about video games it is said that we are not moving the camera around our world but rather moving the world around our camera since we are changing the position of points relative to our camera which defines our new origin and basis. 

### Look-At

As we have seen we can move and orient the camera in any way we want and then use the camera transform to "describe" all our other objects in the camera's coordinate system. Let's say I want to point the camera at some object or point in our 3D world, it would be nice to have a way to determine how the camera should be rotated to look at an arbitrary point, given the position of the point and the camera. Ok, so far we know the camera's local basis $x_c, y_c, z_c$ , the position of the camera $o_c$, and the position of the point we want to look at $p$ . The first step is to make sure that the camera's negative z-axis is facing towards the point, this vector will defined our "forward" camera direction, as is computed as:$$-z_c = norm(p-o_c)$$
![[Pasted image 20251120181013.png]]

Now we know how to orient in the z-direction but we still need to find how to orient along the camera's x and y directions. We also know that $x_c, y_c, z_c$ define an orthonormal basis so $y_c, z_c$ must be mutually orthogonal to each other and $z_c$. So as long as we can find an additional vector we'll call $up$: $(0, 1, 0)_w$ that is in the same $y_cz_c$ plane as $z_c$ then the cross product of $up$ and $z_c$ will necessarily produce a new vector that is orthogonal to both and can be used to find the $x_c$ basis vector for the camera. Additionally, if $|up| \neq 1$ we can add in a normalization so that $x_c$ will be unit length. Thus, $$x_c = norm(-z_c \times up)$$ or alternatively: $$x_c = norm(up \times z_c)$$
![[Pasted image 20251120181146.png]]

Now that we have both $x_c$ and $z_c$ we can find $y_c$ by performing another cross product producing our last needed orthonormal basis element:
$$y_c = x_c\times -z_c$$
![[Pasted image 20251120181227.png]]

Finally we can create our 4 by 4 matrix using $x_c, y_c, z_c$ as our basis vectors:
$$
T =
\begin{pmatrix}
x_c & y_c & z_c & o_c \\
0 & 0 & 0 & 1
\end{pmatrix} = CtoW
(column-vector\, convention)
$$
As we can see this is of the same form and indeed equal to the camera-to-world matrix $CtoW$. An additional nice property of this matrix is that since its top left 3 by 3 submatrix is made up of orthogonal columns, the inverse of that submatrix is equal to its transpose, making the switch between $CtoW$ and $WtoC$ computationally efficient.
$$
CtoW =
\begin{pmatrix}
R & o_c  \\
0 & 1
\end{pmatrix} => 
CtoW^{-1} = WtoC =
\begin{pmatrix}
R^T & -R^To_c  \\
0 & 1
\end{pmatrix} 
$$

**Caveats:**
It should be noted that you cannot account for camera roll using the look-at approach above since the camera's local up direction $y_c$ is constrained by our global $up$ direction producing a right vector $x_c$ is always in the camera's $xz$-plane. In other words, this look-at construction effectively locks the camera’s “up” to the supplied $up$ vector, so you don’t get to choose roll independently. To incorporate camera roll, we first need to rotate the camera around the z-axis and then multiply that by the look-at matrix constructed above. Additionally, if the camera's z or forward face is parallel to the $up$ vector then the cross-product used to find $x_c$ becomes zero, since the magnitude of the cross product between two vectors is equal to the determinant or the area of the parallelogram defined by the two vectors. The way to fix this is to detect when this edge case occurs and nudge the $up$ vector in the camera's y-z plane until $z_c$ and $up$ are not parallel. 
https://www.scratchapixel.com/lessons/mathematics-physics-for-computer-graphics/lookat-function/framing-lookat-function.html

https://www.youtube.com/watch?v=G6skrOtJtbM
### Let's recap:
So far all we have done is place objects in our world and go from the world coordinate system to the camera coordinate system. Paradoxically, this step is both conceptually the hardest since you have to reframe matrix transformations as change of bases but algebraically quite simple. 
- Model transform: $$
P_m = M_{\text{model}} \, P_h
$$
- Camera Transform:
$$P_c = (WtoC)P_m$$
- Combined:
$$P_c = (WtoC)M_{\text{model}} \, \tilde{P}$$
![[Pasted image 20251120181313.png]]

# Projection Transform

An important attribute of the camera transform is that it only **re-expresses** points in a new coordinate system: straight lines stay straight, parallel lines stay parallel, and ratios along lines are preserved. In other words, the camera transform is **affine**.

However, real cameras (and our eyes) have **perspective**: objects farther away look smaller, and parallel lines appear to meet at vanishing points. This is no longer an affine transformation in $\mathbb{R}^3$, but it can be represented as a linear transformation in homogeneous coordinates using a 4×4 matrix. This is our **projection transform**.

Our goal in this stage is:
Take points in **camera space** and map the visible region (the **view frustum**) into a standardized shape in **clip space** so that, after dividing by $w$, everything in front of the camera lands inside the canonical view volume, a cube: $[-1,1]^3$ defined by Normalized Device Coordinates (**NDC**) system. Note, in some graphics APIs like Vulkan the canonical view volume has width and height $[-1, 1]$ but depth $[0, 1]$. 


## Initial Camera space

After the camera transform, each vertex lives in **camera space**:
$$
p_c = \begin{pmatrix} x_c \\ y_c \\ z_c \\ 1 \end{pmatrix}
$$
with our convention:
- the camera is at the origin,
- it looks along **$-Z_c$**
- objects in front of the camera have $z_c < 0$.
![[Pasted image 20251120181351.png]]

## View Frustum

We define a **view frustum** using four parameters:
- A **near** plane distance: $n > 0$ (camera plane at $z_c = -n$)
- A **far** plane distance: $f > 0$ (camera plane at $z_c = -f$),
- A horizontal field of view $\text{fov}_x$
- An aspect ratio $a = \dfrac{\text{height}}{\text{width}}$.
![[Pasted image 20251120181415.png]]
### Near plane:
The near plane defines the closest plane to the camera from which points will be projected. The near plane distance is the minimum distance an object may be placed in front of a camera to avoid numerical issues and define a useful start for the view volume.. 

### Far Plane:
The far plane defines the farthest plane to the camera from which points will be projected. The far plane distance is the maximum distance an object may be placed away from the camera that will be projected. This limit is set for multiple reasons:
1. Depths are stored as fixed-point representations on computers thus even storing points at a depth approaching infinity is impossible.
2. The entire point of perspective projection is that objects become smaller the farther they are from the camera meaning that objects, no matter how big, at a depth approaching infinity will become infinitely small, meaning that they will be mapped to the same pixel in screen space.

### Field of View (FOV):
Field of view is the angular width of what the camera can see, and defines the angle between the sides or top and bottom of the viewing frustum. A wide FOV shows more of a scene but makes things look smaller since more viewing area has to be "squeezed" into the canonical view volume. A narrower FOV shows less of the scene, making objects look bigger and more "zoomed in". 

### Aspect Ratio:

The aspect ratio defines the shape of our final image and is simply the ratio between the width and height of our screen in pixels. 

From these four variables we can find all the information we need to produce additional variables and perform perspective projection. 

First, let's find the dimensions of the near and far planes:
At the near plane $z_c = -n$, the visible rectangle has width $2n \tan(\text{fov}_x / 2)$ and height $2n \tan(\text{fov}_x / 2)\, a.$ Similarly, at the far plane $z_c = -f$, the rectangle has width $2f \tan(\text{fov}_x / 2)$ and height $2f \tan(\text{fov}_x / 2)\, a.$ These equations can be found using simple trigonometry and the given aspect ratio. Additionally, if the field of view was given to us in terms of y and the aspect ratio as width over height then the calculations for the areas of the planes would have the same form just with the width and height flipped. Try to keep these results for the dimensions of the near and far plane in mind as we will use them at the end of the projective transform.
![[Pasted image 20251120181501.png]]
Now that we know where the viewing frustum begins and ends, and the sizes of its near and far planes, the next question is:  
How do points inside this frustum get transformed when we map it into the NDC cube?

## Perspective via similar triangles

![[Pasted image 20251120183106.png]]
Now imagine we are looking at the scene above from the side where the camera is pointed at an object. A point $p$ on the object will be projected onto the near plane and becomes $p'$. What geometric property of $p$ and $p'$ can we utilize? We can see two similar triangles: one defined by the camera origin, the near plane distance, and the projected point's height; the other by the camera origin, the point's actual distance $z_c$, and the point's actual height. Since the viewing frustum has a rectangular base the same kind of similar triangles appear whether we look at the scene from the side or from above, as we have done previously. Because of the these similar triangles, the ratio between the near plane distance and the projected coordinate must equal the ratio between the point's distance and its actual coordinate:

$$
\frac{x_{\text{proj}}}{-n} = \frac{x_c}{z_c}, \quad
\frac{y_{\text{proj}}}{-n} = \frac{y_c}{z_c},
$$
so
$$
x_{\text{proj}} = -\,\frac{n}{z_c} x_c, \quad
y_{\text{proj}} = -\,\frac{n}{z_c} y_c.
$$

You can already see the perspective effect: the division by $z_c$ means points with more negative $z_c$ (farther away) are pulled closer to the center of the near plane.

Before moving forward lets do a quick recap, so far we have a few variables that define the viewing frustum which we want to transform into a canonical view volume (a generic cube ranging from -1 to 1), additionally we have a handy relationship between how far away a point is from the camera and where it will be projected to in the near plane. We need to find a perspective transformation matrix $P$ that transforms all the points in camera space to clip space, that respects the equations for projected point we found using the similar triangles:

$$
\begin{pmatrix}
A & B & C & D \\
E & F & G & H \\
I & J & K & L \\
0 & 0 & 0 & 1
\end{pmatrix}
\begin{pmatrix}x_c\\y_c\\z_c\\1 \end{pmatrix}
=
\begin{pmatrix}-\frac{n}{z_c}x_c\\ -\frac{n}{z_c}y_c\\?\\1 \end{pmatrix}
$$
The first step is to somehow take care of the division by $z$ (depth) of the $x$ and $y$ values, since matrix multiplication is a linear operation, we cannot directly perform division within the matrix itself. In the  [[2D and 3D Transformations]] article we saw that to go from homogeneous to Euclidean coordinates we have to divide all the components of the point by the newly introduced $w$ dimension. This dimension was always 1 in the case of affine transformations but now we can make it anything that we want. Well, in this case we want to divide the $x$ and $y$ coordinates by $-z_c$ so lets set $w=-z_c$: $\begin{pmatrix}nx_c\\ ny_c\\ \frac{z_c}{?}\\-z_c \end{pmatrix}$
This allows us to solve for the first two and last row of our perspective transformation matrix, but we encounter a small issue:
$$
\begin{pmatrix}
n & 0 & 0 & 0 \\
0 & n & 0 & 0 \\
0 & 0 & K & L \\
0 & 0 & -1 & 0
\end{pmatrix}
\begin{pmatrix}x_c\\y_c\\z_c\\1 \end{pmatrix}
=
\begin{pmatrix}nx_c\\ ny_c\\ Kz_c+L\\-z_c \end{pmatrix}
$$
The first two rows correctly give us the scaled $x$ and $y$ coordinates and the last row allows us to place $-z_c$ into the $w$ position of the homogeneous coordinate so that when we convert to Euclidean coordinates we can divide by $-z_c$ (this is often referred to as the perspective divide). Now we need to solve for K and L in the third row. If we simply ignored $z_c$ or set it to a constant, we would lose all depth information, making it impossible to determine which objects are in front of others (Z-buffering).
This is kind of a tricky conundrum, we need to find some values for $K$ and $L$ that when multiplied by $z_c$ and $1$ will result in a value that when perspective divided will be the depth or $z_c$ coordinate of our point. To keep our $z_c$ values we need the output's $z$ coordinate to be mapped somewhere in the $[-1, 1]$ $z$ range of the canonical view volume, meaning that after the perspective divide:
$$z_{ndc} = \frac{Kz_c + L}{-z_c}$$
This is an equation with two unknowns so we have to find two constraints to try to solve this equation; what inequalities may constrain the depth of our viewing frustrum? Well, we know that our viewing frustum starts at a depth $n$ away, defining the near plane and extends to a maximum depth of $f$, which defines the far plane. We need the near plane to be at -1 in the NDC and the far plane to be at +1. Thus, we can set the constraints: $z_c = -n$ when $z_{ndc}=-1$ and $z_c = -f$ when $z_{ndc}=+1$ for the equation above, producing two equations which we can solve for $K$ and $L$:
$$-1 = \frac{K(-n) + L}{-(-n)} \space\text{ and }\space 1 = \frac{K(-f) + L}{-(-f)}$$
$$-n = -Kn+L \space\text{ and }\space f = -Kf+L$$
$$f+n = Kn-Kf$$
$$f+n = K(n-f)$$
$$K = \frac{f+n}{n-f} \space\text{ or equivalently }\space K = -\frac{f+n}{f-n}$$
plugging back in we find:
$$L=Kn-n => L = ( \frac{f+n}{n-f})n-n$$
$$L=\frac{n(f+n)-n(n-f)}{n-f}$$
$$L=\frac{nf+n^2-n^2+nf)}{n-f}$$
$$L=\frac{2nf}{n-f} \space\text{ or equivalently }\space L = -\frac{2nf}{f-n}$$
$$
\begin{pmatrix}
n & 0 & 0 & 0 \\
0 & n & 0 & 0 \\
0 & 0 & -\frac{f+n}{f-n} & -\frac{2nf}{f-n} \\
0 & 0 & -1 & 0
\end{pmatrix}
\begin{pmatrix}x_c\\y_c\\z_c\\1 \end{pmatrix}
=
\begin{pmatrix}nx_c\\ ny_c\\ -\frac{f+n}{f-n}z_c-\frac{2nf}{f-n}\\-z_c \end{pmatrix}
$$
It is important to note that the relationship between the input $z_c$​ and the final depth value is nonlinear due to the division by $−z_c$​. The precision is very high for objects close to the near plane and drops off as we approach the far plane. This is actually desirable, as visual artifacts are much more noticeable on objects close to the camera than on those far away.

## Bringing it together

Geometrically, when we apply the transformation above the viewing frustum becomes a rectangle with height and width equal to that of the near view plane and depth (or length) between -1 and 1. Since we want our points to be inside the canonical view volume, a cube: $[-1,1]^3$ defined by Normalized Device Coordinates (**NDC**) system we must map the $x$ and $y$ coordinates from the near plane to a plane with $-1\leq x \leq +1$ and $-1\leq y \leq +1$. 
We can do this normalization by simply dividing the parts of the matrix responsible for scaling $x$ and $y$ by the width and height of the near plane respectively. Since we already derived the length and width of the near plane earlier we can just divide by those values, which leads to a nice cancelation of $n$ and makes it so the scaling can be fully specified with the FOV and aspect ratio. Recall:
![[Pasted image 20251120181501.png]]
At the near plane $z_c = -n$, the visible rectangle has width $2n \tan(\text{fov}_x / 2)$ and height $2n \tan(\text{fov}_x / 2)\, a$. Note, that since we want to map to values between -1 and 1 and not 0 and 1, what we want to do is map the width from the center of the near plane to right side of the plane to $[0, 1]$ and the width from the center to the left between $[0, -1]$ and similarly the height between the top and bottom of the near plane. Thus, we just divide by half of the total width and height: $w = n \tan(\text{fov}_x / 2)$ and $h=n \tan(\text{fov}_x / 2)\, a$.
Thus:
$$
\begin{pmatrix}
n & 0 & 0 & 0 \\
0 & n & 0 & 0 \\
0 & 0 & -\frac{f+n}{f-n} & -\frac{2nf}{f-n} \\
0 & 0 & -1 & 0
\end{pmatrix}
$$
becomes:
$$
\begin{pmatrix}
\frac{1}{\tan(\text{fov} / 2)} & 0 & 0 & 0 \\
0 & \frac{1}{\tan(\text{fov} / 2)a} & 0 & 0 \\
0 & 0 & -\frac{f+n}{f-n} & -\frac{2nf}{f-n} \\
0 & 0 & -1 & 0
\end{pmatrix}
$$

**Note**: If the field of view is defined vertically ($\text{fov}_y$) and aspect ratio is $a=\frac{W}{H}$, as is the case in many programs, just switch the position of the expressions scaling $x$ and $y$:
$$
\begin{pmatrix}
\frac{1}{\tan(\text{fov} / 2)a} & 0 & 0 & 0 \\
0 & \frac{1}{\tan(\text{fov} / 2)} & 0 & 0 \\
0 & 0 & -\frac{f+n}{f-n} & -\frac{2nf}{f-n} \\
0 & 0 & -1 & 0
\end{pmatrix}
$$

## Extra: Handling Asymmetry (The General Case)

So far, we have assumed that our viewing frustum is perfectly symmetric. This means that if the width of our view is $W$, the frustum extends from $-W/2$ to $+W/2$. In this specific case, the camera is pointing directly through the center of the near plane.

However, there are cases where we need an asymmetric frustum. A common example is Virtual Reality (VR). In VR, your eyes are not located directly behind the center of the lens; they are slightly offset. To render this correctly without making the user dizzy, we need to shift the projection window slightly to the left or right (shearing the frustum) while keeping the camera position fixed.

To handle this, we stop defining our frustum with just FOV and Aspect Ratio, and instead define the raw coordinates of the near plane's edges:
**Left ($l$)** and **Right ($r$)**, **Bottom ($b$)** and **Top ($t$)**, **Near ($n$)** and **Far ($f$)**.
We need to map the range $[l, r]$ on the near plane to the range $[-1, 1]$ in NDC, and similarly for $[b, t]$. This is a simple linear mapping problem. For the x-axis, we need a scaling factor $A$ and an offset $B$ such that:
$$x_{ndc} = A \cdot x_{proj} + F$$
Using our boundaries (where $x_{proj}$ is the point on the near plane):
1. When $x_{proj} = l$, we want $x_{ndc} = -1$
2. When $x_{proj} = r$, we want $x_{ndc} = 1$
Thus we have a system of two equations based on the known boundary conditions (the edges of the screen):
(Left Edge): When $x_{proj} = l$, $x_{ndc} = -1$ $$-1 = A \cdot l + F \quad $$(Right Edge): When $x_{proj} = r$, $x_{ndc} = 1$ $$1 = A \cdot r + F \quad$$$$(1) - (-1) = (A \cdot r + F) - (A \cdot l + F)$$$$2 = Ar - Al + F - F$$
$$2 = A(r - l)$$
$$A = \frac{2}{r - l}$$
Now that we have $A$, we can substitute it back into either equation to solve for $F$. 
$$1 = A \cdot r + F$$
$$1 = \left( \frac{2}{r - l} \right) r + F$$
$$1 = \frac{2r}{r - l} + F$$
$$F = 1 - \frac{2r}{r - l}$$
$$F = \frac{r - l}{r - l} - \frac{2r}{r - l}$$
$$F = \frac{r - l - 2r}{r - l}$$
$$F = -\frac{r + l}{r - l}$$
### Final Result
This gives us the standard coefficients for the general projection matrix:

$$A = \frac{2}{r-l}, \quad F = -\frac{r+l}{r-l}$$
Recall that $x_{proj} = \frac{n \cdot x_c}{-z_c}$. Let's plug this into our linear mapping:
$$x_{ndc} = \frac{2}{r-l} \left( \frac{n x_c}{-z_c} \right) - \frac{r+l}{r-l}$$
To get this result from our 4x4 matrix (which happens before the divide by $-z_c$), we need to multiply the offset term $F$ by $-z_c$ so that the denominator cancels out later.
$$x_{clip} = \left(\frac{2n}{r-l}\right)x_c + \left(\frac{r+l}{r-l}\right)z_c$$

Wait, why is the term attached to $z_c$ positive? Because in the matrix multiplication, the term in the 3rd column is multiplied by $z_c$. Since we eventually divide by $-z_c$, a term of $\frac{r+l}{r-l} z_c$ becomes $-\frac{r+l}{r-l}$ after division, which matches our offset $F$.
This gives us the **General Perspective Projection Matrix**:
$$\begin{pmatrix} \frac{2n}{r-l} & 0 & \frac{r+l}{r-l} & 0 \\ 0 & \frac{2n}{t-b} & \frac{t+b}{t-b} & 0 \\ 0 & 0 & -\frac{f+n}{f-n} & -\frac{2nf}{f-n} \\ 0 & 0 & -1 & 0 \end{pmatrix}$$
### Why were they zero before?
Look closely at the term in the third column, row 1: $\frac{r+l}{r-l}$.
In our previous symmetric derivation using FOV, the right side was the exact opposite of the left side ($r = -l$).
$$r + l = r + (-r) = 0$$
Therefore, the term $\frac{0}{r-l}$ became 0. Similarly for the y-axis, if the top is equal to the negative bottom ($t = -b$), the term $\frac{t+b}{t-b}$ becomes **0**. This explains why standard projection matrices have zeros in the third column: they assume a perfectly centered camera. But if you ever need to create an off-center projection (for stereo rendering, VR, or tiled displays), you simply populate those terms with the ratio of the asymmetry to the width.
