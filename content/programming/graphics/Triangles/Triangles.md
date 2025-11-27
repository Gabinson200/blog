
# Triangles

This page will describe two approaches to creating and filling in triangles for a renderer, namely the scan-fill and Barycentric algorithm. We assume that at this point the reader has an understanding of line-drawing algorithms and interpolation. 

**Triangles**: Are the simples shapes that can define an area in 2D or in other words a flat surface in 3D. 2 points can define a line but 3 points can define an area given, of course, that the points do not fall on the exact same plane which would degenerate to a line or even point. 4 points can define a rectangle but any rectangle can be defined by 2 triangles. Note, to define a rectangle 2 triangles are needed which means we must define 6 points instead of 4 for a rectangle but as we will see later if we know which points are shared between the two triangles we only really need to store 4 points.

---
---

## Scan-fill Algorithm

The idea behind the scan-fill algorithm is simple, given any kind of  triangle we can split it up into two simpler component triangles, ones with a flat-bottom and one with a flat-top that we can fill in by "scanning" across it in the x direction.
![triangle_split](https://miro.medium.com/v2/resize:fit:640/format:webp/1*IyvUvbE2gjgSBMDzaLodNQ.png)
At this point we know that we are working with 2 triangles defined by: p0, p1, pm where p1.y and pm.y are equal and depending on the type of triangle p0.y > p1.y == pm.y (flat bottom) and p0.y < p1.y == pm.y (flat top). To perform this split we first order the vertices of the triangle in ascending order of y position, say we end up with p0, p1, p2 in ascending order of y position. Then the y coordinate of the midpoint (pM) is just the y coordinate of the middle vertex; pM.y = p1.y. But what about the x coordinate of the midpoint? We will have to use linear interpolation to determine the midpoint at which to split. The way I like to think about it is there is a percentage or value between 0 and 1 that tells us how far along we are the y-coordinate at p1, between p0 and p2; or in other words at what fraction of the height of p0 to p2 we have traversed starting from p0 and currently at p1. This can simply be calculated by: 
$$\frac{(y1-y0)}{(y2-y0)}$$
Using this fraction we can multiply it by the length of p0 and p2 in the x dimension to determine how far along the line between p0 and p2, pm should lie. We then add to this the x coordinate of p0 since the previous value was just in relation to the triangle coordinate frame not to the world-frame where the triangle is actually defined in, thus we have the equation:
$$mx = (x2-x0) * \frac{(y1-y0)}{(y2-y0)} + x0$$


**Pseudocode:**
```
p0, p1, p2 = sort_by_ascending_y(p0, p1, p2)
pm.x = (p2.x - p0.x) * ((p1.y - p0.y) / (p2.y - p0.y)) + p0.x
pm.y = p1.y

```
Now we are left with two triangles where two points on each triangle should have the same y coordinates. For the first type of triangle, one with a flat-bottom, we need to find the x-coordinates of each leg as we sweep down from the top of the triangle towards the base so we can use one of our previously discussed line drawing functions to fill in the pixels in that row. This is actually deceptively easy, all we have to do is find the change in x for each leg of the triangle for every step in the y direction, that is the change in x over the change in y or the inverse slope.  
![flatbottom_triangle](https://www.sunshine2k.de/coding/java/TriangleRasterization/flatbottomtriangle.png)  
  
So in the case of the triangle above we have two inverse slopes: 
$$invslope1 = \frac{(v2.x - v1.x)}{(v2.y - v1.y)}$$ and
$$invslope2 = \frac{(v3.x - v1.x)}{(v3.y - v1.y)}$$

Lastly, we just iterate through the y-dimension drawing the horizontal scan-lines at every y position bounded by the two points along the legs of the triangle which always change by their respective inverse slope values. Note that the points are provided to the function in decreasing y order, because I have been referring to the triangle bottoms and tops in the way that the y-coordinates increase from bottom to top but in many graphics domains the origin is at the top left corner meaning the y-coordinates increase towards the bottom.

**Pseudocode:**
```c++
fillFlatBottomTriangle(p0, p1, p2):
    // Calculate inverse slopes
    invslope1 = (p1.x - p0.x) / (p1.y - pp0.y)
    invslope2 = (p2.x - p0.x) / (p2.y - pp0.y)

    // We start at the top of the triangle
    curr_x1 = p0.x
    curr_x2 = p0.x 
                    // or p2.y since they are equal
    for(y = p0.y; y <= p1.y; y++):
        drawLine(curr_x1, y, curr_x2, y)
        curr_x1 -= invslope1
        curr_x2 -= invslope2

```

The flat-top algorithm works the same but now we start at the bottom and work our way up.

```c++
fillFlatTopTriangle(p0, p1, p2):
    // Calculate inverse slopes
    invslope1 = (p2.x - p0.x) / (p2.y - p0.y)
    invslope2 = (p2.x - p1.x) / (p2.y - p1.y)

    // We start at the top of the triangle
    curr_x1 = p2.x
    curr_x2 = p2.x 
                    // or p2.y since they are equal
    for(y = p2.y; y <= p1.y; y++):
        drawLine(curr_x1, y, curr_x2, y)
        curr_x1 += invslope1
        curr_x2 += invslope2

```

Putting it all together we end up with:

```c++
// Increasing y order
p0, p1, p2 = sort_by_ascending_y(p0, p1, p2)

if (p0.y == p1.y):
    // points provided to the functions in decreasing y order
    fillFlatBottomTriangle(p2, p1, p0)
else if(p1.y = p2.y):
    fillFlatTopTriangle(p0, p1, p2)
else:
    pm.x = (p2.x - p0.x) * ((p1.y - p0.y) / (p2.y - p0.y)) + p0.x
    pm.y = p1.y
    fillFlatBottomTriangle(p2, pm, p0)
    fillFlatTopTriangle(p0, pm, p2)
```

The time compexity of this algorithm is just the area of the triangle, $O(A)$ since we use Bresenhams to draw the lines which runs in $O(l)$ where $l$ is the length of the line.   

---
---

## Barycentric Algorithm
I will not go into this because this is not the algorithm I use in my esp32 gfx implementation and I think I will keep the scope of this website more narrow so I can spend time on other things.


**Resources:**
[scan-fill algo](https://www.sunshine2k.de/coding/java/TriangleRasterization/TriangleRasterization.html)

[barycentric algo 1](https://www.scratchapixel.com/lessons/3d-basic-rendering/ray-tracing-rendering-a-triangle/barycentric-coordinates.html)


[barycentric algo interactive](https://www.scratchapixel.com/lessons/3d-basic-rendering/ray-tracing-rendering-a-triangle/barycentric-coordinates.html)
