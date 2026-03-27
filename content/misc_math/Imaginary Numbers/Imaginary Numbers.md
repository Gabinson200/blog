In this article I want to explore the definition, interpretation, and uses of imaginary numbers.

I will be a little pedantic here (though not fully mathematically rigorous), because I think it is fun to build things up from the very bottom.

## Repeated addition vs. repeated multiplication

Let us start by looking at addition as an operation, and equivalently subtraction, since subtraction is just addition of a negative number.

The property of addition that I want to point out is that if you keep adding the same number to itself, the sign does not alternate. If $x$ is positive, then

$$x + x + x + \cdots + x = nx$$

will always be positive for $n > 0\$. If $x$ is negative, then it will always be negative.

In other words, repeated self-addition; that is, multiplication by a positive integer, does not produce any sign-flipping behavior.

Now let us ask whether the same is true for repeated multiplication:

$$x \cdot x \cdot x \cdot x \cdots x = x^n$$

If $x$ is positive, then repeated multiplication also never flips the sign. But if $x$ is negative, something more interesting happens:

- when $n$ is odd, $x^n$ is negative
- when $n$ is even, $x^n$ is positive

So unlike repeated addition, repeated multiplication of a negative number causes the sign to alternate depending on the parity of the exponent.

That is the first strange behavior I want to highlight: raising a negative number to higher and higher powers does not simply "stay negative" or "stay positive" it alternates.

## When can powers reach negative numbers?

Suppose I want to find a number that, when multiplied by itself, gives some constant:

$$x^2 = c$$

where $x$ is the number we are trying to find and $c$ is just some constant.

If $c$ is positive, then this is no problem: both a positive and a negative real number can square to it. For example,

$$x^2 = 9 \quad\Rightarrow\quad x = \pm 3$$

But if $c$ is negative, then no real number works, because squaring any real number always gives a nonnegative result.

More generally, if we raise a real number to some integer power $p$, then a negative target value is only reachable when $p$ is odd. For example:
- $x^3 = -8$ has the real solution $x = -2$
- $x^2 = -8$ has no real solution

We can summarize the behavior of real numbers under powers like this:

- for odd powers, a real number can be positive or negative:
  $$a^{2k+1} \in \mathbb{R}$$
  and its sign depends on the sign of $a$

- for even powers, a real number is always nonnegative:
  $$a^{2k} \ge 0$$

So if the exponent is even, we can never reach a negative real number using only real inputs.

## Introducing the imaginary unit

This motivates the introduction of a new kind of number. Historically, this was motivated by the fact that an $n$th degree polynomial must have at least $n$ number of zeroes or number of times it crosses the x-axis. We define the imaginary unit $i$ by the rule

$$i^2 = -1$$
or equivalently,
$$i = \sqrt{-1}$$

Of course, this does **not** mean that $i$ is a real number. It means we are extending the number system so that an object with this property exists.

Once we do this, equations like
$$x^2 = -1$$
suddenly have a solution:
$$x = \pm i$$

And more generally,
$$x^2 = -c \quad\text{for } c>0$$
has solutions
$$x = \pm i\sqrt{c}$$

## What does multiplying by $i$ do?

If we take a real number $b$ and multiply it by $i$, we get
$$bi$$
which is called an imaginary number.

At this stage, we do not yet know what imaginary numbers "are" or how they relate to real numbers, only that they are numbers outside the real line, and that they let us solve equations that were previously unsolvable in the reals.

You can think of this as extending the real number line into a new direction. Multiplying a real number by $i$ sends it off the ordinary real axis and onto this new imaginary axis.

So larger and smaller values of $b$ give correspondingly larger and smaller imaginary numbers:

$$\ldots, -2i, -i, 0, i, 2i, \ldots$$



## Powers of imaginary numbers

Now let us see how imaginary numbers behave under repeated multiplication. Starting from the definition
$$i^2 = -1$$
we get
$$i^3 = i^2 \cdot i = -i$$
and
$$i^4 = i^2 \cdot i^2 = (-1)(-1)=1$$

So the powers of $i$ cycle:
$$i,\quad -1,\quad -i,\quad 1,\quad i,\quad -1,\quad \ldots$$

In other words,
- odd powers of $i$ stay imaginary
- even powers of $i$ become real

More specifically,
$$i^{2k} = \pm 1$$
and
$$i^{2k+1} = \pm i$$

If we instead raise an entire imaginary number $bi$ to a power, we get
$$(bi)^n = b^n i^n$$
so the same pattern still holds:
- if $n$ is even, $(bi)^n$ is real
- if $n$ is odd, $(bi)^n$ is imaginary

