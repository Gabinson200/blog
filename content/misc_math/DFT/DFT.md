
The goal of this article is to further explore the Fourier Transform and understand its application after discretization into the Discrete Fourier Transform (DFT).

The main sections will be:
- [Fourier Series to the Fourier transform](#Fourier-Series-to-the-Fourier-transform)
    - [Functions of any period](#Functions-of-any-period)
    - [Functions of infinite period](#Functions-of-infinite-period)
    - [Analysis equation outputs](#Analysis-equation-outputs)
- [Discretization](#Discretization)
- [Functional Interpretation](#Functional-Interpretation)
- [DFT output interpretation](#DFT-output-interpretation)
- [Use cases](#Use-cases)
- [Pseudocode](#Pseudocode)


# Fourier Series to the Fourier transform

From the previous article on [Fourier series / transform](article.html?slug=\misc_math\Fourier\Fourier), we determined that functions / signals can be decomposed into a sum of exponential terms that really just encode rotations (see [Euler's formula](article.html?slug=\misc_math\Euler's%20Formula\Euler's%20Formula)), scaled by how much our signal "resonates" or aligns with each complex exponential in function space.

## Functions of any period

<div class="formula-box">

For a function $f(x)$ with period $T = 2\pi$
$$
f(x)=\sum_{k=-\infty}^{\infty}c_k e^{ikx}\tag*{$k \in \mathbb{Z}$} 
$$ 

where

$$c_k=\frac{1}{2\pi}\int_{-\pi}^{\pi}f(x)e^{-ikx}dx$$

</div>


Since the basic functions $\sin x$, $\cos x$, and $e^{ix}$ complete one full cycle over $2\pi$ radians, we must scale their angular frequency so that the fundamental basis function completes exactly one cycle over an interval of length $T$.
$$\omega_0 T = 2\pi$$

This gives us the fundamental angular frequency
$$\boxed{\omega_0 = \frac{2\pi}{T}}$$

The higher-frequency basis functions are then integer multiples of this fundamental frequency:
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

Notice that the Fourier index $k$ is still an integer. Changing the period does not change the set of integers we sample. Instead, it changes the frequency represented by each integer.

Ok, so now we can compute functions with any period $T$, but the Fourier series still assumes that the function is periodic: a finite interval of length $T$ is repeated indefinitely.

What happens when we simply make the period go to infinity?

## Functions of infinite period

First lets rewrite the Fourier series to a form where we can easily see the effect of letting $T\to\infty$.

We notice that for the kth-frequency and the (k+1)th-frequency
$$\omega_k=k\frac{2\pi}{T}, \qquad \omega_{(k+1)}=(k+1)\frac{2\pi}{T}$$

The difference: $\omega_{(k+1)} - \omega_k$ is $\Delta\omega = \frac{2\pi}{T} = \omega_0$

we can rewrite
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

Thus, the Fourier series represents a periodic function using a countably infinite set of discrete frequencies, while the Fourier transform represents a non-periodic function using a continuous, uncountable range of frequencies.


Lets derive this algebraically keeping in mind that as $T \to \infty \qquad \Delta \omega \to 0$.

Lets define:

$$\widehat f_T(\omega)=\int_{-T/2}^{T/2}f(u)e^{-i\omega u}du$$

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
which is a transformation from one whole function to another, and
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


# Analysis equation outputs

Lets dive deeper into what the output of the analysis equation:
$$\widehat f(\omega)=\int_{-\infty}^{\infty}f(x)e^{-i\omega x}dx$$
tells us about the frequency $\omega$ in the function $f(x)$.


## Complex Scalars

When we take the Fourier transform, $e^{-i\omega x}$ is complex-valued, which can be explicitly seen by rewriting it using Euler's formula:

$$e^{-i\omega x}=\cos(\omega x)-i\sin(\omega x)$$

Substituting this into the Fourier transform gives

$$\widehat f(\omega)=\int_{-\infty}^{\infty}f(x)\left(\cos(\omega x)-i\sin(\omega x)\right)dx$$

Distributing the integral gives

$$\widehat f(\omega)=\int_{-\infty}^{\infty}f(x)\cos(\omega x)dx-i\int_{-\infty}^{\infty}f(x)\sin(\omega x)dx$$

Therefore,

$$\operatorname{Re}\left(\widehat f(\omega)\right)=\int_{-\infty}^{\infty}f(x)\cos(\omega x)dx$$

and

$$\operatorname{Im}\left(\widehat f(\omega)\right)=-\int_{-\infty}^{\infty}f(x)\sin(\omega x)dx$$

If we took the inner product of the function with just sine or cosine, we would get a real scalar measuring alignment with that basis function. The Fourier transform performs both measurements at once: the inner product with cosine gives the real part of the complex number, while the negative of the inner product with sine gives the imaginary part.

Thus, the complex Fourier coefficient simply packages two real measurements together:

$$\boxed{\widehat f(\omega)=\text{cosine alignment}-i,\text{sine alignment}}$$

We'll next see how these two measurements tell us the magnitude and phase of a sinusoidal component.

## Why Sine and Cosine Encode Phase

Suppose our signal contains a phase-shifted cosine wave:

$$f(t)=A\cos(\omega_0t+\phi)$$

Using the angle addition identity,

$$\cos(\alpha+\beta)=\cos(\alpha)\cos(\beta)-\sin(\alpha)\sin(\beta)$$

we get

$$\cos(\omega_0t+\phi)=\cos(\omega_0t)\cos(\phi)-\sin(\omega_0t)\sin(\phi)$$

Therefore,

$$f(t)=A\cos(\phi)\cos(\omega_0t)-A\sin(\phi)\sin(\omega_0t)$$

This shows that a phase-shifted cosine can always be represented as a scaled but unshifted combination of cosine and sine at the same frequency.

The coefficient of the cosine component is

$$C=A\cos(\phi),$$

while the coefficient of the sine component is

$$S=-A\sin(\phi)$$

These two values can be interpreted as coordinates in a two-dimensional plane associated with the frequency $\omega_0$:

$$(C,S)=\left(A\cos\phi,-A\sin\phi\right)$$

Changing the phase $\phi$ changes how much of the signal lies along the cosine direction and how much lies along the sine direction.
For example,
$$\cos(\omega t)=1\cdot\cos(\omega t)+0\cdot\sin(\omega t)$$
has coordinates
$$(1,0).$$

A phase shift of $\pi/4$ gives
$$\cos\left(\omega t+\frac{\pi}{4}\right)=\frac{\sqrt2}{2}\cos(\omega t)-\frac{\sqrt2}{2}\sin(\omega t)$$
with coordinates
$$\left(\frac{\sqrt2}{2},-\frac{\sqrt2}{2}\right).$$

A phase shift of $\pi/2$ gives
$$\cos\left(\omega t+\frac{\pi}{2}\right)=-\sin(\omega t)$$
with coordinates
$$(0,-1).$$

As the phase changes, these cosine and sine coefficients rotate around clockwise in a two-dimensional plane.

However, recall that the imaginary part of the Fourier transform is the **negative** of the sine alignment:

$$\operatorname{Im}\left(\widehat f(\omega)\right)=-\int_{-\infty}^{\infty}f(t)\sin(\omega t)dt$$

For our phase-shifted cosine,

$$f(t)=A\cos(\omega_0t+\phi),$$

the cosine and sine components are proportional to

$$A\cos(\phi)$$

and

$$-A\sin(\phi),$$

respectively. Since the Fourier transform negates the sine alignment, the real and imaginary components of the Fourier coefficient at the positive frequency $\omega_0$ are proportional to

$$\operatorname{Re}\left(\widehat f(\omega_0)\right)\propto A\cos(\phi)$$

and

$$\operatorname{Im}\left(\widehat f(\omega_0)\right)\propto A\sin(\phi).$$

Therefore, the resulting complex coefficient has the form

$$z\propto A\cos(\phi)+iA\sin(\phi).$$

Using Euler's formula,

$$e^{i\phi}=\cos(\phi)+i\sin(\phi),$$

we can rewrite this as

$$z\propto Ae^{i\phi}.$$

This is the connection we were looking for. The real and imaginary parts of the Fourier coefficient act as two coordinates,

$$(A\cos\phi,A\sin\phi),$$

whose positions depends on the phase $\phi$.

The magnitude of this vector is

$$|z|\propto\sqrt{A^2\cos^2\phi+A^2\sin^2\phi}=A,$$

up to the scaling introduced by the particular Fourier transform or DFT normalization.

Its angle is

$$\arg(z)=\operatorname{atan2}\left(A\sin\phi,A\cos\phi\right)=\phi.$$

So the Fourier transform's complex output can be interpreted geometrically as a vector in the complex plane:

$$\boxed{\widehat f(\omega)=\text{magnitude}\times e^{i\,\text{phase}}}$$

The distance of the coefficient from the origin tells us how strongly that frequency is present, while its angle tells us the phase of that frequency component.

Notice that the coefficient does not generally lie on the unit circle. Its magnitude depends on how strongly the frequency is present. Dividing by its magnitude,

$$\frac{\widehat f(\omega)}{|\widehat f(\omega)|}=e^{i\phi},$$

removes the magnitude information and leaves a point on the unit circle whose angle encodes only the phase.

Therefore, when we query the Fourier transform at a frequency $\omega_0$, the frequency itself is already known: it is the input $\omega_0$. The complex number returned by the transform then gives us the two remaining pieces of information about that frequency component:

$$\boxed{
\omega_0
\quad\longrightarrow\quad
\widehat f(\omega_0)
=
\text{magnitude and phase at }\omega_0
}
$$

## Recovering Amplitude

The length of the coefficient vector is

$$\sqrt{C^2+S^2}$$

Substituting $C=A\cos\phi$ and $S=-A\sin\phi$ gives

$$\sqrt{A^2\cos^2\phi+A^2\sin^2\phi}$$

and since

$$\cos^2\phi+\sin^2\phi=1,$$

we get

$$\boxed{\sqrt{C^2+S^2}=A}$$

so the length of the coefficient vector recovers the amplitude.

Recovering Phase

Since

$$C=A\cos\phi$$

and

$$S=-A\sin\phi,$$

we have

$$\frac{-S}{C}=\frac{A\sin\phi}{A\cos\phi}=\tan\phi$$

Therefore,

$$\phi=\operatorname{atan2}(-S,C)$$

The phase is therefore encoded by the direction of the vector formed by the cosine and sine coefficients.

This explains why the Fourier transform needs both measurements. A single cosine or sine measurement cannot uniquely determine phase, but the pair of measurements can determine both amplitude and phase.

## Complex Numbers Package These Two Coordinates

Instead of carrying around two separate real numbers, we can package the cosine and sine coordinates into a single complex number.

A complex number

$$z=a+ib$$

can be interpreted geometrically as the two-dimensional vector

$$(a,b).$$

The same number can be written in polar form,

$$z=re^{i\phi},$$

where

$$r=|z|=\sqrt{a^2+b^2}$$

and

$$\phi=\arg(z)=\operatorname{atan2}(b,a)$$

Euler's formula makes the relationship explicit:

$$re^{i\phi}=r\cos\phi+ir\sin\phi$$

So a complex number naturally stores the same two pieces of information: its magnitude gives the length of the coefficient vector, while its argument gives the angle of the coefficient vector.

This is why complex numbers are especially convenient in Fourier analysis: one complex number can represent both magnitude and phase information associated with a frequency.

Interpreting the Fourier Transform Output

Let's say that we have some function $f(t)$ in the time domain that represents a signal over time. We evaluate its Fourier transform at a specific frequency $\omega_0$:

$$\widehat f(\omega_0)=\int_{-\infty}^{\infty}f(t)e^{-i\omega_0t}dt$$

Suppose this evaluates to some complex number

$$z=\widehat f(\omega_0)=a+ib$$

This complex number tells us something about the presence of the frequency $\omega_0$ in our signal. It is important to note that the frequency is not recovered from the complex number. The frequency $\omega_0$ is the input that we used to query the Fourier transform.

The complex output $z$ contains the magnitude and phase information associated with that frequency.

We can convert the complex number from Cartesian form,

$$z=a+ib$$

into polar form,

$$z=re^{i\phi}$$

where

$$r=|z|=\sqrt{a^2+b^2}$$

and

$$\phi=\arg(z)=\operatorname{atan2}(b,a)$$

Therefore,

$$\widehat f(\omega_0)=\left|\widehat f(\omega_0)\right|e^{i\arg\left(\widehat f(\omega_0)\right)}$$

Magnitude

The magnitude of the Fourier coefficient is

$$\left|\widehat f(\omega_0)\right|=\sqrt{\operatorname{Re}\left(\widehat f(\omega_0)\right)^2+\operatorname{Im}\left(\widehat f(\omega_0)\right)^2}$$

Geometrically, the real and imaginary parts form the horizontal and vertical components of a vector in the complex plane, while the magnitude is the length of that vector.

The magnitude tells us how strongly the signal aligns with a sinusoidal component at the queried frequency $\omega_0$. A large magnitude means that the frequency is strongly present in the signal, while a small magnitude means that little of the frequency is present.

The function

$$\left|\widehat f(\omega)\right|$$

is called the magnitude spectrum.

Technically, the magnitude of the continuous Fourier transform is a spectral magnitude and is not always directly equal to the amplitude of a sinusoid in the original time-domain signal. The exact relationship depends on the Fourier-transform normalization, the duration of the signal, and whether we are working with a continuous or discrete transform.

When we introduce the DFT, we will be able to give a more direct formula for recovering the amplitude of a sampled sinusoid.

Frequency

The frequency is simply the value used to query the Fourier-transform function:

$$\omega_0$$

Therefore, the Fourier transform answers the question:

How strongly does the signal align with a complex exponential rotating at angular frequency $\omega_0$, and with what phase?

If $\omega_0$ is measured in radians per second, then the corresponding ordinary frequency in cycles per second, or hertz, is

$$f_0=\frac{\omega_0}{2\pi}$$

Phase

The phase information associated with the frequency $\omega_0$ is contained in the angle of the complex Fourier coefficient:

$$\phi=\arg\left(\widehat f(\omega_0)\right)$$

Equivalently, if

$$\widehat f(\omega_0)=a+ib$$

then

$$\phi=\operatorname{atan2}(b,a)$$

Geometrically, this angle describes the direction of the coefficient vector in the cosine / sine plane.

The exact sign of the phase depends on the Fourier-transform convention being used. Here we use $e^{-i\omega t}$ for the analysis transform. For a real-valued signal, positive and negative frequencies occur as complex-conjugate pairs, so the two corresponding coefficients carry opposite phase angles.

Overall, the way to interpret the Fourier-transform output is that

$$\boxed{\widehat f(\omega_0)\text{ contains the magnitude and phase information associated with the queried frequency }\omega_0}$$

while $\omega_0$ itself is the frequency we chose to query.

One subtlety is that an ideal sinusoid which continues forever does not have a regular finite-valued Fourier transform. Instead, its Fourier transform is described using Dirac delta distributions. We will avoid getting too sidetracked by this for now and return to finite sampled signals when introducing the DFT.

DFT

In real life, we might not know the underlying continuous function which produces a signal, so directly integrating it to produce $\widehat f(\omega)$ may not be possible.

Instead, we usually have a finite number of measurements sampled from the signal at regular time intervals:

$$x[0],x[1],x[2],\ldots,x[N-1]$$

The Discrete Fourier Transform replaces the continuous Fourier-transform integral with a finite sum and evaluates the signal at a finite collection of discrete frequency bins.

This gives us a finite collection of Fourier coefficients rather than a continuous function of frequency. Each DFT output has the same basic interpretation developed above:

$$\boxed{\text{frequency bin}\quad\longrightarrow\quad\text{complex coefficient containing magnitude and phase}}$$

Before looking at how the FFT computes these coefficients more efficiently, we first need to understand the mathematical structure of the DFT itself.

Polynomial Duality
Symmetry
FFT
