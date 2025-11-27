This is also a little bit of a recap if you know linear algebra but it is still good to state them once more explicitly. 
# Spaces

Spaces are infinite globally continuous regions with no holes that must have some defined origin. We can use vectors, more specifically, sets of vectors to define a space. The ability to define spaces in terms of vectors necessitates that the space has an origin from which vectors could be defined from. 
To account for the infinity of a space in a certain direction we can say that for any vector in a region, the scaled version of that vector must also exist in that region to be considered a space. Algebraically, for any vector $v$ in the region (or set if we are talking more algebraically) and any scalar $a$, the product of $av$ must still be in the set (1) (Closure under scalar multiplication). However, if we want our space to be globally infinite and continuous they must also have the property that for any vectors $u, v$ in the region (set) their sum $u+v$ must also be in the set (2)(Closure under addition). 
From (1) we can see that if $v$ is in the set than $-v$ must also be in the set and scaling any $v$ by 0 must mean that the zero vector must exist in every set i.e. the origin must exist in every set. 

Extra:
Is a region defined by a set of all unit vectors a space?
No, since the addition of 2 unit vectors is usually not a unit vector.
Is a region defined by a set of all 0 vectors a space?
Well, the set of all 0 vectors or vector of length 0 is just the set of the single zero vector which is indeed a space since it satisfies (1) and (2) and is the 0-dimensional space; a point.
# Spans

Ok so now we know for a region to be a space (1) and (2) must hold, but what is the simplest way to define an entire space with a finite set of vectors? From the combination of (1) and (2) its obvious that for a set of vectors their linear combination is able to produce a new set of vectors. The span of a set of vectors is the set of vectors that can be constructed from the linear combination of our initial set $S$ i.e. $Span(S)$ = the set of linear combinations of vectors from $S$.  If a set of vectors whose linear combination can represent any arbitrary vector in a space then that set is a good enough to define the space itself. 
Additionally, we can derive that adding two vectors in $Span(S)$ must still be in $Span(S)$
and scaling any vector in $Span(S)$ must still be in $Span(S)$. A set $S$ that spans all possible points in a space is a spanning set for that space, however that spanning set might be made up of an arbitrary number of vectors some of which may be linear combinations of each other. 
# Basis 

To decrease the size of the spanning set $S$ we can check if any vectors in the set is a linear combinations of some / all other vectors in the set, if we find that this is indeed the case than the set is called linearly dependent. If we cannot find a way to represent a vector in the set in terms of linear combinations of other vector(s) in the set than that set is linearly independent. Alternatively, we can say that if removing a vector from $S$ changes the $Span(S)$ than the set $S$ must have been linearly independent. From the definition before we can show that any set containing the zero-vector must be linearly dependent since the linear combination of the zero vector with any other vector is just the vector itself, so including the zero vector would not change the span of the set of vectors. A set containing the zero vector or just the zero vector itself is linearly dependent and a set that contains a single nonzero vector is linearly independent. Finally, we can say that a **basis** for a space is simply a linearly independent set of vectors that span the space. This allows us to write any vector in exactly one way using a unique combination of vectors in the basis; the basis vectors. (Note: by the unique combination of vectors I mean vectors with unique coefficients, the order of combination of the basis vectors in irrelevant.)

## Types of Basis

While vectors that are not orthogonal to each other can be basis vectors in practice we often use orthogonal basis vectors to define points in our spaces because of their ease of geometric interpretability.  Furthermore, normalized basis i.e. basis with length of 1 also make counting units in term of our basis simpler so a combination of unit length orthogonal basis vectors aka orthonormal basis vectors are used. In geometric algebra we will algebraically index orthonormal basis vectors that are aligned with our axis as $e_n$ as the $n$th element of our standard basis. 

**Extra:**
In general the lengths of an $D$-dimensional vector expressed in standard basis is the square root of the sum of the component squared. 

# D Dimensional Spaces

Every basis for a D-dimensional space has exactly D basis vectors, any less and you cannot span the entire space, any more and your set of basis vectors becomes linearly dependent. But what defines the dimensionality of a space? Well, since we know that the size of basis must equal the dimension of a space lets express the dimension of a space (a linear space to be exact) as the size of a basis for that space. This equality between the dimension of a space and the size of its basis provides an algebraic abstraction that will become especially useful when dealing with arbitrarily large dimensions. 

Next Article: [[Paravectors and Direct Sums]] 