This is already very different from ordinary real numbers. Repeated multiplication of real numbers always led to real numbers (but never negative reals) but for imaginary numbers repeated multiplication can lead to both real and imaginary numbers.

## RECAP: Why introduce imaginary numbers at all?

The whole point of introducing imaginary numbers is that they let us solve equations that the real numbers alone cannot solve. For example, in the real numbers the equation $x^2 = -1$ has no solution. But once we extend the number system and define $i$ so that $i^2=-1$, the equation becomes perfectly solvable.

This is the same kind of extension that happened earlier in mathematics:

- the natural numbers were extended to the integers so subtraction always makes sense
- the integers were extended to the rationals so division always makes sense
- the rationals were extended to the reals to handle limits, geometry, and continuity
- the reals are extended to the complex numbers so roots of negative numbers make sense

So imaginary numbers are not some arbitrary trick. They are a natural extension of the number system that fills in a gap left by the real numbers.

However, as we will see, unlike the previous extensions of mathematical objects the introduction of imaginary numbers not only increases the range and "granularity" of our building blocks but also introduces a new dimension.

## Complex Numbers

Ok, so now we know that for real numbers odd powers can reach any real number but even powers can only reach positive numbers AND for imaginary numbers even powers can reach any real numbers but odd powers still remain in the imaginary space.

So lets combine these two types of numbers and see if their combination keeps the favorable attributes of both representations or maybe does not even work. Will the peanut butter taste good with the jelly?

If we "combine" real and imaginary numbers through multiplication 
$$a \cdot bi$$
we will just get a scaled version of the imaginary number which is just another imaginary number. So multiplication is not a useful way to combine the real and imaginary parts into a richer number system, because it immediately collapses back down to something we already had.

Lets try addition:
$$a+bi$$

Hmmm, ok well this does not look great at first, we have a real number $a$ that we are asking to add to an imaginary number $b$, but how can we add two fundamentally different types of numbers that represent quantities of two different mathematical objects?

To get around this we should not view the "+" as an addition operator that adds two similar quantities which can be evaluated to a third final quantity but rather as notation that says "this new mathematical object is one part real and one part imaginary". This is the same idea as in linear algebra when where we use different basis to define coordinate systems.

So we can think of complex numbers as extending our number system from one basis direction to two basis directions. In the real numbers, every number can be written as a multiple of the unit $1$:
$$a = a \cdot 1$$
So in a sense, the real numbers are built from a single basis element, namely $1$.
Complex numbers extend this by introducing a second basis element, $i$. So every complex number can be written as a linear combination of these two basis elements:

$$c = a + bi = a \cdot 1 + b \cdot i$$

This is a very useful way to think about complex numbers. They are not just "weird numbers involving square roots of negatives," but rather objects built from two independent directions:
- the real direction, generated by $1$
- the imaginary direction, generated by $i$

Note, we still do not know the geometric direction of the imaginary basis. We only know that it is a new independent direction generated by $i$. To understand its geometry, we should look at how multiplication by $i$ acts on a general complex number. It turns out that this multiplication behaves exactly like a $90^\circ$ rotation, and from that the perpendicularity of the imaginary axis to the real axis follows naturally.

Note: the crucial difference between complex numbers and linear basis is that complex numbers are not *just* pairs of numbers. They also come with a multiplication rule, inherited from the defining property:
$$i^2 = -1$$
and this rule is what we can use to show that the imaginary axis must be perpendicular to the real axis and that multiplication of complex numbers has a very nice geometric meaning.

### Complex addition

So now we defined imaginary numbers and complex numbers which are one part real and one part imaginary. Now we can start playing around with complex numbers and see how they behave under different operations.

Lets consider addition first.
Adding two complex numbers $c_1 + c_2$:
$$(a_1 + b_1i) + (a_2 + b_2i) = (a_1+a_2) + (b_1+b_2)i$$
In other words complex addition is just element-wise addition, which makes sense since all we can do is add together two mathematical objects of the same type. Similarly, we can add a complex number plus either a real or imaginary number by just adding to the corresponding component in the complex number:
$$a + (a_1 + b_1i) = (a+a_1) + b_1i$$ or
$$bi + (a_1 + b_1i) = a + (b + b_1)i$$

Geometrically, this has the effect of doing vector addition where one complex vector is appended to the end of the other complex vector to produce the final complex coordinate.

### Complex multiplication

Where it gets interesting is when we multiply two complex numbers. First lets consider simply multiplying a complex number by $i$:
$$(a_1 + b_1i) * i = a_1i + b_1i^2 = a_1i - b_1 = -b_1 + a_1i$$ since $i^2 = -1$.

