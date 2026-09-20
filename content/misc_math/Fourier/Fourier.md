
<style>
  .formula-box {
    border: 2px solid #ffffff;
    border-radius: 8px;
    padding: 16px 20px;
    margin: 24px 0;
    background: #121212;
  }

  .formula-box-title {
    font-weight: bold;
    font-size: 1.1em;
    margin-bottom: 12px;
  }
</style>

# Fourier Series $\mathfrak{F}$

## Resources

- [Video series from Steve Brunton](https://www.youtube.com/playlist?list=PLMrJAkhIeNNT_Xh3Oy0Y4LTj0Oxo8GqsC)
- [3B1B related videos](https://www.youtube.com/watch?v=spUNpyF58BY&list=PL4VT47y1w7A1-T_VIcufa7mCM3XrSA5DD)
- [Khan Academy videos](https://www.youtube.com/watch?v=UKHBWzoOKsY&list=PLM0izz3xa1_oZmWYKshc9Y2wmfBZqxMg1)



In this article I want to explore / derive the Fourier series and transformation using geometry, linear, algebra and calculus.

Hopefully, by the end we will be able to demonstrate how complex signals can be broken down into simpler components which can be analyzed and used for many interesting applications that underlie our modern world. 

The rough outline of the article is:
- Historical background
- Problem Statement
- Function Spaces
- Periodic Functions
- Inner Product of Functions
- Function Basis
- Sines and Cosines as Basis
- Fourier series
- Euler's Formula
- Fourier Transform



# Historical Background

As a small aside I want to talk a tiny bit about the history of the math that we will be discussing, both because it is interesting and because it underlines how closely the Fourier and Laplace transform are interconnected. So let’s meet our two main characters, Joseph Fourier (1768–1830) and Pierre-Simon Laplace (1749–1827), the namesakes of the transforms we will be discussing.

Fourier’s ideas grew out of the study of heat flow, where he showed that temperature distributions could be decomposed into sine and cosine modes. Laplace’s related transform emerged from work connected to probability, differential equations, and mathematical physics, where exponential weighting made difficult equations easier to manipulate.

However, Fourier and Laplace were not isolated figures working in separate mathematical worlds. Fourier was part of the same French scientific circle as Laplace, Lagrange, and Monge, and as a younger mathematician he encountered them through the new institutions of revolutionary France, especially the École Normale and École Polytechnique. Their relationship seems to have been cordial but intellectually tense: Laplace later served on committees evaluating Fourier’s work on heat, and although he raised objections to Fourier’s use of trigonometric series, he also recognized Fourier’s priority in formulating the heat equation.

I personally met these ideas in different contexts: the Fourier transform was introduced to me in signal processing as a way to measure frequency content, while the Laplace transform showed up in differential equations as a way to convert initial-value problems into algebra. But this division is somewhat artificial. For causal signals, the Laplace transform can be thought of as a more general Fourier transform. It replaces the purely oscillatory term $e^{-i\omega t}$ with $e^{-st}$ where $s = \sigma + i\omega$. The extra $\sigma$ term lets us add exponential damping, making the transform converge in cases where the Fourier transform may fail. If we then restrict back to the imaginary axis, $s = i\omega,$ we recover the Fourier viewpoint.


# Problem Statement

* (This part is a little pure mathy but I think its useful to work down from higher levels of abstraction to really derive Fourier transforms from the ground up and to also use linear algebra to gain insight into the Fourier series.)

The overall broad question that we want to address is: **are there ways to decompose a function or class of functions into simpler functions**. Additionally, are there any limits on the complexity of functions we can break down into simpler "atomic" functions? How complex are the "atomic" functions? And how well can they be used to reconstruct our original function? Ok, that is all pretty vague so lets try to narrow our area of search.

Lets imagine a "complex" function as a black box with some inputs and outputs, our goal is to find several "simple" function boxes that when connected together perform the same operation as the more complex function. For example if we have a "complex" function $y=2x$ we can approximate that as an addition of two other functions $y_1 = x$ and $y_2 = x$ where $y = y_1 + y_2$. Alternatively, we can use multiplication or any other combination of operations as the connective glue used to combine our simpler functions. Ex, $y=2x$ then $y_1 = x$ and $y_2 = 2$ then $y = y_1 \times y_2$. More broadly, what we want to find are the simple mathematical objects (functions in this case) that when combined have a very large possible output space so they can be used to construct a wide variety of "complex" functions.


# Function Spaces

Hmmm, all this talk of operations and spaces makes me think of **linear algebra**, where instead of functions we were working with vectors (which do have the duality of acting as functions in a sense). In linear algebra, the first structure we usually study is a vector space. A vector space is a set of objects where we are allowed to do two basic operations:

1. add two objects together
2. multiply an object by a scalar

If these two operations behave nicely, then the objects in the set can be treated like vectors, even if they do not look like the usual arrows in space. More formally, a vector space over a field $\mathbb{F}$, usually reals $\mathbb{R}$ or complex $\mathbb{C}$, is a set $V$ together with two operations:

$$ + : V \times V \to V $$ and $$\cdot : \mathbb{F} \times V \to V$$

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

So, function spaces are not an entirely new idea. They are like vector spaces where our mathematical objects are not vectors but some funky functions. This abstraction of functions as mathematical objects which we can add and scale will allow us to explore the possible output space of a combination of functions. 

# Periodic Functions

Before continuing, let’s make a quick addendum to our problem. Instead of immediately trying to approximate any possible function, let’s first restrict our search space to **periodic functions**.

A function is called periodic if it repeats itself after some fixed interval. More formally, a function $f(x)$ is periodic with period $T>0$ if
$$f(x+T)=f(x)$$
for every $x$ in its domain.

For example, sine and cosine are periodic functions because
$$\sin(x+2\pi)=\sin(x)$$
and
$$\cos(x+2\pi)=\cos(x)$$

So both $\sin(x)$ and $\cos(x)$ have period $2\pi$. More generally, $\sin(kx)$ and $\cos(kx)$ are also periodic, but their frequencies change depending on $k$.

This restriction to periodic functions may seem like a big limitation. After all, many functions we care about do not repeat and definitely not forever. However, there is a useful trick: if we only care about a function on some finite interval, we can pretend that this interval is one period of a repeating function.

For example, suppose we have a function defined only on the interval
$$[-L,L]$$

We can create a periodic version of this function by copying the same interval over and over again to the left and right. This is called a periodic extension. The original function may not have been periodic, but the repeated version is said to be periodic with period
$$T=2L$$
Visually, this means we take one finite “window” of the function and tile the real line with copies of that window.

There is also a deeper reason that focusing on periodic functions is not as restrictive as it first appears. A non-periodic function can be thought of as a periodic function whose period has become infinitely large. Imagine taking a function on a larger and larger interval:
$[-L,L]$. As $L$ grows, the repeated copies of the function get farther and farther apart. At that point, the repeated copies are infinitely far away, so from the perspective of any finite region, the function no longer appears periodic. So the plan is not to permanently restrict ourselves to periodic functions. Instead, we first understand periodic functions because they are easier to decompose into repeating waves. Then, by letting the period become infinitely large, we can extend the same idea to non-periodic functions.


# Inner Product of Functions

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

So, lets derive the inner product for the function space.
Lets say we have two regular functions $f(x)$ and $g(x)$ defined on the domain $[a,b]$ that we can sample from at a regular interval $\Delta x = \frac{b-a}{n-1}$ where $n$ is the number of samples. We can then take the sampled outputs from our two functions and store them in an n-dimensional data vector we'll call $\bar{f}$ and $\bar{g}$ respectively. We can now take the inner product between those two data vectors:
$$ \langle \bar{f}, \bar{g} \rangle  =  \bar{g}^T \bar{f} = \sum_{i=1}^{n} \bar{f_i} \bar{g_i}$$

We now have the inner product for the data vectors but this is different from the inner product of the function since we are only considering a finite number of sampled elements with the added complication that as the number of our samples increases we end up summing together more terms leading to an explosion in the size of the inner product. So what we can do is simply normalize the contribution of each sample by the sampling interval $\Delta x$:

$$\langle \bar{f}, \bar{g} \rangle \Delta x  = \sum_{i=1}^{n} \bar{f_i} \bar{g_i} \Delta x$$

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

So the **function inner product** is the limiting case of the ordinary vector dot product applied to finer and finer sampled versions of the functions. Thus for functions, the standard inner product is defined by multiplying the two functions pointwise and integrating over the domain:

$$\langle f,g\rangle=\int_a^b f(x)g(x)\,dx$$

This is the continuous analogue of the dot product. The dot product multiplies matching vector components and adds them:
$$\sum_{i=1}^{n} u_i v_i$$

The function inner product multiplies matching function values and “adds” them continuously using an integral:
$$\int_a^b f(x)g(x)\,dx.$$

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

$\star$ Geometrically, this means the two functions have no net alignment over the interval; their positive and negative overlaps cancel out perfectly.

# Function Basis

In ordinary linear algebra, a basis needs to be both **independent** and **spanning**. The basis vectors must point in independent directions, but they must also be able to build every vector in the space. The same idea holds for functions. A collection of functions
$$\phi_1(x),\phi_2(x),\phi_3(x),\dots$$
can act as a basis for a function space if functions in that space can be written, or at least approximated arbitrarily well, as linear combinations of the basis functions:

$$f(x)=c_1\phi_1(x)+c_2\phi_2(x)+c_3\phi_3(x)+\cdots$$

Because function spaces are usually infinite-dimensional, we often need infinitely many basis functions. So instead of asking for a finite linear combination, we usually ask whether the infinite series converges back to the original function in some meaningful sense.

If our function space has an inner product, then the nicest kind of basis is an **orthonormal basis**. A family of functions $\{\phi_n\}$ is orthonormal if
$$\langle \phi_m,\phi_n\rangle=\delta_{mn}$$
where
$$\delta_{mn}=\begin{cases}1, & m=n, \\0, & m\neq n\end{cases}$$

The condition $\langle \phi_m,\phi_n\rangle=0$ for $m\neq n$ means the functions point in independent directions. The condition $\langle \phi_n,\phi_n\rangle=1$ means each basis function has unit length.

But orthonormality is only half the story. To be a basis, the family must also be **complete**. Completeness means there are no missing directions in the function space. In other words, every function in the space can be recovered, or approximated arbitrarily well, using these basis functions.

So the search for a Fourier basis has two objectives:

**1. Find simple functions that are orthogonal.**

**2. Show that there are enough of them to reconstruct the class of functions we care about.**

Since we restricted our functions to periodic functions, it makes sense to look for simple periodic basis functions. The simplest periodic waves are of course: $\cos(kx)$ and $\sin(kx)$ where $k$ controls the frequency of oscillation.

# Sines and Cosines as Basis

Before moving further lets look at some properties of sines and cosines that make them attractive basis functions stemming from their properties under integration, namely that their overlaps cancel out over a full symmetric period, leading to the expressions: 

<details>
  <summary><strong>Longer calculation here! (Click to expand)</strong></summary>
Lets look at the interval $[0,2\pi]$ and assume that $m, n$ are positive integers.

First, we can show that individual sine waves integrate to zero over this interval for any non-zero integer $m$, with a little trick of dividing and multiplying the entire integral by $-m$:

$$\int_{0}^{2\pi}\sin(mx)\,dx=\frac{-1}{m}\int_{0}^{2\pi}-m\sin(mx)\,dx$$
Since
$$\frac{d}{dx}\cos(mx)=-m\sin(mx),$$
we get
$$\int_{0}^{2\pi}\sin(mx)\,dx=\frac{-1}{m}\cos(mx)\Big|_0^{2\pi}$$

$$=\frac{-1}{m}\left[\cos(2\pi m)-\cos(0)\right]$$

Since $m$ is an integer, $\cos(2\pi m)=1$ and $\cos(0)=1$.

Therefore,
$$\int_{0}^{2\pi}\sin(mx)\,dx=\frac{-1}{m}(1-1)=0.$$

Geometrically, this result says that over a full period, the positive and negative areas of the sine wave cancel out.

Similarly, cosine waves also integrate to zero for any non-zero integer $n$:

$$\int_{0}^{2\pi}\cos(nx)\,dx.$$
This time we use the fact that
$$\frac{d}{dx}\sin(nx)=n\cos(nx)$$

So we can write
$$\int_{0}^{2\pi}\cos(nx)\,dx=\frac{1}{n}\int_{0}^{2\pi}n\cos(nx)\,dx$$
Therefore, 
$$\int_{0}^{2\pi}\cos(nx)\,dx=\frac{1}{n}\sin(nx)\Big|_0^{2\pi}$$
$$=\frac{1}{n}\left[\sin(2\pi n)-\sin(0)\right]$$

Since $n$ is an integer, $\sin(2\pi n)=0$ and $\sin(0)=0.$
Thus,
$$\int_{0}^{2\pi}\cos(nx)\,dx=\frac{1}{n}(0-0)=0$$

So individual sine and cosine waves have zero average over a full period.

Now lets look at what happens when we square sine and cosine waves. Unlike the previous integrals, these will not evaluate to zero because squaring makes the functions nonnegative.

For sine squared, we use the trigonometric identity

$$\sin^2(mx)=\frac{1-\cos(2mx)}{2}$$
Therefore,
$$\int_{0}^{2\pi}\sin^2(mx)\,dx=\int_{0}^{2\pi}\frac{1-\cos(2mx)}{2}\,dx$$

Splitting this into two integrals gives

$$\int_{0}^{2\pi}\sin^2(mx)\,dx=\frac{1}{2}\int_{0}^{2\pi}1\,dx
-
\frac{1}{2}\int_{0}^{2\pi}\cos(2mx)\,dx$$
The first term is
$$\frac{1}{2}\int_{0}^{2\pi}1\,dx=\frac{1}{2}(2\pi)=\pi$$

The second term is zero because $\cos(2mx)$ is still a cosine wave with integer frequency:
$$\int_{0}^{2\pi}\cos(2mx)\,dx=0$$

Therefore,
$$\int_{0}^{2\pi}\sin^2(mx)\,dx=\pi.$$

Similarly, for cosine squared we use the identity

$$\cos^2(nx)=\frac{1+\cos(2nx)}{2}$$
Then
$$\int_{0}^{2\pi}\cos^2(nx)\,dx=\int_{0}^{2\pi}\frac{1+\cos(2nx)}{2}\,dx$$

Splitting this apart,

$$\int_{0}^{2\pi}\cos^2(nx)\,dx=\frac{1}{2}\int_{0}^{2\pi}1\,dx
+
\frac{1}{2}\int_{0}^{2\pi}\cos(2nx)\,dx$$

Again, the first term is
$$\frac{1}{2}\int_{0}^{2\pi}1\,dx=\pi,$$
and the second term is zero:
$$\frac{1}{2}\int_{0}^{2\pi}\cos(2nx)\,dx=0$$
So
$$\int_{0}^{2\pi}\cos^2(nx)\,dx=\pi$$

Thus, over the interval $[0,2\pi]$, we have:
</details>


$$\int_{0}^{2\pi}\sin(mx)\,dx=0, \int_{0}^{2\pi}\cos(nx)\,dx=0$$
and
$$\int_{0}^{2\pi}\sin^2(mx)\,dx=\pi, \int_{0}^{2\pi}\cos^2(nx)\,dx=\pi$$

Geometrically, the first two equations say that sine and cosine waves have zero average over a full period. The last two equations say that when a sine or cosine wave is multiplied by itself, the entire expression becomes positive so the area under the curve is also positive and average out to $\frac{1}{2}$, this is why over a full period of $2\pi$ their integral comes out to $\pi$.

Now we can look at what happens when we multiply different sine and cosine waves together. This is the key step for understanding orthogonality, because the inner product of two functions is defined by multiplying them pointwise and integrating.

$$\langle f,g\rangle=\int_a^b f(x)g(x)\,dx$$

First, consider two sine waves with frequencies $m$ and $n$:
$$\int_0^{2\pi}\sin(mx)\sin(nx)\,dx$$
To evaluate this, we use the product-to-sum identity

$$\sin(mx)\sin(nx)=\frac{1}{2}\left[\cos((m-n)x)-\cos((m+n)x)\right].$$

So

$$\int_0^{2\pi}\sin(mx)\sin(nx)\,dx=\frac{1}{2}\int_0^{2\pi}\left[\cos((m-n)x)-\cos((m+n)x)\right]dx$$

Splitting the integral gives

$$\int_0^{2\pi}\sin(mx)\sin(nx)\,dx=
\frac{1}{2}\int_0^{2\pi}\cos((m-n)x)\,dx
-
\frac{1}{2}\int_0^{2\pi}\cos((m+n)x)\,dx$$

If $m\neq n$, then both $m-n$ and $m+n$ are nonzero integers, so both cosine terms integrate to zero over $[0,2\pi]$. Therefore,

$$\int_0^{2\pi}\sin(mx)\sin(nx)\,dx=0\quad \text{when } m\neq n.$$

If $m=n$, then the first cosine term becomes

$$\cos((m-n)x)=\cos(0)=1.$$

So

$$\int_0^{2\pi}\sin^2(mx)\,dx=
\frac{1}{2}\int_0^{2\pi}1\,dx-\frac{1}{2}\int_0^{2\pi}\cos(2mx)\,dx.$$

The first term is $\pi$, and the second term is zero, so
$$\int_0^{2\pi}\sin^2(mx)\,dx=\pi$$
Thus,
$$\int_0^{2\pi}\sin(mx)\sin(nx)\,dx=\begin{cases}0, & m\neq n, \\\pi, & m=n.\end{cases}$$
The exact same pattern happens for two cosine waves. Start with
$$\int_0^{2\pi}\cos(mx)\cos(nx)\,dx$$
Using the identity
$$\cos(mx)\cos(nx)=\frac{1}{2}\left[\cos((m-n)x)+\cos((m+n)x)\right].$$
we get
$$\int_0^{2\pi}\cos(mx)\cos(nx)\,dx=\frac{1}{2}\int_0^{2\pi}\cos((m-n)x)\,dx+\frac{1}{2}\int_0^{2\pi}\cos((m+n)x)\,dx$$

If $m\neq n$, both terms integrate to zero, so

$$\int_0^{2\pi}\cos(mx)\cos(nx)\,dx=0\quad \text{when } m\neq n$$

If $m=n$, then again $\cos((m-n)x)=1$, so

$$\int_0^{2\pi}\cos^2(mx)\,dx=\frac{1}{2}\int_0^{2\pi}1\,dx+\frac{1}{2}
\int_0^{2\pi}\cos(2mx)\,dx$$

The first term is $\pi$, and the second term is zero. Therefore,

$$\int_0^{2\pi}\cos^2(mx)\,dx=\pi.$$

Thus,

$$\int_0^{2\pi}\cos(mx)\cos(nx)\,dx=\begin{cases}0, & m\neq n, \\\pi, &m=n\end{cases}$$

Finally, consider a sine wave multiplied by a cosine wave:
$$\int_0^{2\pi}\sin(mx)\cos(nx)\,dx$$
Using the product-to-sum identity
$$\sin(mx)\cos(nx)=\frac{1}{2}\left[\sin((m+n)x)+\sin((m-n)x)\right].$$
we get
$$\int_0^{2\pi}\sin(mx)\cos(nx)\,dx=\frac{1}{2}\int_0^{2\pi}\sin((m+n)x)\,dx+
\frac{1}{2}\int_0^{2\pi}\sin((m-n)x)\,dx$$

The first term integrates to zero because $m+n$ is a positive integer. If $m\neq n$, then $m-n$ is also a nonzero integer, so the second term also integrates to zero.

If $m=n$, then the second sine term becomes
$$\sin((m-n)x)=\sin(0)=0$$
So this term is still zero. Therefore,
$$\int_0^{2\pi}\sin(mx)\cos(nx)\,dx=0$$

for all positive integers $m,n$.

Putting these results together:

$$\star \int_0^{2\pi}\sin(mx)\sin(nx)\,dx=\begin{cases}0, & m\neq n, \\\pi, & m=n.\end{cases}$$

$$\star \int_0^{2\pi}\cos(mx)\cos(nx)\,dx=\begin{cases}0, & m\neq n, \\\pi, &m=n\end{cases}$$

and

$$\star \int_0^{2\pi}\sin(mx)\cos(nx)\,dx=0.$$

<iframe
  id="function-orthogonality-frame"
  src="./content/misc_math/Fourier/function_orthogonality.html"
  style="width: 100%; height: 820px; border: 0; border-radius: 12px; overflow: hidden; display: block;"
  scrolling="no"
  loading="lazy"
  title="Interactive visualization of sine and cosine orthogonality">
</iframe>


* (Phew! ok that was a lot of math but I think its useful to write it out because it will help us gather insight later when we will be summing up all the different sine and cosine terms) 

# From Orthogonality to a Function Basis

Now lets connect the calculus we just did back to the linear algebra language we developed earlier.

We defined the inner product between two real-valued functions on an interval as

$$\langle f,g\rangle=\int_0^{2\pi} f(x)g(x)\,dx.$$

So when we computed the integrals of sines and cosines above we were really computing inner products between different candidate basis functions.

The results we found were
$$\langle \sin(mx),\sin(nx)\rangle=\int_0^{2\pi}\sin(mx)\sin(nx)\,dx=
\begin{cases}0, & m\neq n, \\\pi, & m=n,\end{cases}$$
$$
\langle \cos(mx),\cos(nx)\rangle=\int_0^{2\pi}\cos(mx)\cos(nx)\,dx=
\begin{cases}0, & m\neq n, \\\pi, & m=n,\end{cases}$$
and
$$\langle \sin(mx),\cos(nx)\rangle=\int_0^{2\pi}\sin(mx)\cos(nx)\,dx=0$$

These equations say that different sine frequencies point in perpendicular directions, different cosine frequencies point in perpendicular directions, and every sine wave points in a perpendicular direction from every cosine wave.

So the family

$$1,\quad \cos(x),\quad \sin(x),\quad \cos(2x),\quad \sin(2x),\quad \cos(3x),\quad \sin(3x),\dots$$
is an **orthogonal family** of functions on $[0,2\pi]$.
There is one small normalization detail. The functions are orthogonal, but not orthonormal, because their lengths are not all equal to $1$. For example,
$$\|\sin(nx)\|^2=\langle \sin(nx),\sin(nx)\rangle=\pi,$$
and
$$\|\cos(nx)\|^2=\langle \cos(nx),\cos(nx)\rangle=\pi$$
Therefore, $\|\sin(nx)\|=\sqrt{\pi}$ and $\|\cos(nx)\|=\sqrt{\pi}$.

So if we wanted unit-length basis functions, we could use
$\frac{1}{\sqrt{\pi}}\sin(nx)$ and $\frac{1}{\sqrt{\pi}}\cos(nx)$
The constant function is slightly different. Since

$$\langle 1,1\rangle=\int_0^{2\pi}1^2\,dx=2\pi,$$
its norm is
$$\|1\|=\sqrt{2\pi}$$
So the normalized constant basis function would be
$$\frac{1}{\sqrt{2\pi}}$$
This means the normalized trigonometric family is
$$
\frac{1}{\sqrt{2\pi}},
\quad
\frac{1}{\sqrt{\pi}}\cos(x),
\quad
\frac{1}{\sqrt{\pi}}\sin(x),
\quad
\frac{1}{\sqrt{\pi}}\cos(2x),
\quad
\frac{1}{\sqrt{\pi}}\sin(2x),
\quad \dots
$$

This is now an **orthonormal family**.

However, orthogonality only tells us that these functions point in independent directions. To call them a basis, we also need a spanning or completeness property. In finite-dimensional linear algebra, a basis must be independent and spanning. The same idea holds here:

$$\text{function basis}=\text{orthogonal independent directions}+\text{enough directions to reconstruct the space}$$

For Fourier analysis, the important completeness statement is:
If $f$ is a square-integrable periodic function on $[0,2\pi]$, meaning
$$\int_0^{2\pi}|f(x)|^2\,dx < \infty,$$
then $f$ can be approximated arbitrarily well, in the $L^2$ or mean-square sense, by finite sums of sine and cosine functions.
What the square-integrable periodic function really means is that we want our function to have some finite "energy" so that it does not just asymptotically increase to infinity over a period. 

In the linear algebra sense completeness is satisfied when:

A function $f$ is orthogonal to every sine and cosine basis function, meaning

$$\langle f,\cos(nx)\rangle = 0$$
and
$$\langle f,\sin(nx)\rangle = 0$$
for every positive integer $n$, and also
$$\langle f,1\rangle = 0,$$
then $f$ must be the zero function in the $L^2$ sense.

That is the infinite-dimensional version of saying: if a vector has zero projection onto every basis direction, then it must be the zero vector.

This completeness result is deeper than the orthogonality calculations above. Orthogonality follows from trigonometric identities and integration. Completeness requires a real theorem from analysis. For the purpose of this article, we can treat it as the theorem that justifies the Fourier series:

$$\left\{1,\cos(x),\sin(x),\cos(2x),\sin(2x),\dots\right\}$$

forms a complete orthogonal basis for square-integrable periodic functions on $[0,2\pi]$.

So now we have both ingredients we wanted:

$$\text{orthogonality}\quad \Rightarrow \quad
\text{the coefficients can be found independently by projection},$$
and
$$\text{completeness}\quad \Rightarrow \quad
\text{the full infinite series can reconstruct the function}.$$

<!--
<iframe
  src="./content/misc_math/Fourier/sampled_vector_fourier.html"
  style="width: 100%; height: 1880px; border: 0; border-radius: 12px; overflow: hidden; display: block;"
  scrolling="no"
  loading="lazy"
  title="3D orthogonal basis of a 3-point DFT">
</iframe>
-->

# Fourier Series

> **Recap**: Our goal is to find simple function(s) whose combination can be used to express more "complex" functions. We have defined function spaces analogous to vector spaces using linear algebra to provide a framework for searching the function space. Furthermore, we have defined the inner product between two functions which was useful in determining if two functions fit the orthogonality condition needed to use the functions as basis for a function space. Finally, we identified sines as cosines as possible candidate functions as basis for periodic functions.

Bringing all the linear algebra together we can posit that a periodic function with finite energy could be approximated as:

$$f(x)=\sum_{k=1}^{\infty}a_k\cos(\omega_1 x)+b_k\sin(\omega_2 x)$$

The formulation of periodic functions as a sum of sines and cosines, above, then introduces the following question(s): By what rule / reason do we assign the wave frequencies and magnitudes?

$\star$ The answer is that the frequencies come from the **periodicity** of the function and the **completeness** requirement, while the magnitudes are determined from the **projection** onto our **orthonormal basis**.

## Frequencies in the Fourier Series

Suppose our function is periodic with period $T$. That means

$$f(x+T)=f(x)$$

If we want to build $f(x)$ out of sine and cosine waves, then the sine and cosine waves should also repeat after the same period $T$. The simplest wave that completes exactly one full cycle over an interval of length $T$ has angular frequency
$$\omega_0 = \frac{2\pi}{T}$$
This is called the **fundamental angular frequency**.
A cosine wave with this frequency satisfies
$$\cos(\omega_0(x+T))=\cos(\omega_0 x+\omega_0 T)$$
Since
$$\omega_0 T = \frac{2\pi}{T}T = 2\pi,$$
we get
$$\cos(\omega_0(x+T))=\cos(\omega_0 x+2\pi)=\cos(\omega_0 x)$$

So $\cos(\omega_0 x)$ has period $T$. The same is true for $\sin(\omega_0 x)$.

But we are not limited to waves that complete one cycle over the interval. We can also use waves that complete two cycles, three cycles, four cycles, and so on. These have frequencies

$$2\omega_0,\quad 3\omega_0,\quad 4\omega_0,\quad \dots$$
or more generally,
$$k\omega_0,\qquad k\in \mathbb{Z}$$

These are the **harmonics** of the fundamental frequency. They are special because each one completes an integer number of cycles over one period of the function.

This gives us the natural Fourier basis candidates:
$$\cos(k\omega_0 x)$$
and$$\sin(k\omega_0 x)$$

There is another important way to interpret these frequencies. The integer multiples of the fundamental frequency are not only chosen so that each wave fits neatly inside one period; they are also the directions that make the sine and cosine family complete.

The lowest frequency, $\omega_0$, captures the broadest oscillation that fits inside one period. The higher harmonics,
$$2\omega_0,\quad 3\omega_0,\quad 4\omega_0,\quad \dots$$
capture increasingly fine details. So as $k$ increases, we are adding higher-frequency basis directions that let us represent sharper bends, faster changes, and more detailed structure in the original function.

In this sense, the set of frequencies
$$\omega_k = k\omega_0$$

is doing two jobs at once. **Periodicity** tells us which frequencies are allowed, because each basis wave must repeat consistently over the period $T$. **Completeness** tells us why we need the whole infinite ladder of these frequencies, because only the full collection of harmonics gives us enough independent directions to reconstruct arbitrary square-integrable periodic functions.

So the frequencies in the Fourier series are not arbitrary. They are integer multiples of the fundamental frequency: each one fits the period, remains orthogonal to the others, and contributes another independent direction to the function space.

Therefore,
$$\omega_k = k\omega_0 = \frac{2\pi k}{T}.$$
This is why the Fourier series has the form
$$f(x)=\frac{a_0}{2}+\sum_{k=1}^{\infty}\left[a_k\cos(k\omega_0 x)+
b_k\sin(k\omega_0 x)\right].$$
The term
$$\frac{a_0}{2}$$

is the constant or average part of the function. The remaining terms describe oscillating components at higher and higher frequencies. It will be more obvious where the $\frac{a_0}{2}$ term comes from when we explore where the magnitudes come from next.

## Magnitudes in the Fourier Series

Now we can answer the second question: where do the magnitudes $a_k$ and $b_k$ come from?

### Oscillating Coefficients

Our intuition tells us that the $k$ th magnitudes should somehow weight the $k$ th frequency sines and cosines such that their contribution to the overall sum best approximates our target function. We already posited that the target function is just a sum of sines and cosines of varying frequencies so lets imagine just one component wave of our target function defined by the sum of a sine and cosine at a particular frequency:

$$f(x)_{\omega_k} \approx a_k\cos(\omega_k x)+b_k\sin(\omega_k x)$$

Since sine and cosine are orthogonal basis functions we should probably weight their contributions independently and proportionally to how much they align with the $k$ th frequency component of our target function i.e. geometrically, $a_k$ measures how much of the function points in the direction of the cosine wave $\cos(k\omega_0 x),$ while $b_k$ measures how much of the function points in the direction of the sine wave
$\sin(k\omega_0 x)$.

Since we already defined the inner product between functions, the natural way to measure this is by projection.
For an ordinary vector, the length of a vector $\mathbf{v}$ in the direction of an orthogonal basis vector $\mathbf{e}_k$ is

$$c_k=\frac{\langle \mathbf{v},\mathbf{e}_k\rangle}
{\langle \mathbf{e}_k,\mathbf{e}_k\rangle}$$

The exact same idea works for functions. If our basis function is $\phi_k(x)$, then the coefficient of $f(x)$ in the direction of $\phi_k(x)$ is

$$c_k=\frac{\langle f,\phi_k\rangle}
{\langle \phi_k,\phi_k\rangle}$$

For the cosine coefficient, the basis function is
$$\phi_k(x)=\cos(k\omega_0 x).$$

Therefore,
$$a_k=\frac{\langle f,\cos(k\omega_0 x)\rangle}
{\langle \cos(k\omega_0 x),\cos(k\omega_0 x)\rangle}$$

Using the integral inner product, this becomes

$$
a_k=
\frac{\int_{x_0}^{x_0+T} f(x)\cos(k\omega_0 x)\,dx}
{\int_{x_0}^{x_0+T} \cos^2(k\omega_0 x)\,dx}
$$

For $k\geq 1$, the denominator is

$$\int_{x_0}^{x_0+T} \cos^2(k\omega_0 x)\,dx=\frac{T}{2}$$


<details>
  <summary><strong>Longer calculation here! (Click to expand)</strong></summary>
  
For $k\geq 1$, the denominator is

$$\int_{x_0}^{x_0+T} \cos^2(k\omega_0 x)\,dx.$$
To evaluate this, we use the trigonometric identity
$$\cos^2(\theta)=\frac{1+\cos(2\theta)}{2}$$
so we get
$$\cos^2(k\omega_0 x)=\frac{1+\cos(2k\omega_0 x)}{2}$$

Therefore,

$$
\int_{x_0}^{x_0+T} \cos^2(k\omega_0 x)\,dx=
\int_{x_0}^{x_0+T}\frac{1+\cos(2k\omega_0 x)}{2}\,dx=
\frac{1}{2}\int_{x_0}^{x_0+T} 1\,dx+
\frac{1}{2}\int_{x_0}^{x_0+T} \cos(2k\omega_0 x)\,dx.
$$

The first term is simple:
$$\frac{1}{2}
\int_{x_0}^{x_0+T} 1\,dx=
\frac{1}{2}
\left[x\right]_{x_0}^{x_0+T}=
\frac{1}{2}
\left((x_0+T)-x_0\right)=
\frac{T}{2}$$

For the second term, we integrate the cosine:

$$\frac{1}{2}
\int_{x_0}^{x_0+T} \cos(2k\omega_0 x)\,dx =
\frac{1}{2}\left[\frac{\sin(2k\omega_0 x)}{2k\omega_0}\right]_{x_0}^{x_0+T}=
\frac{1}{4k\omega_0}\left[\sin(2k\omega_0(x_0+T))-\sin(2k\omega_0 x_0)\right]
$$

Now remember that $\omega_0 = \frac{2\pi}{T}$ therefore, $2k\omega_0 T=2k\frac{2\pi}{T}T=4\pi k$

So the first sine term becomes
$$\sin(2k\omega_0(x_0+T))=\sin(2k\omega_0 x_0 + 4\pi k)$$

Since $4\pi k$ is an integer multiple of $2\pi$, the sine function just repeats:
$$\sin(2k\omega_0 x_0 + 4\pi k)=\sin(2k\omega_0 x_0).$$
Therefore,
$$\sin(2k\omega_0(x_0+T))-\sin(2k\omega_0 x_0)=0$$
So the oscillating part contributes nothing over one full period:

$$\frac{1}{2}\int_{x_0}^{x_0+T} \cos(2k\omega_0 x)\,dx=0$$

Thus we are left with
$$\int_{x_0}^{x_0+T} \cos^2(k\omega_0 x)\,dx=\frac{T}{2}$$

So for $k\geq 1$,
$$\langle \cos(k\omega_0 x),\cos(k\omega_0 x)\rangle=\frac{T}{2}$$

Geometrically, this says that over one full period, the average value of $\cos^2(k\omega_0 x)$ is $\frac{1}{2}$. Since the interval has length $T$, the total area under $\cos^2(k\omega_0 x)$ over that interval is just half of $T$.

(Hopefully the explicit calculations above make intuitive sense since they correspond to what we found in the Sines and Cosines section)
</details>

So
$$a_k=\frac{2}{T}\int_{x_0}^{x_0+T}f(x)\cos(k\omega_0 x)\,dx$$
Similarly, the sine coefficient is
$$b_k=\frac{2}{T}\int_{x_0}^{x_0+T}f(x)\sin(k\omega_0 x)\,dx$$



### Constant coefficient

The constant coefficient comes from projecting onto the $k = 0$ basis function which is simply $f_{\omega_0}(x) = cos(0) = 1$.

Following our projection rule, the denominator is the inner product of this constant basis function with itself:
$$\langle 1, 1 \rangle = \int_{x_0}^{x_0+T} 1dx = T$$

$$a_0=\frac{\langle f, 1 \rangle}{\langle 1, 1 \rangle} = \frac{1}{T}\int_{x_0}^{x_0+T}f(x)\,dx$$

Notice that this is $T$ not $T/2$ like we got fo the oscillating sine/cosine terms, the constant coefficient represents the integral (total area under the curve) for one period of our function and then dividing that area by $T$ giving us the average height of the function. 

However, to keep the calculus formulas consistent for all $k$, mathematicians usually define $a_0$ using the exact same formula we derived for the other $a_k$ terms thus:

$$a_0=\frac{2}{T}\int_{x_0}^{x_0+T}f(x)\cos(k\omega_0 x)\,dx$$

Because this formula calculates twice the true average of the function, the "2" is treated as an artifact of normalization. This is exactly why you will almost always see the final Fourier series equation written with the constant term divided by two:

<div class="formula-box">

<div class="formula-box-title">Fourier Series</div>

$$
f(x)=\frac{a_0}{2}+\sum_{k=1}^{\infty}\left[a_k\cos(k\omega_0 x)+b_k\sin(k\omega_0 x)\right]
$$
where
$$\omega_0=\frac{2\pi}{T}$$
$$a_k=\frac{2}{T}\int_{x_0}^{x_0+T}f(x)\cos(k\omega_0 x)\,dx$$
and
$$b_k=\frac{2}{T}\int_{x_0}^{x_0+T}f(x)\sin(k\omega_0 x)\,dx.$$

</div>

So the frequencies are chosen because they fit the period of the function while satisfying completeness, and the magnitudes are chosen because they are the projection coordinates of the function onto each sine and cosine direction.

In the special case where the period is $T=2\pi$ we get $\omega_0=\frac{2\pi}{2\pi}=1$
So the Fourier series simplifies to
$$f(x)=\frac{a_0}{2}+\sum_{k=1}^{\infty}\left[a_k\cos(kx)+b_k\sin(kx)\right]$$

This is why we often see the basis functions written as
$\cos(kx)$ and $\sin(kx)$.

### Canceling Terms

A very noteworthy behavior of the approximation from the Fourier series is that when we take the inner product of our function with cosine or sine of a particular frequency the coefficients $a_k$ and $b_k$ in the series for that particular $k$ th (>0) frequency will become just a single sin/cos pair in the sum. In other words the alignment of our function with different frequency sines and cosines will simply be represented by a single period weighted coefficient in the series. 

To see this explicitly, start with the Fourier series

$$f(x)=\frac{a_0}{2}+\sum_{j=1}^{\infty}\left[a_j\cos(j\omega_0 x)+b_j\sin(j\omega_0 x)\right]$$

Here I am using $j$ as the summation index, so that we can reserve $k$ for the specific frequency we want to measure.

Now suppose we want to measure how much of the frequency-$k$ cosine wave is present in $f(x)$. We do that by taking the inner product of $f(x)$ with $\cos(k\omega_0 x)$:

$$\langle f,\cos(k\omega_0 x)\rangle=\int_{x_0}^{x_0+T}f(x)\cos(k\omega_0 x)\,dx$$

Substituting the Fourier series for $f(x)$ gives

$$\langle f,\cos(k\omega_0 x)\rangle=$$
$$
\int_{x_0}^{x_0+T}
\left[
\frac{a_0}{2}
+
a_1\cos(\omega_0 x)+b_1\sin(\omega_0 x)
+
a_2\cos(2\omega_0 x)+b_2\sin(2\omega_0 x)
+
\cdots
+
a_k\cos(k\omega_0 x)+b_k\sin(k\omega_0 x)
+
\cdots
\right]
$$
$$\cos(k\omega_0 x)\,dx.$$

Now distribute $\cos(k\omega_0 x)$ across every term in the Fourier series. This gives one integral for every basis component:

<table class="vector-function-table">
  <thead>
    <tr>
      <th>Fourier term in $f(x)$</th>
      <th>After multiplying by $\cos(k\omega_0 x)$</th>
      <th>Integral over one period</th>
      <th>Result</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Constant term $\frac{a_0}{2}$</td>
      <td>$\frac{a_0}{2}\cos(k\omega_0 x)$</td>
      <td>$\frac{a_0}{2}\int_{x_0}^{x_0+T}\cos(k\omega_0 x)\,dx$</td>
      <td>$0$</td>
    </tr>
    <tr>
      <td>Cosine term $a_1\cos(\omega_0 x)$</td>
      <td>$a_1\cos(\omega_0 x)\cos(k\omega_0 x)$</td>
      <td>$a_1\int_{x_0}^{x_0+T}\cos(\omega_0 x)\cos(k\omega_0 x)\,dx$</td>
      <td>$0$ if $k\neq 1$</td>
    </tr>
    <tr>
      <td>Sine term $b_1\sin(\omega_0 x)$</td>
      <td>$b_1\sin(\omega_0 x)\cos(k\omega_0 x)$</td>
      <td>$b_1\int_{x_0}^{x_0+T}\sin(\omega_0 x)\cos(k\omega_0 x)\,dx$</td>
      <td>$0$</td>
    </tr>
    <tr>
      <td>Cosine term $a_2\cos(2\omega_0 x)$</td>
      <td>$a_2\cos(2\omega_0 x)\cos(k\omega_0 x)$</td>
      <td>$a_2\int_{x_0}^{x_0+T}\cos(2\omega_0 x)\cos(k\omega_0 x)\,dx$</td>
      <td>$0$ if $k\neq 2$</td>
    </tr>
    <tr>
      <td>Sine term $b_2\sin(2\omega_0 x)$</td>
      <td>$b_2\sin(2\omega_0 x)\cos(k\omega_0 x)$</td>
      <td>$b_2\int_{x_0}^{x_0+T}\sin(2\omega_0 x)\cos(k\omega_0 x)\,dx$</td>
      <td>$0$</td>
    </tr>
    <tr>
      <td>$\vdots$</td>
      <td>$\vdots$</td>
      <td>$\vdots$</td>
      <td>$\vdots$</td>
    </tr>
    <tr>
      <td>Matching cosine term $a_k\cos(k\omega_0 x)$</td>
      <td>$a_k\cos(k\omega_0 x)\cos(k\omega_0 x)$</td>
      <td>$a_k\int_{x_0}^{x_0+T}\cos^2(k\omega_0 x)\,dx$</td>
      <td>$a_k\frac{T}{2}$</td>
    </tr>
    <tr>
      <td>Matching sine term $b_k\sin(k\omega_0 x)$</td>
      <td>$b_k\sin(k\omega_0 x)\cos(k\omega_0 x)$</td>
      <td>$b_k\int_{x_0}^{x_0+T}\sin(k\omega_0 x)\cos(k\omega_0 x)\,dx$</td>
      <td>$0$</td>
    </tr>
    <tr>
      <td>$\vdots$</td>
      <td>$\vdots$</td>
      <td>$\vdots$</td>
      <td>$\vdots$</td>
    </tr>
  </tbody>
</table>

So visually, almost every term disappears. The constant term has zero overlap with $\cos(k\omega_0 x)$, every sine term has zero overlap with $\cos(k\omega_0 x)$, and every cosine term with the wrong frequency has zero overlap with $\cos(k\omega_0 x)$.

The only surviving term is the cosine term with the matching frequency:
$$a_k\cos(k\omega_0 x)$$
Therefore,
$$\langle f,\cos(k\omega_0 x)\rangle=a_k\int_{x_0}^{x_0+T}\cos^2(k\omega_0 x)\,dx=a_k\frac{T}{2}$$

Solving for $a_k$ gives

$$a_k=\frac{2}{T}\langle f,\cos(k\omega_0 x)\rangle=\frac{2}{T}\int_{x_0}^{x_0+T}f(x)\cos(k\omega_0 x)\,dx$$

This is exactly the coefficient formula we derived earlier, but now we can see what it is doing algebraically: taking the inner product with $\cos(k\omega_0 x)$ filters out every other basis direction and leaves only the $a_k$ contribution.

The same cancellation happens when we project onto $\sin(k\omega_0 x)$. This time all constant terms, all cosine terms, and all sine terms with the wrong frequency disappear. The only surviving term is

$$b_k\sin(k\omega_0 x)$$
So
$$\langle f,\sin(k\omega_0 x)\rangle=b_k\int_{x_0}^{x_0+T}\sin^2(k\omega_0 x)\,d=b_k\frac{T}{2}$$

Therefore,

$$b_k=\frac{2}{T}\langle f,\sin(k\omega_0 x)\rangle=
\frac{2}{T}\int_{x_0}^{x_0+T}f(x)\sin(k\omega_0 x)\,dx$$

So all that work we did with the linear algebra pays off, the Fourier coefficient formulas are exactly the result of projecting the function onto one basis direction at a time. Orthogonality makes all the “wrong” frequencies in the sum cancel, leaving only the matching sine or cosine coefficient.

<iframe
  src="./content/misc_math/Fourier/fourier_approximator.html"
  style="width: 100%; height: 960px; border: 0; border-radius: 12px; overflow: hidden; display: block;"
  scrolling="no"
  loading="lazy"
  title="Fourier Series Approximator">
</iframe>

### Recap

Before moving on lets briefly summarize the path we took.

The main idea was to treat functions like vectors. In ordinary linear algebra, a vector can be decomposed into a sum of basis vectors:

$$\mathbf{v}=c_1\mathbf{e}_1 +c_2\mathbf{e}_2+c_3\mathbf{e}_3+\cdots$$

Where the coefficients tell us how much of each basis direction is present in the original vector. Fourier series are the same idea, except now our “vectors” are functions and our “basis vectors” are basis functions.

To make this analogy work, we first defined a function space, where functions can be added and scaled just like ordinary vectors. Then we defined an inner product between functions:

$$\langle f,g\rangle=\int_a^b f(x)g(x)\,dx$$

This gave us a way to talk about length, projection, and orthogonality in function space.

Next, we restricted our attention to periodic functions, because if a function repeats over some period $T$, then it makes sense to try to build it out of simpler repeating waves. This led us naturally to sine and cosine functions.

We then showed that sine and cosine waves of different frequencies are orthogonal:

$$\int_0^{2\pi}\sin(mx)\sin(nx)\,dx=0\quad \text{when } m\neq n,$$

$$\int_0^{2\pi}\cos(mx)\cos(nx)\,dx=0\quad \text{when } m\neq n,$$

and

$$\int_0^{2\pi}\sin(mx)\cos(nx)\,dx=0.$$

These calculations showed that different sine and cosine waves behave like perpendicular directions in function space.

Then we invoked the deeper completeness result: the full family

$$1,\cos(x),\sin(x),\cos(2x),\sin(2x),\dots$$

contains enough independent directions to reconstruct square-integrable periodic functions in the $L^2$ sense.

Putting these ideas together, we arrived at the real Fourier series:

$$f(x)=\frac{a_0}{2}+\sum_{k=1}^{\infty}\left[a_k\cos(k\omega_0 x)+
b_k\sin(k\omega_0 x)\right].$$

Where the frequencies
$$k\omega_0$$

come from the completeness of basis and periodicity of the function, while the magnitudes $a_k$ and $b_k$ come from projection onto each basis wave.

Euler’s formulation will not change this idea. It will only give us a cleaner way to package the sine and cosine basis functions using complex exponentials.

# Euler's Formulation of the Fourier Series

Now that we have defined the real Fourier series,

$$f(x)=\frac{a_0}{2}+\sum_{k=1}^{\infty}\left[a_k\cos(kx)+b_k\sin(kx)\right],$$

we can introduce a more compact version using Euler's formula:

$$e^{ikx}=\cos(kx)+i\sin(kx).$$

[Euler's formula](article.html?slug=misc_math\Euler's%20Formula\Euler's%20Formula) also lets us rewrite sine and cosine in terms of complex exponentials:

$$\cos(kx)=\frac{e^{ikx}+e^{-ikx}}{2}, \qquad \sin(kx)=\frac{e^{ikx}-e^{-ikx}}{2i}.$$

<iframe
  src="./content/misc_math/Euler's%20Formula/euler_visualizer.html"
  style="width: 100%; height: 720px; border: 0; border-radius: 12px; overflow: hidden; display: block;"
  scrolling="no"
  loading="lazy"
  title="Euler formula visualization">
</iframe>

So instead of treating sine and cosine as separate basis functions, we can package them into complex exponentials with positive and negative frequencies.

Starting with one frequency component,

$$a_k\cos(kx)+b_k\sin(kx),$$

we substitute the exponential formulas:

$$a_k\cos(kx)+b_k\sin(kx)=a_k\left(\frac{e^{ikx}+e^{-ikx}}{2}\right)+b_k\left(\frac{e^{ikx}-e^{-ikx}}{2i}\right).$$

Now group together the $e^{ikx}$ and $e^{-ikx}$ terms:

$$a_k\cos(kx)+b_k\sin(kx)=\left(\frac{a_k}{2}+\frac{b_k}{2i}\right)e^{ikx}+\left(\frac{a_k}{2}-\frac{b_k}{2i}\right)e^{-ikx}.$$

Since $\frac{1}{i}= \frac{1}{\sqrt{-1}} = \frac{\sqrt{-1}}{\sqrt{-1}^2} = -i$, this becomes

$$a_k\cos(kx)+b_k\sin(kx)=\left(\frac{a_k-ib_k}{2}\right)e^{ikx}+\left(\frac{a_k+ib_k}{2}\right)e^{-ikx}.$$

This shows us how the real Fourier coefficients $a_k$ and $b_k$ combine into complex Fourier coefficients:

$$c_k=\frac{a_k-ib_k}{2}, \qquad c_{-k}=\frac{a_k+ib_k}{2}, \qquad k>0.$$

The constant term also gets absorbed into the complex notation. Since the real Fourier series has constant term $\frac{a_0}{2}$, we define

$$c_0=\frac{a_0}{2}.$$

So the full Fourier series:
$$f(x)=\frac{a_0}{2}+\sum_{k=1}^{\infty}\left[a_k\cos(kx)+b_k\sin(kx)\right],$$

 becomes

$$f(x)=\sum_{k=-\infty}^{\infty}c_k e^{ikx}.$$

where

$$c_k=\frac{a_k-ib_k}{2}, \qquad c_{-k}=\frac{a_k+ib_k}{2}, \qquad c_0=\frac{a_0}{2}$$

This is the complex Fourier series. The basis functions are now

$$\phi_k(x)=e^{ikx}$$

with associated weights $$c_k \qquad k\in\mathbb{Z}$$

The negative values of $k$ are not a mistake. They are what allow the complex exponential form to represent both sine and cosine information. Positive and negative complex exponentials work together to encode the real oscillations we previously described using separate sine and cosine terms.

For completeness sake lets check that these complex exponential basis functions are also orthogonal. Using the complex inner product,

$$\langle f,g\rangle=\int_{-\pi}^{\pi}f(x)g^*(x)\,dx,$$

we get

$$\langle e^{imx},e^{ikx}\rangle=\int_{-\pi}^{\pi}e^{imx}\left(e^{ikx}\right)^*\,dx.$$

Since $\left(e^{ikx}\right)^*=e^{-ikx}$, this becomes

$$\langle e^{imx},e^{ikx}\rangle=\int_{-\pi}^{\pi}e^{imx}e^{-ikx}\,dx=\int_{-\pi}^{\pi}e^{i(m-k)x}\,dx.$$

If $m\neq k$, then $m-k$ is a nonzero integer. The complex exponential completes an integer number of oscillations over $[-\pi,\pi]$, so the positive and negative contributions cancel:

$$
\int_{-\pi}^{\pi}e^{i(m-k)x}\,dx=
\left[\frac{e^{i(m-k)x}}{i(m-k)}\right]_{-\pi}^{\pi}=
\frac{2i\sin((m-k)\pi)}{i(m-k)}=0,\qquad m\neq k.
$$

If $m=k$, then $e^{i(m-k)x}=e^0=1$, so

$$\int_{-\pi}^{\pi}e^{i(m-k)x}\,dx=\int_{-\pi}^{\pi}1\,dx=2\pi.$$

Therefore,

$$\langle e^{imx},e^{ikx}\rangle=2\pi\delta_{mk},$$

where

$$\delta_{mk}=\begin{cases}1, & m=k, \\ 0, & m\neq k.\end{cases}$$

So the complex exponentials are orthogonal, but not normalized. Their squared length is

$$\langle e^{ikx},e^{ikx}\rangle=2\pi.$$

If we want unit-length basis functions, we normalize them by defining

$$\phi_k(x)=\frac{1}{\sqrt{2\pi}}e^{ikx}.$$

Then

$$\langle \phi_m,\phi_k\rangle=\delta_{mk}.$$

Now we can compute the complex coefficient $c_k$ using the same projection idea as before. If

$$f(x)=\sum_{j=-\infty}^{\infty}c_j e^{ijx},$$

then taking the inner product with $e^{ikx}$ gives

$$\langle f,e^{ikx}\rangle=\left\langle\sum_{j=-\infty}^{\infty}c_j e^{ijx},e^{ikx}\right\rangle.$$

Using linearity,

$$\langle f,e^{ikx}\rangle=\sum_{j=-\infty}^{\infty}c_j\langle e^{ijx},e^{ikx}\rangle.$$

But orthogonality tells us that

$$\langle e^{ijx},e^{ikx}\rangle=2\pi\delta_{jk}.$$

So every term disappears except the one where $j=k$:

$$\langle f,e^{ikx}\rangle=2\pi c_k.$$

Therefore,

$$c_k=\frac{1}{2\pi}\langle f,e^{ikx}\rangle.$$

Using the integral form of the inner product,

$$\langle f,e^{ikx}\rangle=\int_{-\pi}^{\pi}f(x)\left(e^{ikx}\right)^*\,dx=\int_{-\pi}^{\pi}f(x)e^{-ikx}\,dx.$$

So the complex Fourier coefficient is

$$c_k=\frac{1}{2\pi}\int_{-\pi}^{\pi}f(x)e^{-ikx}\,dx.$$

<div class="formula-box">

<div class="formula-box-title">Complex Fourier Series</div>

$$f(x)=\sum_{k=-\infty}^{\infty}c_k e^{ikx}.$$
where
$$c_k=\frac{1}{2\pi}\int_{-\pi}^{\pi}f(x)e^{-ikx}\,dx.$$

</div>

This is the complex version of the Fourier projection formula. It does the same job as the real coefficients $a_k$ and $b_k$, but it packages the sine and cosine information into one complex coefficient $c_k$ for each integer frequency $k$.

The important point is that this is still the same linear algebra story as before. In a vector space, a coefficient measures how much a vector points in the direction of a basis vector. Here, the “vector” is the function $f(x)$, the basis direction is $e^{ikx}$, and the coefficient is found by projection:

$$c_k=\frac{\langle f,e^{ikx}\rangle}{\langle e^{ikx},e^{ikx}\rangle}$$
Since
$$\langle e^{ikx},e^{ikx}\rangle=2\pi,$$
we get
$$c_k=\frac{1}{2\pi}\langle f,e^{ikx}\rangle$$
Now use the complex inner product:

$$
\langle f,e^{ikx}\rangle=
\int_{-\pi}^{\pi}f(x)\left(e^{ikx}\right)^*\,dx=
\int_{-\pi}^{\pi}f(x)e^{-ikx}\,dx
$$

Therefore,
$$c_k=\frac{1}{2\pi}\int_{-\pi}^{\pi}f(x)e^{-ikx}\,dx$$

We can also look at it from a geometric perspective where the term
$$e^{-ikx}$$
is a rotating unit vector in the complex plane. So the integrand
$$f(x)e^{-ikx}$$

can be viewed as the function $f(x)$ being wound around the origin at a rate determined by $k$. The magnitude of $k$ determines the speed at which we "wind" our function around the average value (DC offset). If $f(x)$ is positive, it stretches the rotating vector outward; if $f(x)$ is negative, it flips the point to the opposite side. So $f(x)$ acts like a signed radial scale factor.

Thus, the same expression has two interpretations:

$$c_k=\frac{1}{2\pi}\langle f,e^{ikx}\rangle$$
is the **linear algebra interpretation**: $c_k$ is the projection of $f$ onto the basis direction $e^{ikx}$.
And
$$c_k=\frac{1}{2\pi}\int_{-\pi}^{\pi}f(x)e^{-ikx}\,dx$$
is the **geometric winding interpretation**: $c_k$ is the average center of mass, of the wound curve

$$z_k(x)=f(x)e^{-ikx}$$

**The winding picture is just the complex-plane visualization of the inner product projection.**

(This is late place to bring this to the readers attention but all our previous derivations have been for functions in the domain $[-\pi, \pi]$, we will see how this can be generalized for all lengths of time shortly)

If the winding frequency $k$ does not match a frequency strongly present in $f(x)$, the wound curve tends to balance around the origin and the average the average position is zero. But if $k$ matches a frequency inside $f(x)$, the wound curve becomes lopsided, and its average position moves away from the origin. That displacement is the complex coefficient $c_k$. The magnitude $|c_k|$ tells us how strongly frequency $k$ is present, while the angle $\arg(c_k)$ stores the phase of that frequency component.

So changing $k$ is like tuning a frequency detector. In the linear algebra view, we are projecting onto different basis directions. In the winding view, we are winding the signal at different speeds and watching when the center of mass moves away from the origin.

<iframe
  src="./content/misc_math/Fourier/fourier_winding.html"
  style="width: 100%; height: 735px; border: 0; border-radius: 12px; overflow: hidden; display: block;"
  scrolling="no"
  loading="lazy"
  title="Fourier coefficient winding visualization">
</iframe>

Now that we have defined the complex Fourier series and its coefficients, we can visualize the series as a chain of rotating vectors in the complex plane. Each term

$$c_k e^{ikx}$$

contributes one rotating vector: the magnitude $|c_k|$ sets the vector’s length, the integer $k$ sets its angular speed and direction, and the phase $\arg(c_k)$ sets its initial angle. Adding these vectors tip-to-tail gives the partial sum of the Fourier series, and as $x$ changes, the endpoint of the chain traces the reconstructed function.

<iframe
  src="./content/misc_math/Fourier/epicycle_visualization.html"
  style="width: 100%; height: 860px; border: 0; border-radius: 12px; overflow: hidden; display: block;"
  scrolling="no"
  loading="lazy"
  title="Epicycle Visualization">
</iframe>

Notice that for every increase in $k$ we add two circles which represent the addition of two complex terms $e^{+-ikx}$ because of the (+- k) terms in the sum. Each these complex terms encapsulates its corresponding sin and cosine terms. The cosine term is responsible for tracing out the real component of the  circular path of the first "rod" in the arm (shoulder to elbow) and the sin part is responsible for the imaginary component of that circle. The other complex term is responsible for the other part of the arm (elbow to hand) which will always have a corresponding circular path of the same radius and speed but in the reverse direction.

# Fourier Transform

Up to this point, we have been working with the complex Fourier series. For a $2\pi$-periodic function, we wrote

$$f(x)=\sum_{k=-\infty}^{\infty}c_k e^{ikx},\qquad c_k=\frac{1}{2\pi}\int_{-\pi}^{\pi}f(x)e^{-ikx}\,dx.$$

More generally, if the function has period $T$, then the fundamental angular frequency is

$$\omega_0=\frac{2\pi}{T},\qquad \omega_k=k\omega_0=\frac{2\pi k}{T},$$

so the Fourier series becomes

$$f(x)=\sum_{k=-\infty}^{\infty}c_k e^{i\omega_k x},\qquad c_k=\frac{1}{T}\int_{-T/2}^{T/2}f(x)e^{-i\omega_k x}\,dx.$$

This is still the same projection idea as before. Each coefficient $c_k$ measures how much the function aligns with one allowed frequency $\omega_k$. The important word here is **allowed**. Because the function is periodic with period $T$, only frequencies that fit evenly into that period are allowed. That is why the Fourier series uses discrete frequencies:

$$\dots,-2\omega_0,-\omega_0,0,\omega_0,2\omega_0,\dots$$

Now suppose we want to study a function that is not naturally periodic. One way to connect it back to Fourier series is to imagine placing the function inside a very large interval of length $T$, periodically repeating that interval, and then letting the period grow without bound:

$$T\to\infty.$$

As the period grows, the fundamental frequency shrinks:

$$\omega_0=\frac{2\pi}{T}\to 0.$$

So the spacing between neighboring frequency samples also shrinks:

$$\Delta\omega=\omega_0=\frac{2\pi}{T}.$$

So in the Fourier series, the frequency domain is a discrete set of points indexed by integers $k$. But as $T\to\infty$, the frequency spacing $\Delta\omega$ goes to zero, and those discrete frequency samples become a continuous frequency axis. The Fourier transform is the operation that takes our original function $f(x)$ and produces a new function $\widehat f(\omega)$, whose input is frequency and whose value tells us how strongly that frequency appears in $f$.

So the domain changes in an important way:

$$\text{Fourier series: } k\in\mathbb{Z},\qquad \omega_k=k\omega_0.$$

$$\text{Fourier transform: } \omega\in\mathbb{R}.$$

In other words, the Fourier series maps a periodic function to a sequence of coefficients,

$$f(x)\quad\longrightarrow\quad \{c_k\}_{k\in\mathbb{Z}},$$

while the Fourier transform maps a non-periodic function to a new function of frequency,

$$f(x)\quad\longrightarrow\quad \widehat f(\omega).$$

**The output of the Fourier transform is not a list of coefficients anymore it is a continuous frequency-domain function.**

To see this algebraically, start with the period-$T$ coefficient formula:

$$c_k=\frac{1}{T}\int_{-T/2}^{T/2}f(x)e^{-i\omega_k x}\,dx.$$

Define the frequency-domain quantity

$$\widehat f_T(\omega_k)=\int_{-T/2}^{T/2}f(x)e^{-i\omega_k x}\,dx.$$

Then

$$c_k=\frac{1}{T}\widehat f_T(\omega_k).$$

But since

$$\Delta\omega=\frac{2\pi}{T},\qquad \frac{1}{T}=\frac{\Delta\omega}{2\pi},$$

we can rewrite the coefficient as

$$c_k=\frac{\Delta\omega}{2\pi}\widehat f_T(\omega_k).$$

Substitute this back into the Fourier series:

$$f(x)=\sum_{k=-\infty}^{\infty}\frac{\Delta\omega}{2\pi}\widehat f_T(\omega_k)e^{i\omega_k x}.$$

Rearranging,

$$f(x)=\frac{1}{2\pi}\sum_{k=-\infty}^{\infty}\widehat f_T(\omega_k)e^{i\omega_k x}\Delta\omega.$$

This is a Riemann sum over frequency. As $T\to\infty$, the frequency spacing $\Delta\omega\to 0$, the discrete samples $\omega_k$ become a continuous variable $\omega$, and the sum becomes an integral:

$$f(x)=\frac{1}{2\pi}\int_{-\infty}^{\infty}\widehat f(\omega)e^{i\omega x}\,d\omega.$$

This is the **inverse Fourier transform**. It reconstructs the original function by continuously adding complex waves of every possible frequency.

The corresponding **forward Fourier transform** is

$$\widehat f(\omega)=\int_{-\infty}^{\infty}f(u)e^{-i\omega u}\,du.$$

I am using $u$ inside the integral here just to emphasize that it is a dummy variable. The transform takes in a function of position/time and returns a function of angular frequency:

$$
f(x)\quad\xrightarrow{\mathfrak{F}}\quad \widehat f(\omega)
$$

The inverse transform goes the other direction:

$$
\widehat f(\omega)\quad\xrightarrow{\mathfrak{F}^{-1}}\quad f(x)
$$

So the Fourier transform pair is

$$\boxed{\widehat f(\omega)=\int_{-\infty}^{\infty}f(u)e^{-i\omega u}\,du}$$

$$\boxed{f(x)=\frac{1}{2\pi}\int_{-\infty}^{\infty}\widehat f(\omega)e^{i\omega x}\,d\omega}$$

The first formula is the **analysis equation**. It breaks down our function into continuous frequency components. In the Fourier series, this frequency information was stored in the discrete coefficients $c_k$, where $k\in\mathbb{Z}$. In the Fourier transform, those discrete coefficients are replaced by a continuous frequency-domain function $\widehat f(\omega)$, where $\omega\in\mathbb{R}$.

The connection is

$$c_k=\frac{\Delta\omega}{2\pi}\widehat f(\omega_k),$$

so $\widehat f(\omega)$ can be thought of as the continuous, rescaled version of the Fourier series coefficients as the period grows to infinity.

The second formula is the **synthesis equation**. It rebuild $f$ by adding all of those frequency contributions back together.

If we substitute the forward transform directly into the inverse transform, we get

$$f(x)=\frac{1}{2\pi}\int_{-\infty}^{\infty}\left[\int_{-\infty}^{\infty}f(u)e^{-i\omega u}\,du\right]e^{i\omega x}\,d\omega.$$

Combining the exponentials gives

$$f(x)=\frac{1}{2\pi}\int_{-\infty}^{\infty}\int_{-\infty}^{\infty}f(u)e^{i\omega(x-u)}\,du\,d\omega.$$

This double-integral form makes the analysis/synthesis structure explicit. The inner integral measures how much of each frequency is present in the original function. The outer integral adds those frequencies back together to reconstruct the function.

So the Fourier transform is just a reformualtion of the Fourier series when the period of the Fourier series is stretched to infinity. The discrete harmonic frequencies become a continuous frequency axis, the coefficient sequence $c_k$ becomes the frequency-domain function $\widehat f(\omega)$, and the Fourier series sum becomes an integral over all frequencies.

<iframe
  src="./content/misc_math/Fourier/fourier_spectrum_widget.html"
  style="width: 100%; height: 1100px; border: 0; border-radius: 12px; overflow: hidden; display: block;"
  scrolling="no"
  loading="lazy"
  title="Fourier spectrum and reconstruction widget">
</iframe>

# Conclusion

There is a lot more we can talk about regarding the use of Fourier transforms in various domains, from simplifying complex equations to signal processing, to image processing. I will likely write more about the implementation of the Fourier transform namely the discrete and fast Fourier transform but I think this article is already a bit too long as it is, so I will leave those topics to another day.

In a nutshell, Fourier analysis is the idea that complicated functions can be understood by decomposing them into simpler wave-like building blocks. In this article, we approached that idea from the perspective of linear algebra: functions can be treated like vectors, sine and cosine waves can act like orthogonal basis directions, and Fourier coefficients are projection coordinates that measure how much of each frequency is present. From there, Euler’s formula allowed us to package sine and cosine into complex exponentials, giving both an algebraic shorthand and a geometric interpretation through winding, centers of mass, and rotating epicycles. Hopefully, this explanation helps connect the linear algebra view with the algebraic derivations and geometric visualizations of Fourier series and Fourier transforms that are commonly, but independently, shown online.
