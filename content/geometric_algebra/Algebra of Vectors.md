
This article is a bit of a repeat if you have a basic knowledge in linear algebra but nonetheless it is useful to describe the operations we can do with vectors from the ground up. 
## Length of a vector

To find the length of a vector we first have to place the vector in some coordinate system. Then the length of the vector is defined as the distance between the base and tip of the vector as defined in that coordinate system. The notation used for the length of the vector $v$ is denoted as $|v|$. A vector with a length of 0, $|v| = 0$, has length 0 and no orientation as it is "squished" into a single point. A vector with a length of 1, $|v| = 1$ is called a unit vector, and often times we will see unit vectors represented with a hat to denote their magnitude: $\hat{v}$. 

## Scaling

To change the length of a vector i.e. scale it by a number $a$ you simply multiply the vector by that number, which we now call a scalar, $av$. In scalar multiplication the product of a scalar and a vector results in another vector. If we allow scalars to take on a negative value the scalar multiplication has the effect of flipping the vector in the opposite direction and applying the scaling. 

## Vector Addition

If we consider 1D vectors with origin 0 then you can describe any number as a 1D vector $v = [n]$ with base at 0 and tip at at a number n. Geometrically the addition of two of these vectors $v + w$ can be thought of placing the base of $w$ at the tip of $v$ thus producing a new vector $u$ which has its base at the base of $v$ and tip at the tip of the appended $w$. It is easy to see that no matter if we append $w$ to the tip of $v$ or vice versa the resulting vector $u$ will be the same. Additionally , (hehe) if a vector is negative, can be thought of being scaled by $a = -1$, then geometrically its addition with another vector is like "flipping" the vector and appending it to the tip of the first vector. This definition of vector addition can be abstracted to an arbitrary $N$ dimension.  

Now that we have defined vector scaling and addition lets explore the properties of these operations. 

--- 
## Algebraic Properties of Vectors

### Commutativity of Addition  

As briefly discussed above $w + v = v + w$ since geometrically the resulting vector $u$ will be the same. 

### Associativity of Addition

$u+(v+w) = (u+v)+w$, once again geometrically the order of addition does not change the result of the addition since in both cases the final vector which is a combination of $u, v, w$ is the same. We could also use the definition of commutativity above to reorder the expression to have the same algebraic form. 

### Additive Identity 

Simply states $v + 0 = v$, geometrically if we regard $0$ as a vector with length 0 and no direction than its addition to $v$ simply results in the unchanged vector $v$. Similarly, $v - v = 0$ can be derived algebraically from $v+0=v$ by rearranging the terms and can be though of geometrically as saying that adding the opposite of a vector on the same vector will always result in the 0 vector. 

### Absolute Value of Vectors 

The absolute value of a vector or in other words the length is always a non-negative number unless the vector is the zero vector. This is because length is an intrinsically positive value, i.e. the direction of the vector does not change its length thus we can write $|-v| = |v|$, geometrically this is saying no matter what direction the vector faces its distance from its base is the same. Lastly, we can see that if $|v| = 0$ then the vector must be the zero vector $v=0$. 

**Here is a bit of a speed run describing other properties of vectors**:

- $|u+v| \le |u| + |v|$ geometrically you can use a triangle with sides $u$, $v$ and hypotenuse $u+v$ and for a triangle the hypotenuse must be smaller than the sum of two sides otherwise the triangle degenerates to a line or becomes undefined. 
- $av = va$: scalar multiplication is commutative, more of a notational nicety.
- Compatibility: with scalars $a$ and $b$ and vector $v$: $a(bv)=(ab)v$, geometrically this means that scaling a vector by $b$ and then scaling it by $a$ is the same as scaling it once by the product of $a$ and $b$. 
- Distributivity I: $a(u+v) = au + av$ reads as the scaling of a sun of vectors is the same as the individual scaling of the vectors and then their addition. Geometrically the similarity of the two triangles when drawing out the addition described by the two sides of the inequality can be used to prove this.
- Distributivity II: $u(a+b) = ua +ub$ alternatively $(a+b)u = au+bu$ which reads as a vector scaled by a sum of two scalars is the same as the vector scaled by one scalar plus the same vector scaled by the second scalar. Since we are only considering the lengths of the vectors i.e. their scaling the distributivity of regular numbers or scalars can be used to prove this identity. 
- Identity: $1v =v$
- $0v = 0$, note here the $0$ represents the zero vector. 
- $\frac{v}{a} = \frac{1}{a}v$  

Lastly and somewhat importantly:
### Normalization
$\frac{v}{|v|} = \hat{v}$ or in other words a vector divided by its length is the same vector but now with length of one aka a unit vector. 

Next article: [[Spaces, Spans, Basis, and Dimensions]] 
