# Exterior Algebra

add link to (Products.md article here)

(This might have some connection to geometric algebra)


Motivation for exterior calculus:
- Natural language for talking about signed volume 
- used in both algebraic geometry and geometric algebra (clifford algebra)
- widely used in physics 
- decent language for computer science

We need a language that can generalize linear algebra to manifolds and ways to write equations in those spaces. 

## Vector Spaces
A vector space is a set V with addition and scalar multiplication operations where the associated identities must hold. These rules are based on how oriented lengths (vectors) as mathematical objects are a useful tool / concept for modeling nature. 


## Inner product
Captures how well two vectors in V "line up". 

## Span
In any vector space V, the span of a finite collection of vectors is the set of all their possible linear combinations. Basically, using a set of vectors what other set of vectors can we construct from their linear combinations. 

## Basis and Dimension
A linearly independent collection of vectors ($e_i$s) is a basis for V if every vector $v \in V$ can be expressed as a linear combination of those vectors ie. every vector can be uniquely expressed a s linear combination of the basis vectors $e_i$.


## Wedge Product
Captures a notion of orientation and magnitude of k number of vectors which results in a k-vector (output of the wedge product on k vectors). 
A zero vector is a scalar value, no direction only magnitude.

## Hodge Star
Let U $\ein$ be a linear subspace of a vector space V with an inner product. The orthogonal complement of U is the collection of vectors:
$$U^\bot :== {v \in V | \langle u, v \rangle = 0, \all u \in U}$$ The orthogonal complement is useful because it allows us to describe a complement (opposite) of vector(s) / spaces. 
The Hodge Star is an operator that uses the orthogonal complement to map a k-dimensional oriented quantity to its complementary (n-k)-dimensional quantity using the inner product structure of the space. Intuitively, it turns “primal” geometric elements into their orthogonal duals while preserving magnitude and orientation information.

Geometrically:
- A vector is mapped to the oriented area perpendicular to it
- An area element is mapped to the perpendicular line
- A scalar is mapped to full volume, and vice versa
Thus, the Hodge star formalizes the idea of an orthogonal complement with magnitude.

**Basis for K vectors**: in R3 we have 3 basis vectors $e_1, e_2, e_3$, we can also have basis 2-vectors  $e_3 \wedge e_1, e_2 \wedge e_3, e_1 \wedge e_2$ and a basis 3-vector $ e_1 \wedge e_2 \wedge e_3$

In general, in a D-dimensional vector space, the number of basis k-vectors ie elements of $\wedge^k(V)$ is: $D \choose k$


## STAR:
For any basis k-vector $\alpha := e_i_1 \wedge . . . \wedge e_i_k$, we must have $det(\alpha \wedge \star \alpha) = 1$ In other words if we start with a "unit volume" wedging it with its hodge star must also give a unit, positively-oriented unit volume. 
