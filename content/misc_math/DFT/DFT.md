
The goal of this article is to further explore the Fourier Transform, and understand its application after discretization into the Discrete Fourier Transform (DFT).

The main sections will be:
- [Fourier Transform](#Fourier-Transform)
    - [Functions of any period](#Functions-of-any-period)
    - [Functions of infinite period](#Functions-of-infinite-period)
    - [Analysis equation and Synthesis Equations](#Analysis-and-Synthesis-Equations)
    - [Analysis Equation Outputs](#Analysis-equation-outputs)
- [DFT](#DFT)
    - [Discretization](#Discretization)
    - [DFT output interpretation](#DFT-output-interpretation)
    - [Use cases](#Use-cases)
    - [Pseudocode](#Pseudocode)


# Fourier Transform

From the previous article on [Fourier series / transform](article.html?slug=\misc_math\Fourier\Fourier), we determined that functions / signals can be decomposed into a sum of exponential terms that really just encode rotations (see [Euler's formula](article.html?slug=\misc_math\Euler's%20Formula\Euler's%20Formula)), scaled by how much our signal "resonates" or aligns with each complex exponential in function space. This is not a very rigorous description but if it does not ring any bells then I would briefly review the previous article. But fret not the entire beginning of this article is about going from the Fourier Series to the Fourier Transform.

## Functions of any period


<div class="formula-box">

The Fourier Series states that a periodic function $f(x)$ with period $T = 2\pi$ can be reconstructed as an infinite sum of weighted exponential:

$$f(x)=\sum_{k=-\infty}^{\infty}c_k e^{ikx} \qquad {k \in \mathbb{Z}}$$

where

$$c_k=\frac{1}{2\pi}\int_{-\pi}^{\pi}f(x)e^{-ikx}dx$$

</div>


Since the functions $\sin x$, $\cos x$, and $e^{ix}$ complete one full cycle over $2\pi$ radians, we must scale their angular frequency so that the fundamental basis function completes exactly one cycle over an interval of length $T$.
$$\omega_0 T = 2\pi$$

This gives us the fundamental angular frequency
$$\boxed{\omega_0 = \frac{2\pi}{T}}$$

The higher-frequency basis functions are integer multiples of this fundamental frequency:
$$\frac{2\pi k}{T},\qquad k\in\mathbb Z$$

When $T = 2\pi$:
$$\omega_0=\frac{2\pi}{2\pi} = 1,\qquad \omega_k=k\omega_0=k$$

But in general the fundamental angular frequency for a function of period $T$ is:

$$\boxed{
\omega_0=\frac{2\pi}{T},\qquad \omega_k=k\omega_0=k\frac{2\pi}{T}
}$$

$$\boxed{
f(x)=\sum_{k=-\infty}^{\infty}c_k e^{i\omega_k x},\qquad c_k=\frac{1}{T}\int_{-T/2}^{T/2}f(x)e^{-i\omega_k x}dx 
}$$

Notice that the Fourier index $k$ is still an integer. Changing the period does not change the set of integers we sample, it changes the fundamental frequency which multiplies each $k$.

Ok, so now we can compute functions with any period $T$, but the Fourier series still assumes that the function is periodic: a finite interval of length $T$ is repeated indefinitely.

What happens when we simply make the period go to infinity?

## Functions of infinite period

First lets rewrite the Fourier series to a form where we can easily see the effect of letting $T\to\infty$.

We notice that for the kth-frequency and the (k+1)th-frequency
$$\omega_k=k\frac{2\pi}{T}, \qquad \omega_{(k+1)}=(k+1)\frac{2\pi}{T}$$

The difference: $\omega_{(k+1)} - \omega_k$ is $\Delta\omega = \frac{2\pi}{T} = \omega_0$

so we can say that the fundamental frequency is equal to the change in frequency between consecutive k samples:
$$\omega_0 = \Delta\omega = \frac{2\pi}{T}$$

Which can then be rearranged as:
$$\frac{1}{T}=\frac{\Delta\omega}{2\pi}$$

If we let $T\to\infty$:
$$\frac{1}{T} \to 0 \qquad \text{and} \qquad \frac{\Delta\omega}{2\pi} \to 0$$

Meaning that as $T$ increases, the spacing between adjacent angular-frequency samples approaches zero:

$$\Delta\omega=\frac{2\pi}{T}\to0.$$

Keep in mind that even for finite $T$, reconstructing the periodic signal requires an infinite number of Fourier-series terms, indexed by the integers $k\in\mathbb Z$. What changes as $T\to\infty$ is not the set of indices $k$, but the angular frequencies associated with them:

$$\omega_k=k\frac{2\pi}{T}.$$

As $T$ increases, these discrete frequencies become more and more densely packed. For example, if you compare two periodic functions with periods $2\pi$ and $6\pi$ you would still need infinitely many  samples ($k$) to reconstruct them, the difference is the spacing between frequency samples ($\omega_k$); for a period of $6\pi$, samples of $\omega_k$ will be 3 times closer together then for a period $2\pi$. As $T$ goes to infinity $\Delta\omega$ approaches zero, so the discrete frequency grid becomes continuous and we replace the sum over discrete frequencies with an integral over all real angular frequencies $\omega$.

The Fourier series represents a periodic function using a countably infinite set of discrete frequencies, while the Fourier transform represents a non-periodic function using a continuous, uncountable range of frequencies.


Lets derive this algebraically keeping in mind that as $T \to \infty \qquad \Delta \omega \to 0$.

Lets define:

$$\widehat f_T(\omega_k)=\int_{-T/2}^{T/2}f(u)e^{-i\omega_k u}du$$

This is simply the unscaled version of the Fourier-series coefficient $c_k$.

From a linear algebra perspective, it can also be interpreted as the inner product between $f(x)$ and the complex exponential basis function $e^{i\omega_k x}$:

$$
\widehat f_T(\omega_k)=\langle f,e^{i\omega_k x}\rangle
=\int_{-T/2}^{T/2}f(x)e^{-i\omega_k x}\,dx
$$

Notice that the negative exponent arises because the inner product of complex-valued functions takes the complex conjugate of its second argument.

since earlier we saw:

$$\frac{1}{T}=\frac{\Delta\omega}{2\pi}$$

the Fourier-series coefficient becomes

$$c_k=\frac{1}{T}\widehat f_T(\omega_k)
=\frac{\Delta\omega}{2\pi}\widehat f_T(\omega_k)$$

Substituting this into the **Fourier series** gives

$$f(x)=\frac{1}{2\pi}\sum_{k=-\infty}^{\infty}\widehat f_T(\omega_k)e^{i\omega_kx}\Delta\omega.$$

This now has the form of a Riemann sum,

$$\sum_k g(\omega_k)\Delta\omega,$$

where

$$g(\omega)=\widehat f(\omega)e^{i\omega x}.$$

As $T\to\infty$, the frequency spacing

$$\Delta\omega=\frac{2\pi}{T}\to0,$$

so when the interval $[-T/2,T/2]$ expands to the entire real line the discrete frequencies $\omega_k$ must become arbitrarily densely packed to the point that the $\Delta\omega_k\to0$.

$$\widehat f_T(\omega)\to\widehat f(\omega).$$

The Riemann sum therefore becomes an integral:

$$\frac{1}{2\pi}\sum_{k=-\infty}^{\infty}\widehat f_T(\omega_k)e^{i\omega_kx}\Delta\omega
\quad\xrightarrow{T\to\infty}\quad
\frac{1}{2\pi}\int_{-\infty}^{\infty}\widehat f(\omega)e^{i\omega x}d\omega = f(x)$$

This gives us the two continuous-frequency counterparts of the Fourier-series equations.

## Analysis equation and Synthesis Equations

Recall that the Fourier series itself had two steps. First, we **analyzed** the signal by computing how strongly it aligned with each allowed basis frequency:

$$c_k=\frac{1}{T}\int_{-T/2}^{T/2}f(x)e^{-i\omega_kx}dx$$

Then we **reconstructed** the original function by taking each complex exponential, scaling it by its coefficient, and summing all of the resulting components:

$$f(x)=\sum_{k=-\infty}^{\infty}c_ke^{i\omega_kx}$$

When $T\to\infty$, the discrete frequencies $\omega_k$ become a continuous frequency variable $\omega$. The discrete coefficient sequence $c_k$ is therefore replaced by a continuous frequency-domain function

$$
\boxed{
\widehat f(\omega)
=
\int_{-\infty}^{\infty}
f(x)e^{-i\omega x}dx
}
$$

which tells us the magnitude and phase associated with every angular frequency $\omega$.

This is the **forward Fourier transform**. It performs the same role that calculating the coefficients $c_k$ performed in the Fourier series: it takes the original function and decomposes it into its frequency components.

To reconstruct the original function, we perform the continuous analogue of the Fourier-series summation. Instead of adding together discrete components

$$c_ke^{i\omega_kx}$$

we integrate contributions from every possible angular frequency:

$$
\boxed{
f(x)
=
\frac{1}{2\pi}
\int_{-\infty}^{\infty}
\widehat f(\omega)e^{i\omega x}d\omega
}
$$

This is the **inverse Fourier transform**.

It is important to distinguish between the **Fourier transform itself** and the **output of the transformed function at a particular frequency**.

The forward Fourier transform

$$\mathfrak{F}:f(x)\longmapsto \widehat f(\omega)$$

takes an entire function in the original domain and converts it into another entire function in the frequency domain:

$$\boxed{\widehat f(\omega)=\int_{-\infty}^{\infty}f(x)e^{-i\omega x}dx}$$

The result $\widehat f$ is therefore not a single number. It is a new function whose input variable is angular frequency $\omega$.

Once this new function has been constructed, we can evaluate it at a particular frequency $\omega_0$:

$$\widehat f(\omega_0)=\int_{-\infty}^{\infty}f(x)e^{-i\omega_0x}dx$$

This evaluation returns a single complex number

$$\widehat f(\omega_0)\in\mathbb C,$$

which describes the magnitude and phase associated with that particular frequency.

So we should distinguish between

$$\boxed{f(x)\xrightarrow{\mathfrak F}\widehat f(\omega)}$$
which is a transformation from one function to another, and
$$\boxed{\omega_0\longmapsto\widehat f(\omega_0)}$$

which is simply evaluating the resulting frequency-domain function at one particular frequency.

The inverse Fourier transform works in exactly the opposite direction:

$$\mathfrak{F}^{-1}:\widehat f(\omega)\longmapsto f(x)$$

It takes the entire frequency-domain function and reconstructs the original function by combining the contribution from every angular frequency:

$$\boxed{f(x)=\frac{1}{2\pi}\int_{-\infty}^{\infty}\widehat f(\omega)e^{i\omega x}d\omega}$$

Again, this produces an entire function $f$. After reconstructing that function, we may evaluate it at some particular position or time $x_0$:

$$f(x_0)=\frac{1}{2\pi}\int_{-\infty}^{\infty}\widehat f(\omega)e^{i\omega x_0}d\omega$$
So the complete relationship is
$$\boxed{f \; \xrightarrow{\mathfrak F} \; \widehat f \; \xrightarrow{\mathfrak F^{-1}} \; f}$$

where the forward transform changes our **representation** of the same signal from the original domain to the frequency domain, and the inverse transform changes that representation back.

At the level of individual evaluations,

$$f(x_0)$$

is the value of the signal at one particular position or time, while

$$\widehat f(\omega_0)$$

is the value of its frequency-domain representation at one particular angular frequency.

The Fourier transform therefore does not merely return "the frequency of a signal." It constructs a complete function $\widehat f(\omega)$ describing how the signal is distributed across all frequencies, just as the original function $f(x)$ describes how the signal is distributed across position or time.

The output of the analysis equation $\widehat f(\omega)$ for a desired frequency $\omega$ is a complex number $z\in\mathbb C$ which contains magnitude and phase information associated with that frequency.


## Analysis equation outputs

In this setion we will unpack the analysis equation and see how that reveals the components responsible for different parts of the output allowing us to better interpret said output.

Lets dive deeper into what the output of the analysis equation:
$$\widehat f(\omega)=\int_{-\infty}^{\infty}f(x)e^{-i\omega x}dx$$
tells us about the frequency $\omega$ in the function $f(x)$.

When we take the Fourier transform, $e^{-i\omega x}$ is complex-valued, which can be explicitly seen by rewriting it using Euler's formula:

$$e^{-i\omega x}=\cos(\omega x)-i\sin(\omega x)$$

Substituting this into the Fourier transform gives

$$\widehat f(\omega)=\int_{-\infty}^{\infty}f(x)\left(\cos(\omega x)-i\sin(\omega x)\right)dx$$

Distributing the integral gives

$$\widehat f(\omega)=\int_{-\infty}^{\infty}f(x)\cos(\omega x)dx-i\int_{-\infty}^{\infty}f(x)\sin(\omega x)dx$$

Which we can split up into the real and imaginary components,

$$\operatorname{Re}\left(\widehat f(\omega)\right)=\int_{-\infty}^{\infty}f(x)\cos(\omega x)dx$$

and

$$\operatorname{Im}\left(\widehat f(\omega)\right)=-\int_{-\infty}^{\infty}f(x)\sin(\omega x)dx$$

If we took the inner product of the function with just sine or cosine, we would get a real scalar measuring alignment with that basis function. The Fourier transform performs both measurements at once: the inner product with cosine gives the real part of the complex number, while the negative of the inner product with sine gives the imaginary part.

Thus, the complex Fourier coefficient simply packages two real measurements together:

$$\boxed{\widehat f(\omega)=\text{cosine alignment}-i,\text{sine alignment}}$$

We'll next see how these two measurements tell us the magnitude and phase of a sinusoidal component.


### Phase

Suppose our signal is a phase-shifted cosine wave:

$$f(x)=A\cos(\omega_0x+\phi)$$

Using the angle addition identity,

$$\cos(\alpha+\beta)=\cos(\alpha)\cos(\beta)-\sin(\alpha)\sin(\beta)$$

we get

$$\cos(\omega_0x+\phi)=\cos(\omega_0x)\cos(\phi)-\sin(\omega_0x)\sin(\phi)$$

So we can rewrite our original phase-shifted cosine wave as,

$$f(x)=A\cos(\phi)\cos(\omega_0x)-A\sin(\phi)\sin(\omega_0x)$$

This shows that a phase-shifted cosine can always be represented as a scaled but unshifted combination of cosine and sine at the same frequency. The same is true for a phase shifted sine wave:

$$\sin(\omega_0x+\phi)=\sin(\omega_0x)\cos(\phi)+\cos(\omega_0x)\sin(\phi)$$

>    **A bit of geometric intuition**: 
>
>    Back to our original phase-shifted cosine, the coefficient of the cosine component is
>    $$C=A\cos(\phi),$$
>
>    while the coefficient of the sine component is
>
>    $$S=-A\sin(\phi)$$

>    These two values can be geometrically interpreted as coordinates in a two-dimensional plane associated with the frequency $\omega_0$:

>    $$(C,S)=\left(A\cos\phi,-A\sin\phi\right)$$

>    Changing the phase $\phi$ changes how much of the signal lies along both the cosine and sine direction.
>    For example for $\phi = 0$,
>    $$\cos(\omega t + 0)=\cos(0)\cdot\cos(\omega t)+\sin(0)\cdot\sin(\omega t)$$

>    $$\cos(\omega t + 0)=1\cdot\cos(\omega t)+0\cdot\sin(\omega t)$$
>    has coordinates
>    $$(1,0).$$

>    A phase shift of $\pi/4$ gives
>    $$\cos\left(\omega t+\frac{\pi}{4}\right)=\frac{\sqrt2}{2}\cos(\omega t)-\frac{\sqrt2}{2}\sin(\omega t)$$
>    with coordinates
>    $$\left(\frac{\sqrt2}{2},-\frac{\sqrt2}{2}\right).$$

>    A phase shift of $\pi/2$ gives
>    $$\cos\left(\omega t+\frac{\pi}{2}\right)= 0 \cos(\omega t)-1\sin(\omega t)$$
>    with coordinates
>    $$(0,-1).$$

>    As the phase changes, these cosine and sine coefficients rotate around clockwise in a two-dimensional plane. I know there are a lot of trig functions floating around but right now we are just looking at how a phase-shifted cos / sin can be equivalently expressed using the angle addition identity. Now, we'll introduce back the real and imaginary parts of the Fourier transform's output. 

Recall:
$$\operatorname{Re}\left(\widehat f(\omega)\right)=\int_{-\infty}^{\infty}f(x)\cos(\omega x)dx$$
and
$$\operatorname{Im}\left(\widehat f(\omega)\right)=-\int_{-\infty}^{\infty}f(x)\sin(\omega x)dx$$

Note that the imaginary part of the Fourier transform output is the **negative** of the sine alignment.

Now a blast from the past; as explored in the previous Fourier blog we saw that the inner product of two functions is:
$$\langle f,g\rangle=\int_a^b f(x)g(x)\,dx$$

namely for sine and cosine:

$$\langle \sin(mx),\sin(nx)\rangle=\int_0^{2\pi}\sin(mx)\sin(nx)\,dx=
\begin{cases}0, & m\neq n, \\\pi, & m=n,\end{cases}$$
$$
\langle \cos(mx),\cos(nx)\rangle=\int_0^{2\pi}\cos(mx)\cos(nx)\,dx=
\begin{cases}0, & m\neq n, \\\pi, & m=n,\end{cases}$$
and
$$\langle \sin(mx),\cos(nx)\rangle=\int_0^{2\pi}\sin(mx)\cos(nx)\,dx=0$$

So for our phase-shifted cosine,

$$f(x)=A\cos(\omega_0x+\phi),$$

we can rewrite it equivalently as:

$$f(x)=A\cos(\phi)\cos(\omega_0x)-A\sin(\phi)\sin(\omega_0x)$$

Plugging in $f(t)$ into the Fourier analysis equation basically performs an inner product between the phase shifted input function $f(x)$ and a cosine / sine function giving us the real and imaginary parts of the output respectively.


$$\operatorname{Re}\left(\widehat f(\omega)\right) =
 \langle f(x),\cos(\omega t)\rangle = 
 \langle A\cos(\phi)\cos(\omega_0x)-A\sin(\phi)\sin(\omega_0x), \cos(\omega x)\rangle
$$

Since the inner product is a linear operator we can split this up into:

$$\langle \cos(\omega x), A\cos(\phi)\cos(\omega_0x)\rangle \propto A\cos(\phi)$$

$$\langle \cos(\omega x), -A\sin(\phi)\sin(\omega_0x)\rangle = 0$$

Thus

$$\operatorname{Re}\left(\widehat f(\omega_0)\right)\propto A\cos(\phi)$$

Similarly:

$$\operatorname{Im}\left(\widehat f(\omega_0)\right) = 
\langle f(x),\sin(\omega x)\rangle = 
\langle A\cos(\phi)\cos(\omega_0x)-A\sin(\phi)\sin(\omega_0x), \sin(\omega x)\rangle
$$

Now splitting the terms in the inner product gives us:

$$\langle \sin(\omega x), A\cos(\phi)\cos(\omega_0x)\rangle = 0$$

$$\langle \sin(\omega x), -A\sin(\phi)\sin(\omega_0x)\rangle \propto A\sin(\phi)$$

thus

$$\operatorname{Im}\left(\widehat f(\omega_0)\right)\propto A\sin(\phi)$$

Therefore, the resulting complex coefficient has the form

$$z\propto A\cos(\phi)+iA\sin(\phi).$$

This is the connection we were looking for. The real and imaginary parts of the Fourier coefficient act as two coordinates,

$$(A\cos\phi,A\sin\phi),$$

whose positions depends on the phase $\phi$.

We can even rewrite this with Euler's formula,

$$e^{i\phi}=\cos(\phi)+i\sin(\phi),$$

packaging it as: 
$$z\propto Ae^{i\phi}.$$


The main takeaway is that taking the forward Fourier transform of an equation takes the inner product of that equation with respect to the basis functions sine and cosine and when we query a frequency from the resulting analysis equation we get a complex number that packages information into a complex number. The real and imaginary parts of the complex number encode phase since they are proportional to $A \cos(\phi)$ and $A \sin(\phi)$ respectively.

### Magnitude 

Thinking about this more geometrically, if we graphed $(A\cos\phi,A\sin\phi),$ as a point on the complex plane the magnitude of complex output can be defined as the length of a vector from the origin to that point.

$$|z|\propto\sqrt{A^2\cos^2\phi+A^2\sin^2\phi}=A,$$

up to the scaling introduced by the particular Fourier transform or DFT normalization.

Its angle is

$$\arg(z)=\operatorname{atan2}\left(A\sin\phi,A\cos\phi\right)=\phi.$$

Which is the phase of our original function.

So the Fourier transform's complex output can be interpreted geometrically as a vector in the complex plane:

$$\boxed{\widehat f(\omega)=\text{magnitude}\times e^{i\,\text{phase}}}$$

The distance of the coefficient from the origin tells us how strongly that frequency is present, while its angle tells us the phase of that frequency component.

Notice that the coefficient does not generally lie on the unit circle. Its magnitude depends on how strongly the frequency is present. Dividing by its magnitude,

$$\frac{\widehat f(\omega)}{|\widehat f(\omega)|}=e^{i\phi},$$

removes the magnitude information and leaves a point on the unit circle whose angle encodes only the phase.

A cool geometric visualization of the output is, that as we query different frequencies $\omega$ in $\widehat f(\omega)$ we plot those points in the complex plain which will produce points at different angles from the real line depending on phase and different radii from the origin depending on amplitude. This creates a rubber band like visualization for funky input functions that we will program in the implementation section of this article.

Put a promo picture here:


## Recap

Ok, just to briefly recap, thus far we have taken the Fourier Series, let it's period extend to infinity which allowed us to derive the forward and backward Fourier Transform. With these transforms we can \**akhem coughs\** transform, a function of position or time into a function of frequency and then back to its original domain by integrating it (taking the inner product) with $e^{i \omega x}$. Lastly we looked at what features of an input function influence the output of the analysis equation, namely how the phase and magnitude of a function determine the complex output.

Now we will transition to the applications side of things and discretize our equations so that we can use the magic of computer science to solve them analytically.

# DFT

## Discretization

In real life, we might not know the underlying continuous function $f(t)$ that produces a signal. Instead, we usually have a finite number of measurements collected over some time interval $T$.

Suppose we collect $N$ measurements at regularly spaced time intervals $\Delta t$. We can represent these measurements as an array:

$$x[0],x[1],x[2],\ldots,x[N-1]$$

Each element of the array corresponds to a measurement of our original function at some time $t_n$:

$$\boxed{x[n]=f(t_n)=f(n\Delta t)}$$

where $n\in\{0,1,\ldots,N-1\}$ is the sample index.

Since our $N$ samples are equally spaced over an observation interval of duration $T$, we have:

$$\Delta t=\frac{T}{N}$$

The reciprocal of the sampling interval is called the **sampling frequency** $f_s$, which tells us how many measurements we collect per second:

$$f_s=\frac{1}{\Delta t}=\frac{N}{T}$$

It's worth distinguishing between two operations here:

1. **Sampling:** Replacing the continuous time variable $t$ with discrete points $t_n=n\Delta t$.
2. **Truncation:** Restricting ourselves to a finite number $N$ of samples.

Our resulting array therefore contains $N$ discrete measurements of the original function over a finite observation interval.

### Discretizing the Forward Fourier Transform

Recall the forward Fourier Transform:

$$\widehat f(\omega)=\int_{-\infty}^{\infty}f(t)e^{-i\omega t}dt$$

There are three things we need to change to calculate this transform using a finite array of measurements:

1. Restrict the infinite integration interval to the interval we actually observed.
2. Replace integration over continuous time with summation over discrete samples.
3. Replace the continuous frequency variable $\omega$ with a finite collection of discrete frequencies $\omega_k$.

Let's do these one at a time.

**1. Restricting the integration interval**

Our original Fourier Transform integrates over all time, from $-\infty$ to $\infty$. But we only have measurements over the interval $[0,T)$.

So instead, consider the Fourier Transform of the signal restricted to that interval:

$$\widehat f_T(\omega)=\int_0^T f(t)e^{-i\omega t}dt$$

Easy enough.

**2. Replacing integration with summation**

Recall from numerical integration that we can approximate a definite integral using a Riemann sum:

$$\int_a^b g(t)\,dt\approx\sum_{n=0}^{N-1}g(t_n)\Delta t$$

where the interval is divided into $N$ equally sized segments of width $\Delta t$.

We can apply exactly the same idea to our Fourier Transform.

Starting with:

$$\widehat f_T(\omega)=\int_0^T f(t)e^{-i\omega t}dt$$

We replace the integral with a sum:

$$\widehat f_T(\omega)\approx\sum_{n=0}^{N-1}f(t_n)e^{-i\omega t_n}\Delta t$$

Now substitute the definitions we introduced earlier:

$$t_n=n\Delta t$$
and
$$x[n]= f(t_n) = f(n\Delta t)$$

This gives:
$$
\boxed{
\widehat f_T(\omega)\approx
\Delta t\sum_{n=0}^{N-1}x[n]e^{-i\omega n\Delta t}
}
$$

We've now successfully replaced the continuous function with a finite array of measurements and the integral with a finite sum.

However, there's still one problem: the frequency variable $\omega$ can take any real value. So while we can evaluate this expression using a computer, it still describes a continuous-frequency function.

**3. Discretizing the frequency axis**

Luckily, we've already encountered the solution to this problem earlier in the article when deriving the Fourier series for functions of arbitrary period $T$.

Recall that the allowed angular frequencies for a periodic function of period $T$ are:

$$\omega_k=k\frac{2\pi}{T},\qquad k\in\mathbb Z$$
The spacing between consecutive frequencies is:
$$\Delta\omega=\frac{2\pi}{T}$$

Instead of evaluating our transform at every possible angular frequency $\omega$, we can evaluate it at these discrete frequencies $\omega_k$.

Substituting $\omega_k$ into our discretized expression gives:

$$\widehat f_T(\omega_k)\approx
\Delta t\sum_{n=0}^{N-1}x[n]e^{-i\omega_k n\Delta t}$$

Now substitute:
$$\omega_k=\frac{2\pi k}{T}$$
to get:
$$\widehat f_T(\omega_k)\approx
\Delta t\sum_{n=0}^{N-1}x[n]e^{-i\frac{2\pi k}{T}n\Delta t}$$

Recall that $\Delta t=T/N$. Therefore:

$$
\frac{2\pi k}{T}n\Delta t
=\frac{2\pi k}{T}n\frac{T}{N}
=\frac{2\pi kn}{N}
$$

Our expression simplifies to:

$$
\boxed{
\widehat f_T(\omega_k)\approx
\Delta t\sum_{n=0}^{N-1}x[n]e^{-i\frac{2\pi kn}{N}}
}
$$

This is almost exactly the equation for the Discrete Fourier Transform.

The only difference is the factor $\Delta t$ outside the sum, which accounts for the time interval represented by each sample when approximating the continuous integral. It is important to distinguish between increasing the number of samples and increasing the duration of the observed signal:

If we increase the sampling rate while keeping the observation duration $T$ constant, the sum contains more terms, but $\Delta t=T/N$ decreases proportionally, leaving the approximation of the integral approximately unchanged.

However, if we observe a periodic signal such as a cosine for twice as long, increasing the observation duration from $T$ to $2T$ while keeping the sampling rate constant, the Fourier coefficient at the corresponding signal frequency doubles, assuming the observation contains an integer number of complete periods.

Therefore, the factor $\Delta t$ accounts for the spacing between samples, while the total observation duration $T=N\Delta t$ determines how much signal contributes to the integral.

By convention, the DFT is defined without the $\Delta t$ factor, and its frequency-domain output is written as $X[k]$ rather than $\widehat f_T(\omega_k)$.

So we arrive at:

$$
\boxed{
X[k]=\sum_{n=0}^{N-1}x[n]e^{-i\frac{2\pi kn}{N}}
}
$$

This is the **Discrete Fourier Transform (DFT)**.

### Why only N frequency samples?

There's one final issue worth addressing before we derive the inverse transform.

Earlier, our Fourier series used infinitely many frequencies indexed by $k\in\mathbb Z$.

But the DFT only evaluates $N$ frequencies:

$$k=0,1,\ldots,N-1$$
Why?
Consider the exponential term in the DFT:
$$e^{-i\frac{2\pi kn}{N}}$$

What happens if we increase the frequency index by $N$?

$$e^{-i\frac{2\pi(k+N)n}{N}}$$

Expanding the exponent gives:

$$e^{-i\frac{2\pi kn}{N}}e^{-i2\pi n}$$

Since $n$ is an integer, Euler's formula tells us that:

$$e^{-i2\pi n}=1$$

Therefore:

$$
\boxed{
e^{-i\frac{2\pi(k+N)n}{N}}
=
e^{-i\frac{2\pi kn}{N}}
}
$$

This means that frequency indices $k$ and $k+N$ produce exactly the same exponential values at every sample index $n$. Geometrically, this is due to completing a full rotation around the imaginary unit circle and ending up where we started.

Consequently:

$$\boxed{X[k+N]=X[k]}$$
The DFT is periodic in its frequency index with period $N$.

Therefore, there are only $N$ distinct discrete exponential basis functions, and we only need $N$ frequency coefficients to represent an arbitrary sequence of $N$ complex-valued samples.

### Discretizing the Inverse Fourier Transform

Now that we've derived the forward DFT, we need a way to reconstruct our original array $x[n]$ from the frequency coefficients $X[k]$.

Recall the inverse continuous Fourier Transform:

$$f(t)=\frac{1}{2\pi}\int_{-\infty}^{\infty}\widehat f(\omega)e^{i\omega t}d\omega$$

Just as we replaced the time integral with a finite sum in the forward transform, we can replace the frequency integral with a sum over the discrete frequencies $\omega_k$.

To motivate the reconstruction, consider the finite Fourier synthesis sum:

$$x[n]=\sum_{k=0}^{N-1}c_ke^{i\omega_k n\Delta t}$$

Here, the $c_k$ are the coefficients of the discrete complex exponential basis functions.

From the same inner-product argument used in the Fourier series, the coefficients are:

$$c_k=\frac{1}{N}\sum_{n=0}^{N-1}x[n]e^{-i\frac{2\pi kn}{N}}$$

Notice that the sum on the right is exactly our forward DFT:

$$X[k]=\sum_{n=0}^{N-1}x[n]e^{-i\frac{2\pi kn}{N}}$$

Therefore:

$$c_k=\frac{X[k]}{N}$$

Substituting into the synthesis equation gives:

$$x[n]=\frac{1}{N}\sum_{k=0}^{N-1}X[k]e^{i\omega_k n\Delta t}$$

Finally, substituting $\omega_k=2\pi k/T$ and $\Delta t=T/N$ gives:

$$
\boxed{
x[n]=\frac{1}{N}\sum_{k=0}^{N-1}X[k]e^{i\frac{2\pi kn}{N}}
}
$$

This is the **Inverse Discrete Fourier Transform (IDFT)**.

### Putting it all together

We've now converted both Fourier Transform equations into their discrete counterparts.

The forward DFT transforms an array of $N$ samples into an array of $N$ complex frequency coefficients:

$$
\boxed{
X[k]=\sum_{n=0}^{N-1}x[n]e^{-i\frac{2\pi kn}{N}}
}
$$

The inverse DFT reconstructs the original samples from those coefficients:

$$
\boxed{
x[n]=\frac{1}{N}\sum_{k=0}^{N-1}X[k]e^{i\frac{2\pi kn}{N}}
}
$$

where $n,k\in\{0,1,\ldots,N-1\}$.


## Sampling

(This section could be very long and I will likely make some articles about sampling and connect it to information theory to get the Nyquist sampling rate but for now I'll do a surface level exploration that should be enough to setup concepts later in this article.)


The next question is: Given, we are interested in the phase and magnitude of a frequency $\omega_k$ in a signal, how many points do we need to sample from the signal for the DFT to be able to provide the desired output for the frequency component.

First, lets impose a simplifying assumption that the signal which we are decomposing is made up of a finite set of component frequencies. In other words the Fourier transform of the signal is zero outside some finite frequency range. When this is the case the signal is said to be **band-limited**. Then we can suppose that there is a maximum frequency component $f_{max}$ which is the maximum frequency present in our signal. 

So how many samples do we need to take to have enough "granularity" to find $f_{max}$ with the DFT?

Intuitively, when we look at a signal or function with a high frequency we see that the signal moves or oscillates more frequently, and to capture all these changes in the signal we will need to sample more points.  

Suppose we have a simple cosine function with frequency $f_0$.

$$f(t) = \cos(2\pi f_0 t)$$

Then lets sample this signal at a sampling frequency $f_s$.
$$f_s = \frac{N}{T}$$
In this case our discrete samples are:
$$x[n] = \cos(2\pi f_0 \frac{n}{f_s})$$


<iframe
  src="./content/misc_math/DFT/sampling_widget.html"
  width="100%"
  height="650"
  scrolling="no"
  loading="lazy"
  title="Interactive Cosine Sampling Visualizer"
  style="
    display: block;
    width: 100%;
    border: none;
    overflow: hidden;
    border-radius: 12px;
    margin: 20px 0;
  ">
</iframe>


As we can see an interesting symmetry emerges, as the fundamental frequency of our cosine function increases above our sampling frequency, our sampled points once again take on previous values. Namely:

$$\cos(2\pi \frac{f_0 n}{f_s}) = \cos(2\pi \frac{(f_s - f_0)n}{f_s})$$

for integer $n$. 

For example sampling a 5Hz cosine at 8 samples per second produces exactly the same values as sampling a 3Hz cosine at the same rate. Meaning that if we sample using a rate of 8 samples per second a 5Hz cosine could be "confused" for a 3Hz cosine.

In signal processing this symmetry phenomenon is called **aliasing**. 

As we saw frequencies above half the sampling rate can become indistinguishable from lower frequencies. The critical cutoff frequency for which we can get distinct sample values is called the **Nyquist frequency**:
$$f_N = \frac{f_s}{2} = \frac{N}{2T}$$

or in terms of angular frequency:
$$\omega_N = 2 \pi f_N = \frac{\pi N}{T}$$

There is a lot more information-theoretical stuff we can go into here but the main point is that the Nyquist-Shannon sampling theorem tells us that a signal band-limited to frequencies below $f_{max}$ can, under ideal conditions, be perfectly reconstructed from uniformly spaced samples if 

$$f_s > 2f_{max}$$
or equivalently,
$$N > 2Tf_{max}$$






# Algorithm

Now that we have defined the DFT and its inputs lets get into the more computational side of things and implementation.

First, lets do a quick recap of the terms and equations we will be using as building blocks for our code.

## Index of Terms

DFT and IDFT:

$$
\boxed{
X[k]=\sum_{n=0}^{N-1}x[n]e^{-i\frac{2\pi kn}{N}}
\qquad
x[n]=\frac{1}{N}\sum_{k=0}^{N-1}X[k]e^{i\frac{2\pi kn}{N}}

}
$$

Where
- $T$ - Total observation duration
- $N$ Number of sampled points
- $n$ - Sample index, $0\le n<N$
- $k$ - DFT frequency index, $0\le k<N$
- $\Delta t$ - Time interval between samples
- $f_s$ - Sampling frequency, in samples per second
- $f_{\max}$ - Highest frequency present in a band-limited signal
- $f_N$ - Nyquist frequency
- $\Delta f$ - Spacing between adjacent DFT frequency bins
- $\omega_k$ - Angular frequency of the $k$th frequency bin
- $x[n]$ - Original signal sampled at index $n$
- $X[k]$ - Complex Fourier coefficient at index $k$

The main relationships are:

$$\boxed{\Delta t=\frac{T}{N}}$$
$$\boxed{f_s=\frac{1}{\Delta t}=\frac{N}{T}}$$
$$\boxed{f_N=\frac{f_s}{2}=\frac{N}{2T}}$$
$$\boxed{\Delta f=\frac{1}{T}=\frac{f_s}{N}}$$
$$\boxed{\omega_k=2\pi\frac{k}{T}=\frac{2\pi kf_s}{N}}$$


## Pseudocode

We can express the direct DFT compactly in Python:

```py
# x = [x1, x2, ... xn]
def dft(x):
    N = len(x)      # Input length
    X = [0j] * N    # Empty list of imaginary numbers of size N

    for k in range(N):
        for n in range(N):
            angle = -2 * pi * k * n / N    # Exponent term
            X[k] += x[n] * exp(1j * angle) # Summation

    return X
```


The outer loop iterates over the $N$ frequency bins and the inner loop computes and sums the contribution of every input sample towards that $k$th frequency.

This gives a time complexity of $O(N^2)$ which is not great.

To put that into perspective if we were to evaluate a recording sampled at 44.1kHz ie 44,100 samples every second for a duration of ten seconds it would require $(44100 * 10)^2$ complex multiply and accumulate operations. That is roughly 194 billion input–coefficient products. The actual runtime depends strongly on hardware, implementation, and whether coefficients are cached, but the scaling is unavoidable: increasing the recording length by a factor of 18 multiplies the operation count by $18^2=324$.

## View through the matrix

If we look at the DFT we see that the exponential term does not depend on a specific sampled value $x[n]$ only on size $N$.

$$e^{-i\frac{2\pi kn}{N}}$$

so we can precompute these values for each $k$ and store them in an $N \times N$ matrix $F_N$, which is nice because we can perform multiply and summation by matrix multiplying the matrix with the samples.

Ex. $N = 4$

$$
F_4 =
\begin{bmatrix}
e^{-i\frac{2\pi(0)(0)}{4}} & e^{-i\frac{2\pi(0)(1)}{4}} & e^{-i\frac{2\pi(0)(2)}{4}} & e^{-i\frac{2\pi(0)(3)}{4}} \\
e^{-i\frac{2\pi(1)(0)}{4}} & e^{-i\frac{2\pi(1)(1)}{4}} & e^{-i\frac{2\pi(1)(2)}{4}} & e^{-i\frac{2\pi(1)(3)}{4}} \\
e^{-i\frac{2\pi(2)(0)}{4}} & e^{-i\frac{2\pi(2)(1)}{4}} & e^{-i\frac{2\pi(2)(2)}{4}} & e^{-i\frac{2\pi(2)(3)}{4}} \\
e^{-i\frac{2\pi(3)(0)}{4}} & e^{-i\frac{2\pi(3)(1)}{4}} & e^{-i\frac{2\pi(3)(2)}{4}} & e^{-i\frac{2\pi(3)(3)}{4}}
\end{bmatrix}
=
\begin{bmatrix}
1 & 1 & 1 & 1 \\
1 & -i & -1 & i \\
1 & -1 & 1 & -1 \\
1 & i & -1 & -i
\end{bmatrix}
$$

So we can compute the output by matrix multiplying this matrix by a column vector of samples:

$$\mathbf{X} = F_N \mathbf{x}$$

Ex:

$$ 
\mathbf{X} =
\begin{bmatrix}
1 & 1 & 1 & 1 \\
1 & -i & -1 & i \\
1 & -1 & 1 & -1 \\
1 & i & -1 & -i
\end{bmatrix} 

\begin{bmatrix}
x[0] \\
x[1] \\
x[2] \\
x[3]
\end{bmatrix} 
$$

Here is a visualization of the exponential term matrix for different values of $N$:

<iframe
  src="./content/misc_math/DFT/dft_matrix_vectors.html"
  width="100%"
  height="850"
  scrolling="no"
  loading="lazy"
  title="DFT Matrix Complex Vector Visualizer"
  style="
    display: block;
    width: 100%;
    border: none;
    overflow: hidden;
    border-radius: 12px;
    margin: 20px 0;
  ">
</iframe>

Here are some noteworthy observations about the exponential matrix:

1. The entire first row ($k=0$) and first column ($n=0$) evaluate to $e^0=1$, regardless of the size of $N$.

2. For $k=1$, each successive value advances by an angle of $-2\pi/N$ around the complex unit circle. It therefore takes exactly $N$ steps to complete one full rotation.

3. For any row $k$, the angular step between consecutive values is $k$ times the angular step of row $k=1$:

   $$\Delta\theta_k=-\frac{2\pi k}{N}$$

   Note that the magnitude of every vector remains 1; only its direction changes. The number of distinct values in row $k$ is $N/\gcd(k,N)$ for $k>0$. Consequently, some rows complete their rotations and begin repeating before reaching $N$ steps.

4. When $N$ is even, the row $k=N/2$ corresponds to the Nyquist frequency. Its values alternate between $1$ and $-1$:

   $$e^{-i\frac{2\pi(N/2)n}{N}}=e^{-i\pi n}=(-1)^n$$

   When $N$ is odd, there is no row corresponding exactly to the Nyquist frequency.

5. Rows $k$ and $N-k$ are complex conjugates of each other:

    $$\boxed{F_N[N-k,n]=\overline{F_N[k,n]}}$$

   Geometrically, their vectors are reflected across the real axis of the complex plane. Their real components are identical, while their imaginary components have opposite signs. This symmetry exists for every $N$.

6. The matrix is symmetric along its main diagonal because multiplication is commutative:
    $$F_N[k,n]=F_N[n,k]$$

7. The size and factorization of $N$ affect the repetition patterns within the matrix. For example, when $N=7$ (prime), every nonzero row visits all seven distinct roots of unity before repeating. When $N=6$ (composite), some rows repeat after fewer than six steps.


## First Optimization: Conjugate Symmetry (top half gives us second half)

As we have seen in the sampling section and in the matrix one above: rows $k$ and $N-k$ are complex conjugates of each other:

$$\boxed{F_N[N-k,n]=\overline{F_N[k,n]}}$$

It's worth being precise about what taking a conjugate actually costs us. For a complex number $z=a+ib$, its conjugate is

$$\overline{z}=\overline{a+ib}=a-ib$$

Geometrically this reflects the vector across the real (x) axis and computationally it means flipping the sign of the imaginary part. For a real-valued input, this relation also carries over from the matrix coefficients to the DFT outputs: $X[N-k]=\overline{X[k]}$. Thus we compute outputs $k=0,\ldots,\lfloor N/2\rfloor$ and obtain the remaining outputs by conjugation. For even $N$, there are $N/2+1$ directly computed outputs, with row $0$ and row $N/2$ self-conjugate.

Below is the same exponential matrix as before. Toggle cells by clicking, or hold and drag across the grid to toggle several at once. Every cell that can be read off a toggled one by flipping its imaginary sign lights up. Try "Select top half" to see the whole matrix fill in, and notice that row $0$ (and row $N/2$ when $N$ is even) are their own mirror images, which is why they have to be computed.

<iframe
 src="./content/misc_math/DFT/dft_conjugate_symmetry.html"
 width="100%"
 height="1000"
 scrolling="no"
 loading="lazy"
 title="DFT Matrix Conjugate Symmetry"
 style="
 display: block;
 width: 100%;
 border: none;
 overflow: hidden;
 border-radius: 12px;
 margin: 20px 0;
 ">
 </iframe>


```py
def dft_conj(x):
    N = len(x)
    X = [0j] * N

    # Calculate only the top half (nonnegative frequencies)
    for k in range(N // 2 + 1):
        for n in range(N):
            angle = -2 * pi * k * n / N
            X[k] += x[n] * exp(1j * angle)

    # Bottom half: flip the sign of the imaginary part
    for k in range(1, (N - 1) // 2 + 1):
        X[N - k] = complex(X[k].real, -X[k].imag) # conjugate

    return X

```

This means that for even $N$ the number of summation terms decreases from $N^2$ to $N(\frac{N}{2}+1)$ plus a sign flip for each of the $\frac{N}{2} - 1$ terms. Note, that while this improved our computation by a constant factor the asymptotic complexity is still $O(N^2)$ and this only works for real-valued input signals as complex sequences do not have this conjugate symmetry. (For our focus of signal processing this is fine as we will be working with real valued signals.)

## Second Optimization: Loop Symmetry (The left half gives us the right half)


The first optimization split the matrix horizontally. A crucial symmetry appears when we instead compare the first half of a row of the DFT matrix to the second half.

Recall that

$$F_N[k,n]=e^{-i\frac{2\pi kn}{N}}$$

Now compare the entry in column $n$ with the entry in column $n+\frac N2$:

$$
F_N\left[k,n+\frac N2\right]
=
e^{-i\frac{2\pi k(n+N/2)}{N}}
=
e^{-i\frac{2\pi kn}{N}}e^{-i\pi k}
=
(-1)^kF_N[k,n]
$$

Therefore:

- if $k$ is even, then
  $$
  F_N\left[k,n+\frac N2\right]=F_N[k,n]
  $$
- if $k$ is odd, then
  $$
  F_N\left[k,n+\frac N2\right]=-F_N[k,n]
  $$

We can understand this property geometrically by remembering that each element of our DFT matrix is an $N$th root of unity raised to some integer power, representing a rotation around the complex unit circle.

For a fixed row $k$, moving from column $n$ to column $n+\frac N2$ advances the rotation by

$$\Delta\theta=-\frac{2\pi k}{N}\frac N2=-\pi k.$$

In other words, moving halfway across a row corresponds to making $k$ half clockwise revolutions around the unit circle or equivalently $k/2$ full rotations. (This is a property we already stated as .2 and .3 when we observed the exponential matrix initially)

- **When $k$ is even**, $k/2$ is an integer, so we complete an integer number of full revolutions and return to exactly the same position. Therefore, the corresponding complex values are identical.
- **When $k$ is odd**, $k/2$ is a half-integer, so after completing some number of full revolutions, we have an additional half-revolution ($\pi$ radians) remaining. This places us on the opposite side of the unit circle, giving us the negative of the original complex value.

For example, when $k=2$, moving halfway across the row produces one complete revolution ($2\pi$), whereas for $k=3$, it produces one and a half revolutions ($3\pi$).

This explains why the second half of every row is either a copy or the negation of its first half. The symmetry is a direct consequence of the periodicity of complex rotations, and as we'll see next, it allows us to combine pairs of input samples using additions and subtractions rather than calculating every contribution independently.

Computationally this sign flip is just a negation, this time of both complex parts, $-(a+ib) = -a-ib$, which is a half-turn around the origin.

Here is the matrix again, this time split down the middle. Toggling a cell (or dragging across several) lights up its partner half a row away: marked $=$ when $k$ is even and $-$ when $k$ is odd. "Select left half" shows the left half alone determines the whole matrix.

<iframe
 src="./content/misc_math/DFT/dft_sign_flip.html"
 width="100%"
 height="1020"
 scrolling="no"
 loading="lazy"
 title="DFT Matrix Left Half Gives the Right Half"
 style="
 display: block;
 width: 100%;
 border: none;
 overflow: hidden;
 border-radius: 12px;
 margin: 20px 0;
 ">
 </iframe>



## Combining the Two Optimizations

We have now identified two important symmetries in the DFT matrix:

1. **Conjugate symmetry:** Rows $k$ and $N-k$ contain complex conjugates of one another.
2. **Half-row sign symmetry:** The right half of each row is either identical to or the negative of its left half, depending on whether $k$ is even or odd.

Individually, both optimizations allow us to avoid computing certain complex exponential coefficients. But what happens when we apply them together?

From here on, it's convenient to name the basic rotation:

$$W_N=e^{-i\frac{2\pi}{N}}$$

So that every entry in our DFT matrix can be represented as a power of it:

$$F_N[k,n]=W_N^{kn}$$

Recall the two identities we derived:

$$F_N[N-k,n]=\overline{F_N[k,n]}$$

and

$$F_N[k,n+N/2]=(-1)^kF_N[k,n]$$

The first identity tells us that the bottom half of the matrix can be obtained by taking the complex conjugates of the corresponding rows in the top half. The second tells us that the right half can be obtained from the left half by either copying or negating its entries.

Combining these two properties means that we only need to directly evaluate the coefficients in the top-left quadrant of the matrix. Every other entry can be generated by applying one or both of our symmetry operations.

More precisely, for even $N$, the region we need consists of:

$$\boxed{F_N[k,n]=W_N^{kn},\qquad0\le k\le N/2,\quad 0\le n<N/2}$$

This is slightly larger than the top-left quadrant because we must also include the row $k=N/2$. This is the Nyquist row, which is its own conjugate counterpart.

For an $N\times N$ matrix containing $N^2$ entries, our directly evaluated region contains:

$$\boxed{\left(\frac N2+1\right)\frac N2=\frac{N^2}{4}+\frac N2}$$

entries.

So, rather than evaluating every complex exponential independently, we can construct the entire matrix from roughly one quarter of its entries using conjugation and sign changes.

Here is the combined view. Start by selecting a cell in the top-left region and watch its related coefficients appear through conjugation, half-row sign flips, or both.

<iframe
 src="./content/misc_math/DFT/dft_combined_symmetry.html"
 width="100%"
 height="850"
 scrolling="no"
 loading="lazy"
 title="DFT Matrix Combined Symmetry"
 style="display:block;width:100%;border:none;overflow:hidden;border-radius:12px;margin:20px 0;">
</iframe>

### What Have We Actually Optimized?

We have substantially reduced the number of complex exponentials we need to evaluate independently. However, there is an important distinction between computing the DFT matrix and using that matrix to compute the DFT.

Recall the matrix representation:
$$\boxed{\mathbf X=F_N\mathbf x}$$

Even though we can now generate the coefficient matrix much more efficiently, multiplying that matrix by our input vector still involves computing $N$ weighted sums, each containing $N$ terms.

If we evaluate each of these sums independently, the matrix-vector multiplication still requires $O(N^2)$ arithmetic operations. In other words, we have optimized how the coefficients are generated, but we haven't fundamentally changed how the DFT itself is computed.

This raises a more interesting question:

**Can we use the same symmetries to reorganize the multiplication, so that we no longer need to evaluate every weighted sum independently?**


# Radix-2 FFT

## Divide and Conquer

So far, we have treated the DFT as a matrix-vector multiplication and studied how its coefficient matrix can be constructed more efficiently. But the real computational cost comes from multiplying that matrix by the input vector.

Let's return to the original DFT equation:

$$X[k]=\sum_{n=0}^{N-1}x[n]e^{-i\frac{2\pi kn}{N}}
=\sum_{n=0}^{N-1}x[n]W_N^{kn}$$

We know from our earlier observations that the right half of each row of the DFT matrix is related to the left half by:

$$W_N^{k(n+N/2)}=(-1)^kW_N^{kn}$$

Instead of using this relationship merely to avoid evaluating duplicate coefficients, let's see what happens when we apply it directly to the weighted sum.

First, split the sum into two halves:

$$X[k]= \sum_{n=0}^{N-1}x[n]W_N^{kn} = 
\sum_{n=0}^{N/2-1}x[n]W_N^{kn}
+
\sum_{n=0}^{N/2-1}x[n+N/2]W_N^{k(n+N/2)}$$

Using our symmetry identity, we can replace the exponential in the second sum:

$$
X[k]=
\sum_{n=0}^{N/2-1}x[n]W_N^{kn}
+
\sum_{n=0}^{N/2-1}x[n+N/2](-1)^kW_N^{kn}
$$

Both sums now contain exactly the same exponential coefficient, allowing us to combine them:

$$
\boxed{
X[k]=\sum_{n=0}^{N/2-1}\left(x[n]+(-1)^kx[n+N/2]\right)W_N^{kn}
}
$$

So instead of multiplying two separate input samples by related exponential coefficients, we can first combine the input samples and then perform a single multiplication.

We have reduced the number of terms in each sum from $N$ to $N/2$, at the cost of introducing additions or subtractions.

But notice something interesting: the operation inside the parentheses depends only on whether $k$ is even or odd.

This means we can separate the problem into two cases.

### Even Frequency Indices

For even values of $k$, we can write $k=2r$.

Since $(-1)^{2r}=1$, the equation becomes:

$$
X[2r]=
\sum_{n=0}^{N/2-1}
\left(x[n]+x[n+N/2]\right)W_N^{2rn}
$$

Define a new sequence containing the pairwise sums of our original input:

$$
a[n]=x[n]+x[n+N/2],
\qquad 0\le n<N/2
$$

Then:

$$
X[2r]=\sum_{n=0}^{N/2-1}a[n]W_N^{2rn}
$$

Now let's take a closer look at the exponential coefficient.

$$
W_N^{2rn}
=e^{-i2\pi(2rn)/N}
=e^{-i2\pi rn/(N/2)}
=W_{N/2}^{rn}
$$

Every second row of the original $N$-point DFT therefore contains exactly the same exponential coefficients as an $N/2$-point DFT.

Substituting this into our equation:

$$
\boxed{
X[2r]=\sum_{n=0}^{N/2-1}a[n]W_{N/2}^{rn}
}
$$

**We have just rewritten all the even-indexed outputs of our original DFT as a single DFT of half the size!**


<!-- Even frequency indices -->
<iframe
  src="./content/misc_math/DFT/dft_even_rows_to_4point.html"
  width="100%"
  height="1120"
  scrolling="no"
  loading="lazy"
  title="Even Frequency DFT Decomposition"
  style="display:block;border:none;border-radius:12px;">
</iframe>

<!-- Odd frequency indices -->
<iframe
  src="./content/misc_math/DFT/dft_odd_rows_to_4point.html"
  width="100%"
  height="1120"
  scrolling="no"
  loading="lazy"
  title="Odd Frequency DFT Decomposition"
  style="display:block;border:none;border-radius:12px;">
</iframe>


### Odd Frequency Indices

Now consider the odd rows, where $k=2r+1$.

Since $(-1)^{2r+1}=-1$:

$$
X[2r+1]=
\sum_{n=0}^{N/2-1}
\left(x[n]-x[n+N/2]\right)W_N^{(2r+1)n}
$$

Unlike the even case, our exponential coefficients don't immediately match those of an $N/2$-point DFT.

However, we can split the exponent:

$$
W_N^{(2r+1)n}
=W_N^{2rn}W_N^n
=W_{N/2}^{rn}W_N^n
$$

Substituting:

$$
X[2r+1]=
\sum_{n=0}^{N/2-1}
\left(x[n]-x[n+N/2]\right)
W_N^nW_{N/2}^{rn}
$$

Notice that $W_N^n$ depends only on the sample index $n$, not on the frequency index $r$.

This means we can include it in another new input sequence:

$$
b[n]=\left(x[n]-x[n+N/2]\right)W_N^n,
\qquad 0\le n<N/2
$$

Giving:

$$
\boxed{
X[2r+1]=\sum_{n=0}^{N/2-1}b[n]W_{N/2}^{rn}
}
$$

Once again, we have arrived at the definition of an $N/2$-point DFT!

The only difference is that our new input is formed by taking the pairwise differences of the original samples and multiplying them by an additional complex exponential, $W_N^n$. These additional rotations are commonly called **twiddle factors**.

### Putting the Two Halves Together

Let's summarize what we have discovered.

Starting with an original input sequence of length $N$, we construct two new sequences, each containing $N/2$ elements:

$$
\boxed{
\begin{aligned}
a[n]&=x[n]+x[n+N/2]\\[4pt]
b[n]&=\left(x[n]-x[n+N/2]\right)W_N^n
\end{aligned}
\qquad 0\le n<N/2
}
$$

Then, instead of evaluating one $N$-point DFT, we evaluate two independent $N/2$-point DFTs:

$$
\boxed{
\begin{aligned}
X[2r]&=\operatorname{DFT}_{N/2}(a)[r]\\[4pt]
X[2r+1]&=\operatorname{DFT}_{N/2}(b)[r]
\end{aligned}
\qquad 0\le r<N/2
}
$$

The first produces all the even-indexed frequency outputs, while the second produces all the odd-indexed outputs.

<!-- 
<iframe
 src="./content/misc_math/DFT/dft_two_half_dfts.html"
 width="100%"
 height="1050"
 scrolling="no"
 loading="lazy"
 title="DFT Divide and Conquer Visualization"
 style="display:block;width:100%;border:none;overflow:hidden;border-radius:12px;margin:20px 0;">
</iframe>
-->

For example, an eight-point DFT can be evaluated by forming four pairwise sums and four twiddle-weighted differences, then evaluating two four-point DFTs.

But here is the most important observation: **these two smaller problems are themselves DFTs.**

There is nothing stopping us from applying exactly the same procedure to each one.

Each four-point DFT can be divided into two two-point DFTs, and each two-point DFT can be divided into two one-point DFTs.

Rather than independently computing each frequency output, we have discovered a way to recursively divide a large DFT into smaller DFTs.

This approach is known as the **radix-2 Decimation-in-Frequency Fast Fourier Transform (FFT)**.

<iframe
 src="./content/misc_math/DFT/dft_8_to_4.html"
 width="100%"
 height="1000"
 scrolling="no"
 loading="lazy"
 title="Recursive DFT Matrix Decomposition"
 style="display:block;border:0;width:100%;overflow:hidden;border-radius:12px;margin:20px 0;">
</iframe>

The key difference from our previous optimizations is that we are no longer simply reusing individual matrix entries. We are reusing the structure of the entire computation.

As we'll see next, this recursive structure is what reduces the computational complexity from $O(N^2)$ to $O(N\log_2 N)$.


















































## Combining the Two Optimizations

From here on it's convenient to name the basic rotation. Let

$$W_N=e^{-i\frac{2\pi}{N}}$$

so that every entry of the matrix is just a power of it:

$$F_N[k,n]=W_N^{kn}$$

Now let's actually use the second optimization in the sum. Split the DFT into the first and second halves of the input:

$$X[k]=\sum_{n=0}^{N-1}x[n]e^{-i\frac{2\pi kn}{N}}
=\sum_{n=0}^{N/2-1}x[n]W_N^{kn}+\sum_{n=0}^{N/2-1}x\left[n+\tfrac N2\right]W_N^{k(n+N/2)}$$

The second optimization tells us $W_N^{k(n+N/2)}=(-1)^kW_N^{kn}$, so both sums use the same left-half coefficients and we can factor them out:

$$X[k]=\sum_{n=0}^{N/2-1} W_N^{kn}\left(x[n]+(-1)^kx\left[n+\tfrac N2\right]\right)$$

The $(-1)^k$ term accounts for the sign flipping on odd rows. So we iterate through the first and second half of our input array, adding the two elements for even indexes and subtracting them for odd ones, (which creates a new array of $\frac{N}{2}$ values) and only then matrix multiply against the left half of the exponential matrix row. That is $N/2$ multiply-and-accumulates per output instead of $N$.

put a visualization here that takes the input matrix does hte split and creates a new matrix which is then shown to be multiplied by the first half of the exponential matrix's kth rows elements.

Now stack the first optimization on top: we only need the outputs $k=0$ to $N/2$, and the rest come from flipping imaginary signs. Together, the coefficients we multiply by lie in the left $N/2$ columns and the first $N/2+1$ rows. This is **slightly more than** the top-left quarter because the Nyquist row $k=N/2$ is also required.


Here is the combined view. Start by selecting a cell in the top-left region and watch its related coefficients appear by either conjugation, a half-row sign flip, or both. The extra Nyquist row ($k=N/2$) is included because it is self-conjugate and must be computed separately.

<iframe
 src="./content/misc_math/DFT/dft_combined_symmetry.html"
 width="100%"
 height="850"
 scrolling="no"
 loading="lazy"
 title="DFT Matrix Combined Symmetry"
 style="display:block;width:100%;border:none;overflow:hidden;border-radius:12px;margin:20px 0;">
</iframe>

```py
def dft_half_half(x):
    N = len(x)          # assumes N is even
    H = N // 2
    X = [0j] * N

    # Left half gives the right half: fold the input once
    s_even = [x[n] + x[n + H] for n in range(H)]   # even k: right half is a copy
    s_odd  = [x[n] - x[n + H] for n in range(H)]   # odd k: right half is negated

    # Top half of the rows, left half of the columns
    for k in range(H + 1):
        s = s_even if k % 2 == 0 else s_odd
        for n in range(H):
            angle = -2 * pi * k * n / N
            X[k] += s[n] * exp(1j * angle)

    # Bottom half: flip the sign of the imaginary part
    for k in range(1, H):
        X[N - k] = complex(X[k].real, -X[k].imag)

    return X
```
This costs $N$ additions and subtractions to fold the input, about $\frac N2\left(\frac N2+1\right)\approx\frac{N^2}{4}$ multiply-and-accumulates, and $\frac N2-1$ sign flips: roughly a quarter of the work we started with. But a quarter of $N^2$ is still $O(N^2)$.

So far we have only removed redundancy within the matrix, and each $X[k]$ is still computed on its own. To do better we have to look at what different frequencies share with each other, and the fold above already hints at it.





# Radix-2 FFT

## Divide and Conquer

So far, we have seen that the DFT matrix contains a significant amount of symmetry. Many of its entries are either identical, negatives, or complex conjugates of other entries.

We used these symmetries to reduce the number of distinct complex exponential coefficients we need to evaluate. However, even after eliminating these redundant coefficients, we still have to compute matrix multiply aka the weighted sums that produce each DFT output.

Can we use these same symmetries to reduce the number of operations needed to compute the sums themselves?

Recall our original DFT equation:

$$X[k]=\sum_{n=0}^{N-1}x[n]W_N^{kn}$$
where
$$W_N=e^{-i2\pi/N}$$

We previously divided the DFT matrix into four quadrants by separating both the frequency index $k$ and the sample index $n$ into two halves.

Let's revisit the left and right halves of the matrix. We know that for even $N$:

$$W_N^{k(n+N/2)}=(-1)^kW_N^{kn}$$

This means the right half of each row is either identical to or the negative of the left half, depending on whether $k$ is even or odd.

Using this identity, we can split our original sum into two halves:

$$X[k]=\sum_{n=0}^{N/2-1}x[n]W_N^{kn}+
\sum_{n=0}^{N/2-1}x[n+N/2]W_N^{k(n+N/2)}$$

Substituting our symmetry relation and combining the sums gives:

$$\boxed{X[k]=\sum_{n=0}^{N/2-1}\left(x[n]+(-1)^kx[n+N/2]\right)W_N^{kn}}$$

We have now reduced the length of the sum from $N$ terms to $N/2$ terms, but we have introduced an addition or subtraction between pairs of input samples.

The important observation is that $(-1)^k$ has only two possible values. Rather than treating every frequency index independently, let's separate the outputs into even and odd frequencies.

### Even frequency indices

For even values of $k$, write $k=2r$, where $r=0,1,\ldots,N/2-1$.

Since $(-1)^{2r}=1$, our equation becomes:

$$X[2r]=\sum_{n=0}^{N/2-1}\left(x[n]+x[n+N/2]\right)W_N^{2rn}$$

Now notice something interesting about the exponential coefficient:

$$
W_N^{2rn}
=e^{-i2\pi(2rn)/N}
=e^{-i2\pi rn/(N/2)}
=W_{N/2}^{rn}.
$$

In other words, **every second frequency row of the original $N$-point DFT uses exactly the same exponential coefficients as a DFT of size $N/2$.**

Define a new sequence containing the pairwise sums of our original input:

$$a[n]=x[n]+x[n+N/2],\qquad 0\le n\le \frac{N}{2}-1$$
Then:
$$\boxed{X[2r]=\sum_{n=0}^{N/2-1}a[n]W_{N/2}^{rn}}$$

But this is simply the definition of a DFT, except now it has only $N/2$ inputs! We can therefore compute all even-indexed outputs of our original DFT using one half-sized DFT.

### Odd frequency indices

Now consider the odd rows, where $k=2r+1$.

Since $(-1)^{2r+1}=-1$:

$$X[2r+1]=\sum_{n=0}^{N/2-1}\left(x[n]-x[n+N/2]\right)W_N^{(2r+1)n}$$

Unlike the even case, our exponential coefficient does not immediately look like an $N/2$-point DFT coefficient.

However, we can split its exponent:
$$W_N^{(2r+1)n}=W_N^{2rn}W_N^n=W_{N/2}^{rn}W_N^n$$

Substituting this back into the sum:

$$
X[2r+1]=
\sum_{n=0}^{N/2-1}
\left(x[n]-x[n+N/2]\right)
W_N^nW_{N/2}^{rn}.
$$

Notice that $W_N^n$ depends only on the sample index $n$, not on the frequency index $r$.

This means we can include it in another new input sequence:

$$b[n]=\left(x[n]-x[n+N/2]\right)W_N^n \qquad 0\le n\le \frac{N}{2}-1$$

Giving:

$$
\boxed{
X[2r+1]=\sum_{n=0}^{N/2-1}b[n]W_{N/2}^{rn}
}
$$

Once again, we have arrived at the definition of an $N/2$-point DFT!

The only difference is that our new input is formed by taking the pairwise differences of the original samples and multiplying them by an additional complex exponential, $W_N^n$. These additional rotations are commonly called **twiddle factors**.


<iframe
  src="content/misc_math/DFT/dft_two_half_dfts.html"
  width="100%"
  height="1050"
  style="border: none; border-radius: 12px;"
  title="DFT Divide and Conquer Visualization"
  loading="lazy"
></iframe>


### Putting the two halves together

We can now express our entire original DFT as two smaller DFTs:

$$
\boxed{
\begin{aligned}
a[n] &= x[n]+x[n+N/2],\\[4pt]
b[n] &= \left(x[n]-x[n+N/2]\right)W_N^n,\\[8pt]
X[2r] &= \operatorname{DFT}_{N/2}(a)[r],\\[4pt]
X[2r+1] &= \operatorname{DFT}_{N/2}(b)[r].
\end{aligned}
}
$$

Here, both $n$ and $r$ range from $0$ to $N/2-1$.

We started with a single DFT containing $N$ samples. By exploiting the relationship between the left and right halves of its matrix, we have rewritten it as **two independent DFTs, each containing only $N/2$ samples**.

For example, an eight-point DFT can be evaluated by first forming four pairwise sums and four twiddle-weighted differences, then computing two four-point DFTs. The first produces the even-indexed frequency outputs, and the second produces the odd-indexed outputs.

There is one particularly important distinction here: we are not simply removing redundant entries from the original matrix. We have reorganized the computation into smaller problems that have exactly the same mathematical structure as the original.

And since these two smaller problems are themselves DFTs, there is nothing stopping us from applying the exact same procedure again.

Each four-point DFT can become two two-point DFTs. Each two-point DFT can become two one-point DFTs.

Rather than computing every output independently, we have discovered a **recursive divide-and-conquer algorithm**.

This is the central idea behind the radix-2 *Decimation-in-Frequency Fast Fourier Transform* (FFT).

Next, let's examine how repeatedly dividing the problem changes its computational complexity from $O(N^2)$ to $O(N\log_2 N)$.

<iframe
 src="./content/misc_math/DFT/dft_8_to_4.html"
 width="100%"
 height="1000"
 scrolling="no"
 loading="lazy"
 title="Recursive DFT Matrix Decomposition"
 style="display:block; border:0; width:100%; overflow:hidden; border-radius:12px;">
 </iframe>









































































# Algorithm

Now that we have defined the DFT and it's inputs lets get into the more computational side of things and implementation.

First, lets do a quick recap of the terms and equations we will be using as building blocks for our code.

## Index of Terms

DFT and IDFT:

$$
\boxed{
X[k]=\sum_{n=0}^{N-1}x[n]e^{-i\frac{2\pi kn}{N}}
\qquad
x[n]=\frac{1}{N}\sum_{k=0}^{N-1}X[k]e^{i\frac{2\pi kn}{N}}

}
$$

Where
- $T$ - Total observation duration
- $N$ Number of sampled points
- $n$ - Sample index, $0\le n<N$
- $k$ - DFT frequency index, $0\le k<N$
- $\Delta t$ - Time interval between samples
- $f_s$ - Sampling frequency, in samples per second
- $f_{\max}$ - Highest frequency present in a band-limited signal
- $f_N$ - Nyquist frequency
- $\Delta f$ - Spacing between adjacent DFT frequency bins
- $\omega_k$ - Angular frequency of the $k$th frequency bin
- $x[n]$ - Original signal sampled at index $n$
- $X[k]$ - Complex Fourier coefficient at index $k$

The main relationships are:

$$\boxed{\Delta t=\frac{T}{N}}$$
$$\boxed{f_s=\frac{1}{\Delta t}=\frac{N}{T}}$$
$$\boxed{f_N=\frac{f_s}{2}=\frac{N}{2T}}$$
$$\boxed{\Delta f=\frac{1}{T}=\frac{f_s}{N}}$$
$$\boxed{\omega_k=2\pi\frac{k}{T}=\frac{2\pi kf_s}{N}}$$


## Pseudocode

I will give the pseudocode in Python and in C++ in a collapsible section.

```py
# x = [x1, x2, ... xn]
def dft(x):
    N = len(x)      # Input length
    X = [0j] * N    # Empty list of imaginary numbers of size N

    for k in range(N):
        for n in range(N):
            angle = -2 * pi * k * n / N    # Exponent term
            X[k] += x[n] * exp(1j * angle) # Summation

    return X
```


This is it, the outer loops iterates over the $N$ frequency bins and the inner loops computes and sums up the contribution of every input samples towards that $k$th frequency.

This gives a time complexity of $O(N^2)$ which is not great.

To put that into perspective if we were to evaluate a recording sampled at 44.1kHz ie 44,100 samples every second for a duration of ten seconds it would require $(44100 * 10)^2$ complex multiply and accumulate operations. This would take in the ballpark of 15 seconds to compute on a 2015-ish iPhone. (kind of a weird metric but I just thought of a device that many people today might have had experience using). This might not seem too bad but since the computation is quadratic time, for a 3 minute long signal, the time jumps to over an hour.

## View through the matrix

If we look at the DFT we see that the exponential term does not depend on a specific sampled value $x[n]$ only on size $N$.

$$e^{-i\frac{2\pi kn}{N}}$$

so we can precompute these values for each $k$ and store them in an $N \times N$ matrix $F_N$, which is nice because we can perform multiply and summation by matrix multiplying the matrix with the samples.

Ex. $N = 4$

$$
F_4 =
\begin{bmatrix}
e^{-i\frac{2\pi(0)(0)}{4}} & e^{-i\frac{2\pi(0)(1)}{4}} & e^{-i\frac{2\pi(0)(2)}{4}} & e^{-i\frac{2\pi(0)(3)}{4}} \\
e^{-i\frac{2\pi(1)(0)}{4}} & e^{-i\frac{2\pi(1)(1)}{4}} & e^{-i\frac{2\pi(1)(2)}{4}} & e^{-i\frac{2\pi(1)(3)}{4}} \\
e^{-i\frac{2\pi(2)(0)}{4}} & e^{-i\frac{2\pi(2)(1)}{4}} & e^{-i\frac{2\pi(2)(2)}{4}} & e^{-i\frac{2\pi(2)(3)}{4}} \\
e^{-i\frac{2\pi(3)(0)}{4}} & e^{-i\frac{2\pi(3)(1)}{4}} & e^{-i\frac{2\pi(3)(2)}{4}} & e^{-i\frac{2\pi(3)(3)}{4}}
\end{bmatrix}
=
\begin{bmatrix}
1 & 1 & 1 & 1 \\
1 & -i & -1 & i \\
1 & -1 & 1 & -1 \\
1 & i & -1 & -i
\end{bmatrix}
$$

So we can compute the output by matrix multiplying this matrix by a column vector of samples:

$$\mathbf{X} = F_N \mathbf{x}$$

Ex:

$$ 
\mathbf{X} =
\begin{bmatrix}
1 & 1 & 1 & 1 \\
1 & -i & -1 & i \\
1 & -1 & 1 & -1 \\
1 & i & -1 & -i
\end{bmatrix} 

\begin{bmatrix}
x[0] \\
x[1] \\
x[2] \\
x[3]
\end{bmatrix} 
$$

Here is a visualization of the exponential term matrix for different values of $N$:

<iframe
  src="./content/misc_math/DFT/dft_matrix_vectors.html"
  width="100%"
  height="850"
  scrolling="no"
  loading="lazy"
  title="DFT Matrix Complex Vector Visualizer"
  style="
    display: block;
    width: 100%;
    border: none;
    overflow: hidden;
    border-radius: 12px;
    margin: 20px 0;
  ">
</iframe>

Here are some noteworthy observations about the exponential matrix:

1. The entire first row ($k=0$) and first column ($n=0$) evaluate to $e^0=1$, regardless of the size of $N$.

2. For $k=1$, each successive value advances by an angle of $-2\pi/N$ around the complex unit circle. It therefore takes exactly $N$ steps to complete one full rotation.

3. For any row $k$, the angular step between consecutive values is $k$ times the angular step of row $k=1$:

   $$\Delta\theta_k=-\frac{2\pi k}{N}$$

   Note that the magnitude of every vector remains 1; only its direction changes. The number of distinct values in row $k$ is $N/\gcd(k,N)$ for $k>0$. Consequently, some rows complete their rotations and begin repeating before reaching $N$ steps.

4. When $N$ is even, the row $k=N/2$ corresponds to the Nyquist frequency. Its values alternate between $1$ and $-1$:

   $$e^{-i\frac{2\pi(N/2)n}{N}}=e^{-i\pi n}=(-1)^n$$

   When $N$ is odd, there is no row corresponding exactly to the Nyquist frequency.

5. Rows $k$ and $N-k$ are complex conjugates of each other:

    $$\boxed{F_N[N-k,n]=\overline{F_N[k,n]}}$$

   Geometrically, their vectors are reflected across the real axis of the complex plane. Their real components are identical, while their imaginary components have opposite signs. This symmetry exists for every $N$.

6. The matrix is symmetric along its main diagonal because multiplication is commutative:
    $$F_N[k,n]=F_N[n,k]$$

7. The size and factorization of $N$ affect the repetition patterns within the matrix. For example, when $N=7$ (prime), every nonzero row visits all seven distinct roots of unity before repeating. When $N=6$ (composite), some rows repeat after fewer than six steps.


## First Optimization: Conjugate Symmetry (top half gives us second half)

As we have seen in the sampling section and in the matrix one above: rows $k$ and $N-k$ are complex conjugates of each other:

$$\boxed{F_N[N-k,n]=\overline{F_N[k,n]}}$$

It's worth being precise about what taking a conjugate actually costs us. For a complex number $z=a+ib$, its conjugate is

$$\overline{z}=\overline{a+ib}=a-ib$$

Geometrically this reflects the vector across the real (x) axis and computationally it means flipping the sign of the imaginary part. So instead of having to calculate all $N$ terms we can just calculate the first $0$ to $N/2$ terms and conjugate to get the remaining $floor(N/2)$ terms for free.

Below is the same exponential matrix as before. Toggle cells by clicking, or hold and drag across the grid to toggle several at once. Every cell that can be read off a toggled one by flipping its imaginary sign lights up. Try "Select top half" to see the whole matrix fill in, and notice that row $0$ (and row $N/2$ when $N$ is even) are their own mirror images, which is why they have to be computed.

<iframe
 src="./content/misc_math/DFT/dft_conjugate_symmetry.html"
 width="100%"
 height="1000"
 scrolling="no"
 loading="lazy"
 title="DFT Matrix Conjugate Symmetry"
 style="
 display: block;
 width: 100%;
 border: none;
 overflow: hidden;
 border-radius: 12px;
 margin: 20px 0;
 ">
 </iframe>


```py
def dft_conj(x):
    N = len(x)
    X = [0j] * N

    # Calculate only the top half (nonnegative frequencies)
    for k in range(N // 2 + 1):
        for n in range(N):
            angle = -2 * pi * k * n / N
            X[k] += x[n] * exp(1j * angle)

    # Bottom half: flip the sign of the imaginary part
    for k in range(1, (N - 1) // 2 + 1):
        X[N - k] = complex(X[k].real, -X[k].imag) # conjugate

    return X

```

This means that for even $N$ the number of summation terms decreases from $N^2$ to $N(\frac{N}{2}+1)$ plus a sign flip for each of the $\frac{N}{2} - 1$ terms. Note, that while this improved our computation by a constant factor the asymptotic complexity is still $O(N^2)$ and this only works for real-valued input signals as complex sequences do not have this conjugate symmetry. (For our focus of signal processing this is fine as we will be working with real valued signals.)

## Second Optimization: Loop Symmetry (The left half gives us the right half)


The first optimization split the matrix horizontally. A crucial symmetry appears when we instead compare the first half of a row of the DFT matrix to the second half.

Recall that

$$F_N[k,n]=e^{-i\frac{2\pi kn}{N}}$$

Now compare the entry in column $n$ with the entry in column $n+\frac N2$:

$$
F_N\left[k,n+\frac N2\right]
=
e^{-i\frac{2\pi k(n+N/2)}{N}}
=
e^{-i\frac{2\pi kn}{N}}e^{-i\pi k}
=
(-1)^kF_N[k,n]
$$

Therefore:

- if $k$ is even, then
  $$
  F_N\left[k,n+\frac N2\right]=F_N[k,n]
  $$
- if $k$ is odd, then
  $$
  F_N\left[k,n+\frac N2\right]=-F_N[k,n]
  $$

We can understand this property geometrically by remembering that each element of our DFT matrix is an $N$th root of unity raised to some integer power, representing a rotation around the complex unit circle.

For a fixed row $k$, moving from column $n$ to column $n+\frac N2$ advances the rotation by

$$\Delta\theta=-\frac{2\pi k}{N}\frac N2=-\pi k.$$

In other words, moving halfway across a row corresponds to making $k$ half clockwise revolutions around the unit circle or equivalently $k/2$ full rotations. (This is a property we already stated as .2 and .3 when we observed hte exponential matrix initially)

- **When $k$ is even**, $k/2$ is an integer, so we complete an integer number of full revolutions and return to exactly the same position. Therefore, the corresponding complex values are identical.
- **When $k$ is odd**, $k/2$ is a half-integer, so after completing some number of full revolutions, we have an additional half-revolution ($\pi$ radians) remaining. This places us on the opposite side of the unit circle, giving us the negative of the original complex value.

For example, when $k=2$, moving halfway across the row produces one complete revolution ($2\pi$), whereas for $k=3$, it produces one and a half revolutions ($3\pi$).

This explains why the second half of every row is either a copy or the negation of its first half. The symmetry is a direct consequence of the periodicity of complex rotations, and as we'll see next, it allows us to combine pairs of input samples using additions and subtractions rather than calculating every contribution independently.

Computationally this sign flip is just a negation, this time of both complex parts, $-(a+ib) = -a-ib$, which is a half-turn around the origin.

Here is the matrix again, this time split down the middle. Toggling a cell (or dragging across several) lights up its partner half a row away: marked $=$ when $k$ is even and $-$ when $k$ is odd. "Select left half" shows the left half alone determines the whole matrix.

<iframe
 src="./content/misc_math/DFT/dft_sign_flip.html"
 width="100%"
 height="1020"
 scrolling="no"
 loading="lazy"
 title="DFT Matrix Left Half Gives the Right Half"
 style="
 display: block;
 width: 100%;
 border: none;
 overflow: hidden;
 border-radius: 12px;
 margin: 20px 0;
 ">
 </iframe>






## Combining the Two Optimizations

From here on it's convenient to name the basic rotation. Let

$$W_N=e^{-i\frac{2\pi}{N}}$$

so that every entry of the matrix is just a power of it:

$$F_N[k,n]=W_N^{kn}$$

Now let's actually use the second optimization in the sum. Split the DFT into the first and second halves of the input:

$$X[k]=\sum_{n=0}^{N/2-1}x[n]W_N^{kn}+\sum_{n=0}^{N/2-1}x\left[n+\tfrac N2\right]W_N^{k(n+N/2)}$$

The second optimization tells us $W_N^{k(n+N/2)}=(-1)^kW_N^{kn}$, so both sums use the same left-half coefficients and we can factor them out:

$$X[k]=\sum_{n=0}^{N/2-1} W_N^{kn}\left(x[n]+(-1)^kx\left[n+\tfrac N2\right]\right)$$

The $(-1)^k$ term accounts for the sign flipping on odd rows. So we first fold the input in half, adding the two halves for even $k$ and subtracting them for odd $k$, and only then multiply against the left half of the row. That is $N/2$ multiply-and-accumulates per output instead of $N$.

Now stack the first optimization on top: we only need the outputs $k=0$ to $N/2$, and the rest come from flipping imaginary signs. Together, the only part of the matrix we ever multiply by is the top-left quarter: the top half of the rows and the left half of the columns.

```py
def dft_half_half(x):
    N = len(x)          # assumes N is even
    H = N // 2
    X = [0j] * N

    # Left half gives the right half: fold the input once
    s_even = [x[n] + x[n + H] for n in range(H)]   # even k: right half is a copy
    s_odd  = [x[n] - x[n + H] for n in range(H)]   # odd k: right half is negated

    # Top half of the rows, left half of the columns
    for k in range(H + 1):
        s = s_even if k % 2 == 0 else s_odd
        for n in range(H):
            angle = -2 * pi * k * n / N
            X[k] += s[n] * exp(1j * angle)

    # Bottom half: flip the sign of the imaginary part
    for k in range(1, H):
        X[N - k] = complex(X[k].real, -X[k].imag)

    return X
```
This costs $N$ additions and subtractions to fold the input, about $\frac N2\left(\frac N2+1\right)\approx\frac{N^2}{4}$ multiply-and-accumulates, and $\frac N2-1$ sign flips: roughly a quarter of the work we started with. But a quarter of $N^2$ is still $O(N^2)$.

So far we have only removed redundancy within the matrix, and each $X[k]$ is still computed on its own. To do better we have to look at what different frequencies share with each other, and the fold above already hints at it.





# Radix-2 FFT

## Divide and Conquer

Keeping this flip-flopping sign in mind, let's see how it can be used to divide and conquer the computation at the heart of the DFT:

$$X[k]=\sum_{n=0}^{N-1}x[n]W_N^{kn}=\sum_{n=0}^{N/2-1} W_N^{kn}\left(x[n]+(-1)^kx\left[n+\tfrac N2\right]\right)$$

Notice that the folded input only depends on whether $k$ is even or odd, namely:

$$
\begin{aligned}
k \text{ even: }\quad & s_e[n] = x[n]+x[n+N/2] \\
k \text{ odd: }\quad & s_o[n] = x[n]-x[n+N/2]
\end{aligned}
$$

are the only two computations we need to do on the input, for all $N$ rows. (These are exactly the s_even and s_odd lists in dft_half_half.)

Here is the amazing part!

<iframe
 src="./content/misc_math/DFT/dft_8_to_4.html"
 width="100%"
 height="1000"
 scrolling="no"
 loading="lazy"
 title="Recursive DFT Matrix Decomposition"
 style="display:block; border:0; width:100%; overflow:hidden; border-radius:12px;">
 </iframe>


