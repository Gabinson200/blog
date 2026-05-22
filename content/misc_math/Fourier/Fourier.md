# Fourier $\mathfrak{F}$

## Resources

- [Video series from steve brunton](https://www.youtube.com/playlist?list=PLMrJAkhIeNNT_Xh3Oy0Y4LTj0Oxo8GqsC)
- [3B1B related videos](https://www.youtube.com/watch?v=spUNpyF58BY&list=PL4VT47y1w7A1-T_VIcufa7mCM3XrSA5DD)




In this article I want to explore / derive the Fourier series and transformation using geometry, linear, algebra and calculus.

Hopefully, by the end we will be able to demonstrate how complex signals can be broken down into simpler components which can be analyzed and used for many interesting applications that underlie our modern world. 

The rough outline of the article is:
- Historical background
- Problem Statement
- Functions as basis for functions (Pure mathy, linear algebra view)
- Fourier Series (more calculus)
- Fourier Transform 
- Discrete Fourier Transform ()



# Historical Background

As a small aside I want to talk a tiny bit about the history of the math that we will be discussing, both because it is interesting and because it underlines how closely the Fourier and Laplace transform are interconnected. So let’s meet our two main characters, Joseph Fourier (1768–1830) and Pierre-Simon Laplace (1749–1827), the namesakes of the transforms we will be discussing.

Fourier’s ideas grew out of the study of heat flow, where he showed that temperature distributions could be decomposed into sine and cosine modes. Laplace’s related transform emerged from work connected to probability, differential equations, and mathematical physics, where exponential weighting made difficult equations easier to manipulate.

However, Fourier and Laplace were not isolated figures working in separate mathematical worlds. Fourier was part of the same French scientific circle as Laplace, Lagrange, and Monge, and as a younger mathematician he encountered them through the new institutions of revolutionary France, especially the École Normale and École Polytechnique. Their relationship seems to have been cordial but intellectually tense: Laplace later served on committees evaluating Fourier’s work on heat, and although he raised objections to Fourier’s use of trigonometric series, he also recognized Fourier’s priority in formulating the heat equation.

I met these ideas in different contexts: the Fourier transform was introduced to me in signal processing as a way to measure frequency content, while the Laplace transform showed up in differential equations as a way to convert initial-value problems into algebra. But this division is somewhat artificial. For causal signals, the Laplace transform can be thought of as a more general Fourier transform. It replaces the purely oscillatory term $e^{-i\omega t}$ with $e^{-st}$ where $s = \sigma + i\omega$. The extra $\sigma$ term lets us add exponential damping, making the transform converge in cases where the Fourier transform may fail. If we then restrict back to the imaginary axis, $s = i\omega,$ we recover the Fourier viewpoint.


# Problem Statement

* (This part is a little pure mathy but I think its useful to work down from higher levels of abstraction to really derive Fourier transforms from the ground up)

The overall broad question that we want to address is: are there ways to decompose a function or class of functions into simpler functions. Additionally, are there any limits on the complexity of functions we can break down into simpler "atomic" functions? How complex are the "atomic" functions? And how well can they be used to reconstruct our original function? Ok, that is all pretty vague so lets try to narrow our area of search.

Lets imagine a "complex" function as a black box with some inputs and outputs, our goal is to find several "simple" function boxes that when connected together perform the same operation as the more complex function. For example if we have a "complex" function $y=2x$ we can approximate that as an addition of two other functions $y_1 = x$ and $y_2 = x$ where $y = y_1 + y_2$. Alternatively, we can use multiplication or any other combination of operations for as the connective glue used to combine our simpler functions. Ex, $y=2x$ then $y_1 = x$ and $y_2 = 2$ then $y = y_1 \times y_2$. More broadly, what we want to find are the simple mathematical objects (functions in this case) that when combined have a very large possible output space so they can be used to construct a wide variety of "complex" functions.

# Functions as basis for functions

## Function Spaces

Hmmm, all this talk of operations and spaces makes me think of linear algebra, where instead of functions we were working with vectors (which do have the duality of acting as functions in a sense). In linear algebra, the first structure we usually study is a vector space. A vector space is a set of objects where we are allowed to do two basic operations:

1. add two objects together
2. multiply an object by a scalar

If these two operations behave nicely, then the objects in the set can be treated like vectors, even if they do not look like the usual arrows in space. More formally, a vector space over a field $\mathbb{F}$, usually reals $\mathbb{R}$ or complex $\mathbb{C}$, is a set $V$ together with two operations:

$$ + : V \times V \to V $$ and $$\cdot : \mathbb{F} \times V \to V.$$

The first operation is called vector addition, and the second is called scalar multiplication. For $V$ to be a vector space, the following conditions must hold for all $u,v,w \in V$ and all scalars $ a,b \in \mathbb{F}$


We can do something very similar with functions. A **function space** is a vector space whose elements are functions. Instead of vectors like

$$\mathbf{v} = (v_1,v_2,v_3),$$

the objects are functions like

$$f(x), \quad g(x), \quad h(x).$$

To turn a set of functions into a vector space, we define addition and scalar multiplication **pointwise**:

$$(f+g)(x)=f(x)+g(x)$$
and
$$(af)(x)=a f(x).$$

So if $\mathcal{F}$ is a set of functions from some domain $D$ into a field $\mathbb{F}$, then $\mathcal{F}$ is a function space if it satisfies the same vector-space conditions under these pointwise operations.

<style>
  table.vector-function-table {
    border-collapse: collapse;
    width: 100%;
  }

  table.vector-function-table th,
  table.vector-function-table td {
    border: 1px solid black;
    padding: 8px;
    vertical-align: top;
  }

  table.vector-function-table th {
    font-weight: bold;
    text-align: left;
  }
</style>

<table class="vector-function-table">
  <thead>
    <tr>
      <th>Condition</th>
      <th>Vector space version</th>
      <th>Function space version</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Closure under addition</strong></td>
      <td>If $u,v \in V$, then $u+v \in V$.</td>
      <td>If $f,g \in \mathcal{F}$, then $f+g \in \mathcal{F}$, where $(f+g)(x)=f(x)+g(x)$.</td>
    </tr>
    <tr>
      <td><strong>Commutativity of addition</strong></td>
      <td>$u+v=v+u$.</td>
      <td>$f+g=g+f$, meaning $f(x)+g(x)=g(x)+f(x)$.</td>
    </tr>
    <tr>
      <td><strong>Associativity of addition</strong></td>
      <td>$(u+v)+w=u+(v+w)$.</td>
      <td>$(f+g)+h=f+(g+h)$.</td>
    </tr>
    <tr>
      <td><strong>Additive identity</strong></td>
      <td>There exists a zero vector $0 \in V$ such that $u+0=u$.</td>
      <td>There exists a zero function $0 \in \mathcal{F}$, defined by $0(x)=0$, such that $f+0=f$.</td>
    </tr>
    <tr>
      <td><strong>Additive inverse</strong></td>
      <td>For every $u \in V$, there exists $-u \in V$ such that $u+(-u)=0$.</td>
      <td>For every $f \in \mathcal{F}$, there exists $-f \in \mathcal{F}$, defined by $(-f)(x)=-f(x)$, such that $f+(-f)=0$.</td>
    </tr>
    <tr>
      <td><strong>Closure under scalar multiplication</strong></td>
      <td>If $a \in \mathbb{F}$ and $u \in V$, then $au \in V$.</td>
      <td>If $a \in \mathbb{F}$ and $f \in \mathcal{F}$, then $af \in \mathcal{F}$, where $(af)(x)=af(x)$.</td>
    </tr>
    <tr>
      <td><strong>Compatibility of scalar multiplication</strong></td>
      <td>$a(bu)=(ab)u$.</td>
      <td>$a(bf)=(ab)f$.</td>
    </tr>
    <tr>
      <td><strong>Scalar identity</strong></td>
      <td>$1u=u$.</td>
      <td>$1f=f$.</td>
    </tr>
    <tr>
      <td><strong>Distributivity over addition</strong></td>
      <td>$a(u+v)=au+av$.</td>
      <td>$a(f+g)=af+ag$.</td>
    </tr>
    <tr>
      <td><strong>Distributivity over scalar addition</strong></td>
      <td>$(a+b)u=au+bu$.</td>
      <td>$(a+b)f=af+bf$.</td>
    </tr>
  </tbody>
</table>

So, function spaces are not an entirely new idea. They are vector spaces where the vectors happen to be functions. This is the conceptual bridge that lets us use linear algebra to study functions.


## Inner product of functions

Now that we defined some properties of function spaces a natural question that arises is: what is the analogous dot (inner) product in the function space? In ordinary finite-dimensional linear algebra, the dot product between two vectors is defined as

$$
\mathbf{u}\cdot \mathbf{v}
=
|\mathbf{u}||\mathbf{v}|cos(\theta)
=
\sum_{i=1}^{n} u_i v_i
$$

The dot product measures how much two vectors point in the same direction. If the dot product is large and positive, the vectors are strongly aligned. If it is zero, the vectors are orthogonal, meaning they point in independent directions. 

More generally, an inner product is an operation that generalizes the dot product. It takes two objects from a vector space and returns a scalar:

$$\langle u,v\rangle \in \mathbb{F}$$

So the dot product is a specific example of an inner product:

$$\langle \mathbf{u},\mathbf{v}\rangle=\mathbf{u}\cdot \mathbf{v}$$

The reason we use the more general phrase “inner product” is that not every vector space is made of ordinary coordinate vectors. Once our “vectors” are functions, we need an analogous operation that still measures alignment.

So lets derive the inner product for the function space.
Lets say we have two regular functions $f(x)$ and $g(x)$ defined on the domain $[a,b]$ that we can sample from at a regular interval $\Delta x = \frac{b-a}{n-1}$ where $n$ is the number of samples. We can then take the sampled outputs from our two functions and store them in an n-dimensional data vector we'll call $\hat{f}$ and $\hat{g}$ respectively. We can now take the inner product between those two data vectors:
$$ \langle \hat{f}, \hat{g} \rangle  =  \hat{g}^T \hat{f} = \sum_{i=1}^{n} f_i g_i$$

We now have the inner product for the data vectors but this is different from the inner product of the function since we are only considering a finite number of sampled elements with the added complication that as the number of our samples increases we end up summing together more terms leading to an explosion in the size of the inner product. So what we can do is simply normalize the contribution of each sample by the sampling interval $\Delta x$:

$$\langle \hat{f}, \hat{g} \rangle \Delta x  = \sum_{i=1}^{n} f_i g_i \Delta x$$

We can interpret each sample value $f_i g_i$ as measuring the local overlap between the two functions at one point in the domain. However, a single sample should not contribute by itself; it should contribute in proportion to the small interval of the domain that it represents. This is why we multiply each term by $\Delta x$.

If we define

$$h(x)=f(x)g(x)$$

then our weighted sum becomes

$$\sum_{i=1}^{n} f_i g_i \Delta x = \sum_{i=1}^{n} h(x_i)\Delta x$$

This is exactly the form of a Riemann sum. As we increase the number of samples, the spacing between samples gets smaller:

$$n \to \infty, \qquad \Delta x = \frac{b-a}{n-1} \to 0$$

In that limit, the discrete sum approaches the continuous integral:

$$
\lim_{n\to\infty}
\sum_{i=1}^{n} f_i g_i \Delta x
=
\int_a^b f(x)g(x)\,dx.
$$

So the function inner product is the limiting case of the ordinary vector dot product applied to finer and finer sampled versions of the functions. Thus for functions, the standard inner product is defined by multiplying the two functions pointwise and integrating over the domain:

$$\langle f,g\rangle=\int_a^b f(x)g(x)\,dx$$

This is the continuous analogue of the dot product. The dot product multiplies matching vector components and adds them:
$$\sum_{i=1}^{n} u_i v_i$$

The function inner product multiplies matching function values and “adds” them continuously using an integral:
$$\int_a^b f(x)g(x)\,dx.$$

So the analogy is:

$$\text{finite sum over vector components} \quad \longrightarrow \quad \text{continuous sum over function values}.$$

For complex-valued functions, we usually use the complex conjugate of the second function:

$$\langle f,g\rangle = \int_a^b f(x)g^*(x)\,dx$$


This ensures that the inner product of a function with itself gives a nonnegative quantity:
$$\langle f,f\rangle = \int_a^b |f(x)|^2\,dx$$

Just like with ordinary vectors, this lets us define the length, or norm, of a function:
$$\|f\|=\sqrt{\langle f,f\rangle}$$

For real-valued functions, this becomes
$$\|f\|=\sqrt{\int_a^b f(x)^2\,dx}$$

Most importantly for Fourier analysis, the inner product lets us define orthogonality between functions. Two functions are orthogonal if
$$\langle f,g\rangle = 0$$

Using the integral definition, this means
$$\int_a^b f(x)g(x)\,dx = 0$$


$\star$ Geometrically, this means the two functions have no net alignment over the interval. Their positive and negative overlaps cancel out perfectly. This is the key idea that will allow us to treat sine and cosine waves as basis directions in function space.

## Periodic Functions

Before continuing lets make a quick addendum to our problem, by restricting the space of our "complex" function that we wish to approximate to periodic functions


## Function Basis

> **Recap**: Our goal is to find simple function(s) whose combination can be used to express more "complex" functions. We have defined function spaces analogous to vector spaces using linear algebra to provide a framework for searching the function space. Furthermore, we have defined the inner product between two functions which will be useful in determining if two functions fit the orthogonality condition needed to use the functions as basis for a function space. 


In ordinary linear algebra, a basis needs two properties:

$$
\text{basis} = \text{independent} + \text{spanning}.
$$

The basis vectors must point in independent directions, but they must also be able to build every vector in the space. The same idea holds for functions. A collection of functions

$$
\phi_1(x),\phi_2(x),\phi_3(x),\dots
$$

can act as a basis for a function space if functions in that space can be written, or at least approximated arbitrarily well, as linear combinations of the basis functions:

$$
f(x)
=
c_1\phi_1(x)
+
c_2\phi_2(x)
+
c_3\phi_3(x)
+
\cdots.
$$

Because function spaces are usually infinite-dimensional, we often need infinitely many basis functions. So instead of asking for a finite linear combination, we usually ask whether the infinite series converges back to the original function in some meaningful sense.

If our function space has an inner product, then the nicest kind of basis is an **orthonormal basis**. A family of functions $\{\phi_n\}$ is orthonormal if

$$
\langle \phi_m,\phi_n\rangle
=
\delta_{mn},
$$

where

$$
\delta_{mn}
=
\begin{cases}
1, & m=n, \\
0, & m\neq n.
\end{cases}
$$

The condition $\langle \phi_m,\phi_n\rangle=0$ for $m\neq n$ means the functions point in independent directions. The condition $\langle \phi_n,\phi_n\rangle=1$ means each basis function has unit length.

But again, orthonormality is only half the story. To be a basis, the family must also be **complete**. Completeness means there are no missing directions in the function space. In other words, every function in the space can be recovered, or approximated arbitrarily well, using these basis functions.

So the search for a Fourier basis has two parts:

1. Find simple functions that are orthogonal.
2. Show that there are enough of them to reconstruct the class of functions we care about.

Since Fourier series are designed for periodic functions, it makes sense to look for simple periodic basis functions. The simplest periodic waves are

$$
\cos(kx)
$$

and

$$
\sin(kx),
$$

where $k$ controls the frequency of oscillation.

These functions are natural candidates because they are simple, smooth, periodic, and orthogonal on intervals like $[-\pi,\pi]$. For example,

$$
\int_{-\pi}^{\pi} \sin(mx)\sin(nx)\,dx = 0
\quad \text{when } m\neq n,
$$

$$
\int_{-\pi}^{\pi} \cos(mx)\cos(nx)\,dx = 0
\quad \text{when } m\neq n,
$$

and

$$
\int_{-\pi}^{\pi} \sin(mx)\cos(nx)\,dx = 0.
$$

This means sine and cosine waves behave like perpendicular directions in function space. A low-frequency wave points in a different direction than a high-frequency wave, and sine waves point in different directions than cosine waves.

So a reasonable guess is that a periodic function can be built from a sum of these periodic waves:

$$
f(x)
=
\frac{a_0}{2}
+
\sum_{k=1}^{\infty}
a_k\cos(kx)
+
b_k\sin(kx).
$$

This is the real Fourier series.

Now we can introduce the complex exponential version. The function

$$
e^{ikx}
$$

should not be seen as a random new basis function. By Euler's formula,

$$
e^{ikx}
=
\cos(kx)+i\sin(kx).
$$

So $e^{ikx}$ is just a compact way to package a cosine wave and a sine wave of the same frequency into one complex-valued wave. Instead of separately tracking sine and cosine coefficients, we can write the Fourier series more compactly as

$$
f(x)
=
\sum_{k=-\infty}^{\infty}
c_k e^{ikx}.
$$

In this form, the basis functions are

$$
\phi_k(x)=e^{ikx},
\qquad k\in\mathbb{Z}.
$$

On $[-\pi,\pi]$, these complex exponentials are orthogonal because

$$
\langle e^{imx},e^{ikx}\rangle
=
\int_{-\pi}^{\pi} e^{imx}\left(e^{ikx}\right)^*\,dx
=
\int_{-\pi}^{\pi} e^{i(m-k)x}\,dx.
$$

If $m\neq k$, the oscillations cancel over the interval, so

$$
\int_{-\pi}^{\pi} e^{i(m-k)x}\,dx=0.
$$

If $m=k$, then the integrand becomes $1$, so

$$
\int_{-\pi}^{\pi} 1\,dx=2\pi.
$$

Therefore,

$$
\langle e^{imx},e^{ikx}\rangle
=
2\pi \delta_{mk}.
$$

If we want the basis functions to have unit length, we normalize them:

$$
\phi_k(x)
=
\frac{1}{\sqrt{2\pi}}e^{ikx}.
$$

Then

$$
\langle \phi_m,\phi_k\rangle
=
\delta_{mk}.
$$

This gives us an orthonormal basis for periodic square-integrable functions on $[-\pi,\pi]$. In that setting, a function can be represented by its projections onto these complex exponential directions:

$$
c_k
=
\langle f,\phi_k\rangle.
$$

Equivalently, without the normalized basis, the coefficient formula is

$$
c_k
=
\frac{1}{2\pi}
\int_{-\pi}^{\pi}
f(x)e^{-ikx}\,dx.
$$