This is interesting, it looks like multiplication by $i$ flips the real and imaginary parts and negates the imaginary part. In other words if we graph the real and imaginary parts as coordinates $(a,b)$, then multiplication by $i$ sends
$$(a,b)\mapsto(-b,a)$$

Now this is not just something that "looks like" a rotation. It is exactly the coordinate rule for a $90^\circ$ counterclockwise rotation in the plane. We can verify this in two ways. First, if we apply it to the point $(1,0)$ on the real axis, we get
$$(1,0) \mapsto (0,1)$$
So the unit real direction is sent to the unit imaginary direction.
Second, the dot product of a vector with its image under multiplication by $i$ is
$$(a,b)\cdot(-b,a) = -ab + ab = 0$$
which means the two vectors are perpendicular.

So multiplication by $i$ rotates every complex number by $90^\circ$. In particular, it sends the real axis to a perpendicular axis. That perpendicular axis is what we call the imaginary axis.

Lets apply another multiplication by $i$:
$$(a_1 + b_1i) * i^2 = a_1i^2 + b_1i^3 = -a_1 - b_1i = (-b_1 + a_1i)*i$$ Geometrically this looks like rotating our original point by $180^\circ$ since $$i^2 * (a, b) \rightarrow (-a, -b)$$ or equivalently adding another $90^\circ$ rotation to our $90^\circ$ offset second point.

Similarly, if we multiply once more by $i$ we will achieve another $90^\circ$ rotation ending up $270^\circ$ from our original point and a subsequent multiplication by $i$ will reset us back to the starting point.

**$\bigstar$** The main takeaway is that by defining $i = \sqrt{-1} \leftrightarrow i^2 = -1$ the powers of $i$ cycle
$$i,\quad -1,\quad -i,\quad 1,\quad i,\quad -1,\quad \ldots$$
in such a way that one cycle takes 4 iterations which is geometrically equivalent to a $90^\circ$ rotation when plotting complex numbers along a real and imaginary axis. 

Furthermore, because multiplication by $i$ sends
$$(1,0)\mapsto(0,1)$$
and more generally sends any vector $(a,b)$ to the perpendicular vector $(-b,a)$, the imaginary axis is naturally perpendicular to the real axis. Applying the transformation twice gives
$$(a,b)\mapsto(-b,a)\mapsto(-a,-b),$$
which is exactly multiplication by $-1$. So the geometric statement "rotate by $90^\circ$ twice" matches the algebraic statement
$$i^2 = -1.$$

So we have done multiplication of a complex number by an imaginary number and saw that it resulted in a rotation, what about a multiplication by a real number?
$$(a_1 + b_1i) * a_2 = a_1a_2 + a_2b_1i$$ 
This just looks like element-wise scaling, meaning that as $a_2$ changes the position of the point $(a_1, b_1)$, that it is applied to, the resulting point grows or shrinks towards the origin.

So it seems that multiplication by an imaginary number results in rotation and multiplication by an real number results in changing the radius of our point from the center. 

In general multiplying two complex numbers results in:
$$(a_1 + b_1i) * (a_2 + b_2i) = a_1a_2 + (a_1b_2 + a_2b_1)i + b_1b_2i^2 = (a_1a_2-b_1b_2) + (a_1b_2 + a_2b_1)i$$

But there is a much more geometric way to understand what is happening.
Every complex number
$$z = a+bi$$
can be viewed as the point $(a,b)$ in the plane. So instead of only thinking of a complex number in terms of its horizontal and vertical components, we can also describe it by:
- its distance from the origin
- its angle from the positive real axis
That is, we can describe the same number using **polar coordinates**.

If $z=a+bi,$ then its distance from the origin is
$$r = |z| = \sqrt{a^2+b^2}$$
and its angle is
$$\theta = \operatorname{atan2}(b,a)$$

So we can rewrite the same complex number as
$$z = r(\cos\theta + i\sin\theta)$$
where
$$a = r\cos\theta,\qquad b = r\sin\theta$$

This is called the **polar form** of a complex number.
This form is important because it makes complex multiplication much easier to interpret geometrically.  
Suppose we have two complex numbers
$$z = r(\cos\theta + i\sin\theta)$$
and
$$w = \rho(\cos\phi + i\sin\phi)$$

Then their product is
$$zw = r(\cos\theta + i\sin\theta)\,\rho(\cos\phi + i\sin\phi)$$

Expanding gives
$$zw =
r\rho\left[
(\cos\theta\cos\phi - \sin\theta\sin\phi)
+
i(\sin\theta\cos\phi + \cos\theta\sin\phi)
\right]
$$

