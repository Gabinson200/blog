
## Ambiguity of Points

Given some points, lets say $p_1$ and $p_2$ in some dimension $D$ performing algebraic functions on them such as addition is dependent on the reference frame we use to index the position of the points. We often use the origin $O^D$ (the $D$ dimensional point where all values are 0) as a reference point from which we index the location of our points, but the points themselves do not encode this information about the basis explicitly. As an analog imagine you and your friend are looking out at some physical landmark in the distance from two different viewpoints, you may describe the same object referencing different nearby landmarks. i.e. "the house left of the large tree" or "the house to the right of the highway". Both "points" reference the same object but since the two viewer's reference frames are different they are described in different terms. 

## Vector as a mathematical object

As we have seen we can choose an arbitrary $D$ dimensional point, such as the canonical origin $O$, as our frame of reference from which we can index our points from. The distance from this reference point to any other point we wish to describe can be thought of as an arrow starting at our shared reference point in the direction of / pointing to any point we wish to describe, this arrow is called a **vector**.  The vector can start from any arbitrary point defining its origin $o$ which may be, but is not limited to, the canonical origin $O$. For example, a 2D vector starting at the origin, of the form $<1, 1>$ will point to a point indexed as $(1, 1)$ in our global space but a vector of the same form with origin $o$  at say $(-4, -4)$ will point to the point $(-3, -3)$ in our global space. Furthermore, vectors as a mathematical object are independent of the basis in which they are defined, they can be defined in different basis but are not explicitly confined to one way of expressing them. This is somewhat of an abstract concept that helps to generalize the use of vectors but obfuscates their definition, since many times the term vector is used to describe the expression of a vector as a mathematical object in a certain basis. 

> **Maps of the World**: Humans have a tendency to think of themselves as the center of the universe, an inclination which also extends to groups of people. If you look at the 2D maps of the world in textbooks worldwide you may find wildly varying versions. In some textbooks the center of the page may align with Africa or is centered around the Atlantic Ocean, in other representations the Pacific Ocean is used as a central point making Asia the visually dominating element on the map. Where we define our small case origin $o$ to be changes the location of the continents on the map and informs / reframes our view of the entire globe. Additionally, the basis (latitudes and longitudes or polar coordinates) and the measurement systems used to define distances (kilometers, miles, nautical miles) changes the way in which we describe a vector in that basis. In other words, a vector as a mathematical object can be use to defined arbitrary visual centers or origins on the map from which we can define points from but does not inform the actual values those vectors will take in different basis. The same vector pointing from the middle of the Atlantic towards Europe will take on different values based on if we are measuring distance in kilometers or miles. 

I hope the above example demonstrated the generality of vectors and why we might want to use them as our fundamental geometric object going fromward. Indeed, vectors can be thought of not just as arrows, but as: coordinates, numbers, multivectors, functions, linear transformations, etc.. Asking for a singular definition of a vector is like asking for a definition of a number. All that is important, is that vectors can be used as mathematical objects similar to numbers which we can use to perform mathematical operations on. 

## Properties of vectors

A vector can be defined in terms of 2 attributes:
- **Length**: sometimes called magnitude or norm.
- **Direction**: The orientation of vector in space.
We can see that a vector does not depend on where it is placed in space or in other words unless you scale or rotate a vector two vectors of the same form but starting at different points in space describe the same vector. 

>A lot of confusion about vectors stems from their generality and how they are applied in other fields such as physics. For example, a displacement vector often used to describe motion in physics is only determined by its magnitude and direction meaning that it is translation invariant. However, a position vector that is used to describe the position of a point in space with respect to some origin is not position invariant since the value of the vector changes depending on the origin of the coordinate system it is defined in. 

For our upcoming objective of defining operations on vectors we can think of vectors as arrows that are translation invariant. I will express vectors as letters in notation usually in terms of $u$, $v$, and $w$. 

The next article is [[Algebra of Vectors]]

