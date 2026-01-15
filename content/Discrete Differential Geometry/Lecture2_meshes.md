# Meshes


**Convex set**: A subset $S \in R^n$ is convex if for every pair of points $p, q \ei S$ the line segment between p and q is contained in S.  

**Convex Hull**: For any subset $S \in R^n$, its convex hull conv(S) is the smallest convex set containing S, or equivalently, the intersection of all convex sets containing S.

**Affine Independent**: Analogously to linear independence of vectors affine independence is when for a collection of points $p_0 ... p_k$, their vertices, $v_- = p_i - p_0$ are linearly independent. 

**Simplex**: Geometrically, a k-simplex is the convex hull of k+1 affinely-independent points, which we call its vertices. Ex. a point, line segment, a triangle, a tetrahedron etc. Note: A k-simplex is only defined for / affinely-independent in k <= D dimensions, since by definition 4 points, a 3-simplex, would become affinely dependent in 2D since in 2D every vector can be described in a basis of just 2 vectors. 

We can describe a simplex more explicitly using barycentric coordinates. ie a nonnegative weighted sum of vertices where the weights sum to 1

**Simplicial Complex**: (just a fancy name for a mesh) is a collection of simplicies.  

**Face of a simplex**: A face of a simplex $\sigma$ is any simplex whose vertices are a subset of the vertices of $\sigma$. Example, the faces of a triangle are the points and lines of the triangle. 


Ex: Any undirected graph $G=(V, E)$ is an abstract simplicial 1-complex since it only has edges and vertices. 


**Closure**: smallest simplicial complex containing a given set of simplicies.

**Star**: union of simplicies containing a given subset of simplicies. 

**Link**: closure of the star minus the star of the closure. 
(returns the simplicies "barely outside" the queried simplicies)

### Notation:

- For simplicial 1-complexes (graphs) we often write G = (V, E)
- For simplicial 2-complees (triangle meshes) we often write  $K = (V, E, F)$ where
- $V$ = vertices
- $E$ = edges
- $F$ = faces* (a triangle)


## Oriented simplicial complex

**Orientation of a 1-simplex**: unordered set {a,b}, can have an order (a,b) or (b, a)


**Orientation of a 2-simplex**: orientation is given by "winding order" of vertices. 

**Oriented k-simplex**: An oriented k-simplex is an ordered tuple, up to even permutation. ie, we can have lefty / righty, even / odd, CW / CCW orientation for every k-simplex. 

**Oriented simplicial complex**: is just a simplicial complex where each simples is given an ordering. 

**Relative Orientation**: Two distinct oriented simplicies have the same relative orientation if the two (maximal) faces in their intersection have opposite orientation. 

# Manifolds

A simplicial k-complex is manifold if the link of every vertex looks like a (k-1)-dimensional sphere. (doesent really work for boundary simplicies)

Ex. for k=2, triangle meshes, it is manifold if for every edge is contained in exactly two triangles or just one along the boundary.
Furthermore, every vertex is contained in a single "loop" of triangles or a single "fan" along the boundary. 


## Topological Data Structures

**Adjacency list**: store only top-dimensional simplicies.
pros: simple, small storage cost
cons: hard to iterate over and expensive to access neighbors.


**Incidence matrix**: example for a 3D tetrahedron we store a 2 matrices; $E^0$ which has rows representing edges and columns represent vertices. We one-hot encode the two vertices that belong to each edge every row. We also store another matrix $E^1$ where the rows correspond to the triangles and every column represents edges. Additionally, you can also have signed incidence matrices.
Pros: decent for matrix operations. 
Cons: sparse

**associative array**: from (row, col) -> value
pros: easy lookup/  set entries.
cons: harder to do matrix ops

**Array of linked lists**: conceptually simple but longer access time.

Most popular:
**compressed column format**: stores: values, row indices, and number of entries per column to help with indexing. hard to add / remove entries but fast for matrix ops. 

**Half edge mesh**: each edge gets split into two oppositely-oriented half edges. Each half edge knows its twin, the next half edge, its start, the edge it belongs to, and the face it belongs to. 

Lecture had a bit more about Duality here but it was not super well developed so I'll leave it for later. 