Now use the angle addition identities:
$$\cos(\theta+\phi)=\cos\theta\cos\phi-\sin\theta\sin\phi$$
and
$$\sin(\theta+\phi)=\sin\theta\cos\phi+\cos\theta\sin\phi$$

So the product becomes
$$zw = r\rho\bigl(\cos(\theta+\phi) + i\sin(\theta+\phi)\bigr)$$


Crucially this shows that when two complex numbers are multiplied:
- their magnitudes multiply:
  $$|zw| = |z||w| = r\rho$$
- their angles add:
  $$\arg(zw) = \arg(z) + \arg(w) = \theta + \phi$$

So multiplying by a complex number means doing two things at once:
- scaling by its magnitude
- rotating by its angle

So rather than thinking of the real part $a$ alone as controlling scale and the imaginary part $b$ alone as controlling rotation, it is better to think of the pair $(a,b)$ together as defining a point in the plane. That point has:
- a radius
  $$r=\sqrt{a^2+b^2}$$
- and an angle
  $$\theta=\operatorname{atan2}(b,a)$$

and those two quantities are exactly what determine how multiplication by that complex number acts geometrically.

In particular, multiplying by a **real** number just scales, because a positive real number has angle $0$ and a negative real number has angle $\pi$.

Multiplying by $i$ is the special case
$$i = \cos\frac{\pi}{2} + i\sin\frac{\pi}{2}$$
so it has magnitude $1$ and angle $\frac{\pi}{2}$. That means multiplying by $i$ rotates by $90^\circ$ without changing size.

This matches what we already saw algebraically:
$$(a+bi)i = -b + ai$$
which corresponds to
$$(a,b)\mapsto(-b,a)$$

So the earlier fact that multiplication by $i$ gives a quarter turn is not an isolated trick. It is just one special case of the general rule that complex multiplication adds angles.

### Recap

Ok, so far we have invented an imaginary number that helps us solve equations that have no real solution. We then combined this imaginary number with the real numbers to build complex numbers. Finally, by rewriting a complex number in polar form, we discovered something much deeper:
a complex number is not just a point in the plane, it can also act as a transformation of the plane. Its magnitude tells us how much scaling it applies. Its angle tells us how much rotation it applies.
And when we multiply complex numbers together, those transformations compose naturally:
the lengths multiply and the angles add.

## Rotations

We can now say something very cleanly:
numbers on the **unit circle** correspond exactly to pure rotations.

A complex number of the form
$$u = \cos\theta + i\sin\theta$$
has magnitude $1$, because
$$|u| = \sqrt{\cos^2\theta + \sin^2\theta} = 1$$

So multiplying by $u$ does not change the distance from the origin. It only changes the angle.

That means multiplication by
$$u = \cos\theta + i\sin\theta$$
rotates any complex number by $\theta$.

For example:

- multiplying by
  $$\cos 0 + i\sin 0 = 1$$
  rotates by $0^\circ$

- multiplying by
  $$\cos\frac{\pi}{2} + i\sin\frac{\pi}{2} = i$$
  rotates by $90^\circ$

- multiplying by
  $$\cos\pi + i\sin\pi = -1$$
  rotates by $180^\circ$

- multiplying by
  $$\cos\frac{3\pi}{2} + i\sin\frac{3\pi}{2} = -i$$
  rotates by $270^\circ$

This also explains why the powers of $i$ cycle:
$$i,\quad -1,\quad -i,\quad 1,\quad i,\quad \ldots$$

Each multiplication by $i$ adds another $90^\circ$ of rotation, so after four multiplications we come full circle.

More generally, if
$$z = r(\cos\theta + i\sin\theta),$$
then
$$z^2 = r^2(\cos 2\theta + i\sin 2\theta)$$
$$z^3 = r^3(\cos 3\theta + i\sin 3\theta)$$
and in general
$$z^n = r^n(\cos n\theta + i\sin n\theta)$$

So repeated multiplication by a complex number means repeated scaling and repeated rotation.

## Final perspective

At first imaginary numbers seem artificial: we invent a symbol $i$ so that
$$i^2 = -1$$
just to solve equations like
$$x^2=-1$$

But once we combine real and imaginary numbers into complex numbers and graph them their relationship reveals a similarity with circular geometry.
In general a complex number rotates and scales at the same time.
And multiplying complex numbers composes those transformations automatically, the lengths multiply and the angles add.
So complex numbers are not just an algebraic trick for handling square roots of negative numbers. They are the natural language of planar rotation.

Thus complex numbers will show up naturally in functions wehre we care about "rotating" or "winding" things up.
