# Euler's Formula

Now that we know about imaginary / complex numbers and Euler's number $e$ lets derive the famous Euler's Formula. The main concepts to keep in mind going in, is that repeated application of $i$ results in 90 degree rotations and that an exponential function with base $e$ has the special property that its rate of change is equal to itself. 

Algebraically we can state:
$$\frac{d}{dx}e^x = e^x$$
and in general:
$$\frac{d}{dx}e^{ax} = ae^{ax}$$

So if we now set $a=i$ then if we differentiate we will get a multiplication by $i$:
$$\frac{d}{dx}e^{ix} = ie^{ix}$$

Geometrically this means that at every point of the function $f(x) = e^{ix}$ its derivative or "velocity" (direction and magnitude) is equal to itself but with a 90 degree rotation in the complex plane. Thus the velocity of $f(x)$ is always perpendicular to its position vector, which is the definition of a perfect circular motion. Additionally, since $e^{i*0} = e^0 = 1$ the initial position is $1$ on the complex plane.

So to recap, simply from the initial position and change in the function $f(x)=e^{ix}$:
$$f'(x) = if(x)$$
$$f(0)=1$$

We find a geometric behavior which is equivalent to 
$$cos(x) + isin(x)$$

Thus: 
$$\bigstar e^{ix} = cos(x) + isin(x) \bigstar$$





