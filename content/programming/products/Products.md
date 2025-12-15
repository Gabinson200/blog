# Products

In this article I want to explore the basic products used throughout different algebraic mathematics and their relationships. Additionally, I want to also take a computational approach and see how they may be leveraged for optimizations as modern GPUs and NPUs are built for maximizing MACs (matrix multiplications and additions).

> The following article will introduce the geometric product first and then try to decompose it into the dot and wedge products, this is a little backwards as conceptually it is easier to build the geometric product up but I want the article to take a top-down style approach.


# THE (geometric) product 

What is multiplication? Using our caveman brain we know that multiplication is just taking some amount and adding it together some other amount of times. With this definition all fundamental properties of multiplication can be found:

- Commutative Property: $a \times b = b \times a$
- Associative Property: $(a \times b) \times c = a \times (b \times c)$
- Identity Property: $a \times 1 = a$
- Distributive Property: $a \times (b + c) = (a \times b) + (a \times c)$

If we go forward in time to Egypt around 1770 BC when the concept of zero was first used / invented we get:
- Zero Property: $a \times 0 = 0$

If we go forward in time to around 3rd-2nd century BCE China when negative numbers were first used we can find the:
- Rules for signs: $-a \times b = -(a \times b)$ and $-a \times -b = a \times b$

The above is the definition and properties of THE (geometric) product in 1D (for scalars).

I explicitly write out these properties of multiplication not because I assume you are around the age of 10 but because by modifying or adding / subtracting from them we can create new types of products. 

Finally, since we will be working with vectors lets define $v_1, v_2, ... v_k$ k vectors in $R^n$ where each vector has an n-dimensional orthonormal basis ${e_1, e_2, ... e_n}$

> From now on assume all our basis are orthonormal ie perpendicular to each other and unit length.

A scalar is a 0 dimensional object representing a pure value. A 1D vector $v = ae_1$ encodes both a magnitude thanks to the scalar $a$ and a direction defined by it's basis $e_1$. A 2D vector $v$ can be represented abstractly by taking a magnitude and direction in two dimensions and adding them together $a = a_1e_1 + a_2e_2$. Geometrically this is like adding together two 1D vectors tip-to-base to create a new 2D vector that can span the 2D space. 
Additionally, before moving forwards lets keep in mind that Euclidean geometry must respect distances, namely for a 2D vector $a$ its length must be:
$$|a|^2 = |a_1e_1|^2 + |a_2e_2|^2$$ (Pythagorean Theorem). 

Nice, now we more or less have all the building block to derive all of geometric algebra top down.

Well, let's start with the 1D case. If we have a vector $a=3e_1$​, we can think of this as the number 3 pointing in the $e_1$​ direction.
If we want to build a "General Geometric Product," it has to be backwards compatible. It can't break the math we already know, namely $3 \times 3 = 9$. So, let's look at our vector multiplication:
$$aa=(3e_1​)(3e_1​) = 
3\times 3\times (e_1​e_1​) = 
a^2=9e_1^2​$$

For this to match the reality we live in, where $3\times 3$ is simply the scalar 9, we are forced to conclude that $e_1^2$​ must equal 1.
This gives us our first fundamental geometric rule: Squaring a unit basis vector yields the scalar. $$e^2 = 1$$ or in general $$v^2 = |v|^2$$
This seems trivial, but it has a profound physical implication: multiplying two parallel vectors (like $e_1$​ and $e_1$​) results in a pure scalar quantity. The "direction" is consumed, leaving only magnitude. Additionally, if $e^2 = 0$ or some other vector, we couldn't easily undo multiplication. By setting $e^2 = 1$, we ensure that $e$ is its own inverse. This allows us to divide by vectors, something that we could not do with the dot or cross products. Another way to justify $v^2 = |v|^2$ is by using $|a|^2 = |a_1e_1|^2 + |a_2e_2|^2$. We know $a$ is a 2D vector that is defined by the addition of two 1D vectors. Lets assume the the side lengths of a right triangle are 1, 1, $\sqrt 2$ as found by the scalar version of Pythagoras formula. Thus:
$$|a| = \sqrt 2 \rightarrow |a|^2 = 2 = |a_1e_1|^2 + |a_2e_2|^2 \rightarrow e_1 /e_2 = 1$$


Keeping $v^2 = |v|^2$ in mind lets take a look at the 2D version. Given two 2D vectors $v = v_1e_1 + v_2e_2$ and $w = w_1e_1 + w_2e_2$ we can once again take their products and get 
$$vw = (v_1e_1 + v_2e_2)(w_1e_1 + w_2e_2) = v_1w_1e_1^2 + v_1w_2e_1e_2 + v_2w_1e_1e_2 + v_2w_2e_2^2$$
$e_1^2 \text{ and } e_2^2 \rightarrow 1$ thus:
$$v_1w_1 + v_1w_2e_1e_2 + v_2w_1e_1e_2 + v_2w_2$$

Now we hit a snag. What is the relationship between $e_1​e_2$​ and $e_2​e_1$​? Are they the same? Let's use the fact that squaring measures length on the vector sum ($e_1​+e_2$​). Geometrically, $e_1​+e_2$​ is the diagonal of a unit square. By Pythagoras, its length squared is 2. Algebraically, we expand:
$$(e_1 + e_2)^2 = e_1^2 + e_1e_2 + e_2e_1+ e_2^2$$
$$2 = 1 + (e_1e_2 + e_2e_1) + 1$$
$$0 = e_1e_2 + e_2e_1$$
$$-e_1e_2 = e_2e_1$$

This is the Anticommutative Property. It tells us that swapping the order of orthogonal vectors flips the sign.

Now we can finish our product equation. Since $e_2​e_1​=−e_1​e_2$​, we substitute and find:

$$(v_1w_1 + v_2w_2) + (v_1w_2 - v_2w_1)e_1e_2$$

Now we have successfully decomposed the geometric product into two distinct parts:
1. The scalar part (Dot product): $(v_1w_1 + v_2w_2)$
2. The Bivector Part (Wedge Product): $(v_1w_2 - v_2w_1)e_1e_2$

using caveman logic and the two additionally derived properties of geometric products:
- $v^2 = |v|^2$
- $-e_1e_2 = e_2e_1$


# Wedge Product 


https://www2.tulane.edu/~ftbirtel/wedge%20product.pdf

## Algebraic Interpretation
## Geometric Interpretation
## Computational Interpretation


# Cross Product

## Algebraic Interpretation
## Geometric Interpretation
## Computational Interpretation


# Dot Product

## Algebraic Interpretation
## Geometric Interpretation
## Computational Interpretation


