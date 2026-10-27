
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

The Fourier Series statest that a periodic function $f(x)$ with period $T = 2\pi$ can be reconstructed as an infinite sum of weighted exponentials:

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

As $T$ increases, these discrete frequencies become more and more densely packed. For example, if you compare two periodic functions with periods $2\pi$ and $6\pi$ you would still need infinitelly many  samples ($k$) to reconstruct them, the difference is the spacing between frequency samples ($\omega_k$); for a period of $6\pi$, samples of $\omega_k$ will be 3 times closer together then for a period $2\pi$. As $T$ goes to infinity $\Delta\omega$ approaches zero, so the discrete frequency grid becomes continuous and we replace the sum over discrete frequencies with an integral over all real angular frequencies $\omega$.

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

Plugging in $f(t)$ into the Fourier analysis equation basically performs an inner product between the phase shifted input function $f(x)$ and a cosine / sine function giving us the real and imaginary parts of the output respectivelly.


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

packadging it as: 
$$z\propto Ae^{i\phi}.$$


The main takeaway is that taking the forward Fourier transform of an equation takes the inner product of that equation with respect to the basis functions sine and cosine and when we querry a frequency from the resulting analysis equation we get a complex number that packadges information into a complex number. The real and imaginary parts of the complex number encode phase since they are proportional to $A \cos(\phi)$ and $A \sin(\phi)$ respectivelly.

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

A cool geometric visualization of the output is, that as we querry different frequencies $\omega$ in $\widehat f(\omega)$ we plot those points in the complex plain which will produce points at different angles from the real line depending on phase and different radii from the origin depending on amplitude. This creates a rubber band like visualization for funky input functions that we will program in the implementation section of this article.

Put a promo picture here:


## Recap

Ok, just to birefly recap, thus far we have taken the Fourier Series, let it's period extend to infinity which allowed us to derive the forward and backward Fourier Transform. With these transforms we can \**akhem caughs\** transform, a function of position or time into a function of frequency and then back to its original domain by integrating it (taking the inner product) with $e^{i \omega x}$. Lastly we looked at what features of an input function influence the output of the analysis equation, namely how the phase and magnitude of a function determine the complex output.

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
$$x[n]=f(n\Delta t)$$

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

The only difference is the factor $\Delta t$ outside the sum, which accounts for the time interval represented by each sample when approximating the continuous integral. It is important to distinguish between increasing the number of samples and increasing the duration of the observed signal.

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

This means that frequency indices $k$ and $k+N$ produce exactly the same exponential values at every sample index $n$. Gemoetrically, this is due to completing a full rotation around the imganiary unit circle and ending up where we started.

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

(This section could be very long and I will likely make some articles about sampling and connect it to information theory to get the Nyquist sampling rate but for now I'll take that as a given and only introduce some language and notation that will later be useful in the FFT sampling approach)


The next question is: Given, we are interested in the phase and magnitude of a frequency $\omega_k$ in a signal, how many points do we need to sample from the signal for the DFT to be able to provide the desired output for the frequency component.

First, lets impose a simplifying assumption that the signal which we are decomposing is made up of a finite set of component frequencies. In other words the Fourier transform of the signal is zero outside some finite frequency range. When this is the case the signal is said to be **band-limited**. Then we can suppose that there is a maximum frequency component $f_{max}$ which is the maximum frequency present in our signal. 

So how many samples do we need to take to have enough "granularity" to find $f_{max}$ with the DFT?

Intuitivelly, when we look at a signal or function with a high frequency we see that the signal moves or oscillates more frequently, and to capture all these changes in the signal we will need to sample more points.  

Suppose we have a simple cosine function with frequency $f_0$.

$$f(t) = \cos(2\pi f_0 t)$$

Then lets sample this signal at a frequency $f_s$ called the sampling frequency
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

for integer $n$. This is somewhat analogous to a palindrome where there the same letters on either side of a middle letter make up a word. Ex, MADAM has middle letter "D" and then letters "A" and "M" from the middle out. (Here is a fun math palindrome "NEVER ODD OR EVEN".) 

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

I will give the pseudocode in Python and in C++ in a collapsable section.

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

To put that into perspective if we were to evaluate a recording sampled at 44.1kHz ie 44,100 samples every second for a duration of ten seconds it would require $(44100 * 10)^2$ complex multiply and accumulate operations. This would take in the ballpark of 15 seconds to compute on a 2015-ish iPhone. (kind of a weird metric but I just thought of a device that many people today might have had experience using). This might not seem to bad but since the computation is quadratic time, for a 3 minute long signal, the time jumps to over an hour.

## View through the matrix

If we look at the DFT we see that the exponential term does not depend on a specific sampled value $x[n]$ only on size $N$.

$$e^{-i\frac{2\pi kn}{N}}$$

so we can precompute these values for each $k$ and store them in an $N \times N$ matrix $F_N$, which is nice because we can perform summation by matrix multiplying the matrix with the samples.

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



