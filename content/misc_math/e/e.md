# e

# Intro

If our discussion of [imaginary numbers](article.html?slug=\misc_math\Imaginary%20Numbers\Imaginary%20Numbers) was spurred on by asking what number can you multiply by itself to get a negative number, then our discussion of Euler's number $e$ should be motivated by asking: what number can be used as the base of an exponential function so that the rate of change of that function is equal to the function itself?

In other words, if we have a function of the form
$$a^x$$
where $x$ can now be any real number, what value of $a$ makes the rate of change of this expression equal to the expression itself?
More succinctly, using the language of calculus, what value of $a$ satisfies:
$$\frac{d}{dx}a^x = a^x$$  

# Derivation 

To get a better view of the problem, let us crack open the derivative using its limit definition:

$$\frac{d}{dx}a^x = \lim_{h\to 0}\frac{a^{x+h}-a^x}{h}$$

Using the law $a^{x+h}=a^x a^h$, this becomes

$$\frac{d}{dx}a^x=\lim_{h\to 0}\frac{a^x a^h-a^x}{h}=
a^x\lim_{h\to 0}\frac{a^h-1}{h}$$

So the derivative of $a^x$ is always of the form
$$\frac{d}{dx}a^x=
\left(\lim_{h\to 0}\frac{a^h-1}{h}\right)a^x
$$

In other words, the derivative of an exponential function is proportional to itself and special number $e$ we are looking for is the unique base for which this constant of proportionality is exactly $1$.
In other words since we are looking for:

$$\frac{d}{dx}a^x = a^x = \left(\lim_{h\to 0}\frac{a^h-1}{h}\right)a^x$$
then we are looking for the value of $a$ which satisfies:
$$\left(\lim_{h\to 0}\frac{a^h-1}{h}\right) = 1$$ 

So let us give this constant a name. Define
$$L(a) = \lim_{h\to 0}\frac{a^h-1}{h}$$
Then the derivative of any exponential function can be written as
$$\frac{d}{dx}a^x = L(a)\,a^x$$

This tells us that every exponential function is proportional to its own derivative. The only thing that changes from one base to another is the constant of proportionality.

For one base, the derivative might be twice as large as the function.
For another base, it might be half as large.
And for one very special base, the constant of proportionality will be exactly $1$. That is the base we are looking for. So we define Euler's number $e$ to be the unique positive number such that
$$L(e)=\lim_{h\to 0}\frac{e^h-1}{h}=1$$
With this choice of base, the derivative becomes
$$\frac{d}{dx}e^x = e^x$$

## The natural logarithm appears

Since the quantity
$$
\lim_{h\to 0}\frac{a^h-1}{h}
$$
depends only on the base $a$, it is natural to give it a standard name. We call it the **natural logarithm** of $a$:
$$\ln(a) = \lim_{h\to 0}\frac{a^h-1}{h}$$
So the derivative formula for a general exponential becomes
$$\frac{d}{dx}a^x = \ln(a)\,a^x$$

This formula contains the previous special case automatically, because when $a=e$ we have
$$\ln(e)=1$$
and therefore
$$\frac{d}{dx}e^x = e^x$$

So in a sense, the number $e$ is the base that makes exponential growth look as simple and natural as possible.

## Why is there only one such number?

At this point we should ask: why does such a number even exist, and why is it unique? Intuitively, if we increase the base $a$, then the function $a^x$ grows more rapidly, so its derivative should also become larger. That means the constant
$$L(a)=\lim_{h\to 0}\frac{a^h-1}{h}$$
should increase as $a$ increases.

For example:
- if $a$ is close to $1$, then $a^x$ changes very slowly, so $L(a)$ is small
- if $a$ is large, then $a^x$ changes very quickly, so $L(a)$ is large

So as we vary the base continuously, the proportionality constant also varies continuously. Somewhere between the "too small" bases and the "too large" bases, there must be one special base for which the constant is exactly $1$.That base is $e$. Numerically, it turns out that
$$e \approx 2.718281828\ldots$$

## Another way to see $e$

We can also rewrite the defining condition
$$\lim_{h\to 0}\frac{e^h-1}{h}=1$$
in a way that gives a more concrete formula for $e$.
Write
$$e^h = 1+h+\text{smaller terms}$$
when $h$ is very small. In other words, near $h=0$, the function $e^h$ behaves approximately like a line of slope $1$.

Now let
$$h = \frac{1}{n}$$
for very large $n$. Then
$$e^{1/n} \approx 1+\frac{1}{n}$$
If we raise both sides to the $n$th power, we get
$$e \approx \left(1+\frac{1}{n}\right)^n$$
and in the limit this becomes the famous formula
$$e = \lim_{n\to\infty}\left(1+\frac{1}{n}\right)^n$$

So $e$ can also be understood as the limiting value of repeatedly applying a tiny growth factor.

## Interpretation

This is why $e$ appears whenever growth is continuously proportional to the current amount.

If the amount of something changes at a rate equal to how much of it is currently present, then the quantity is described by
$$f(x)=Ce^x$$
for some constant $C$.

This is why $e$ shows up in:
- population growth
- radioactive decay
- continuously compounded interest
- heat flow
- probability
- differential equations
- and many other places across mathematics and physics

The number $e$ is not just an arbitrary constant. It is the unique base that turns exponential growth into a function that is its own derivative.

## Final perspective

Imaginary numbers came from asking for a number whose square is negative.
Euler's number comes from asking for an exponential function whose rate of change is equal to itself.
In both cases, we start with a simple question that the familiar number system does not answer naturally. And in both cases, following that question carefully leads to a new mathematical object with surprisingly deep structure.
For imaginary numbers, that new object opens the door to rotations and complex numbers.
For Euler's number, it opens the door to continuous growth, logarithms, and the mathematics of change itself.

In the next article on Euler's formula (add link here) we will establish the relationship between complex numbers and $e$. 
