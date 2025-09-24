
## Dots

In computer graphics, dot rendering—commonly referred to as pixel rendering—is the process of displaying individual points (pixels) on a screen to form images. Each pixel represents the smallest unit of a digital image and can be assigned a specific color. By controlling the color and position of thousands or millions of pixels, computers can create complex visuals, shapes, and patterns. This fundamental technique underpins everything from simple line drawings to advanced 3D graphics, making pixel manipulation a core concept in graphics programming.
In later articles I may go into the methods and physical hardware used for drawing pixels and possibly explore fun but useless ideas such as sub-pixel rendering and the like. 

## Lines

Straight lines are the next simple building block of graphics programming which can be built from the atomic unit of pixels through the process of [rasterization](https://en.wikipedia.org/wiki/Raster_graphics). The subtle but interesting concept of rasterization is how do we go from an algebraic / geometric definition of a line, in this case, to a representation in pixel coordinates. In this article my goal is to discuss, derive, and program line drawing algorithms starting with DDA algorithm.

> ### First what is a line?
The definition of a line is somewhat tricky as we can approach this  question from both a geometric or set-theoretic point of view but since we are in the domain of computer graphics lets stick to the geometric definition that fits nicely with the atomic unit of pixels.
A line is a set of all points that satisfy a linear equation in $R^n$:
$$r(t) = r_0 + tv, t \in R$$ where $r_0$ is a point in the n-dimensional space and $v$ is a direction vector. Notice that this definition of a line is infinitely long extending forever in n-dimensional space. In the context of computer graphics we will really only be dealing with 2-4 dimensions and when we say lines we really are referring to line segments, that is a part of a line defined by 2 n-dimensional points on that line. With that little aside on lines lets get into the 2D approach.

Given two points in 2D $(x_1, y_1)$ and $(x_2, y_2)$ an equation of a line can be written as $$y = mx+b$$ where b is the intersection with the y-axis and m is the slope $m = \frac{\Delta y}{\Delta x}$ = $\frac{(y_2 - y_1)}{(x_2 - x_1)}$. The trigonometric interpretation is that the change in $x$ and change in $y$ define the side lengths of a right angle triangle $tan(\theta) = \frac{\Delta y}{\Delta x}$ thus $m = tan(\theta)$.

----------------------------------------
  
----------------------------------------

## [Digital Differential Analyzer (DDA) Algorithm](https://en.wikipedia.org/wiki/Digital_differential_analyzer_(graphics_algorithm))

This is conceptually the simples algorithm to start with as it most closely resembles the algebraic definition of a line. The idea behind DDA is for a given line we want to select the pixels on the screen that are closest to the $x$ and $y$ values of the line at a given point on the line, but since pixels are not continuous and have a preset resolution / size we have to consider along which dimension to sample pixels from. There are 3 main types of 2D lines: vertical, horizontal, and diagonal. Approaching the vertical and horizontal cases programmatically we could iterate over the y and x coordinates of a line starting from the bottom or leftmost point respectively and draw a pixel until the end coordinate is reached. For diagonal lines with slope m, our first idea might be to just iterate over the x values between the two points and get the corresponding y values after plugging in the x values into the line equation to get the y coordinates along the line which we can round to "snap" into integer pixel positions. The issue with this approach is if the change in y is greater than the change in x:  
$(y_2 - y_1) > (x_2 - x_1)$ aka the slope $(y_2 - y_1) \div (x_2 - x_1)$ is greater than 1 then we are not sampling enough times in the x dimension to produce enough pixels that will create a continuous line. Sampling in the y dimension when the change in x is greater than the change in y aka the slope is less than 1 will result in the same sub-sampling issue. To solve this issue DDA pick the axes to sample by finding the dimension along which the change is greatest and sampling in that dimension. 

Pseudocode:
```
Input: Two points (x0, y0) and (x1, y1)

Calculate the differences in coordinates:
    Δx = x1 - x0
    Δy = y1 - y0

Determine the number of steps required for the line:
   steps = max(|Δx|, |Δy|)

Handle edge case if the two points are the same:
    if steps == 0:
        plot(x0, y0)
    return

Calculate the increment values:
    xIncrement = Δx / steps
    yIncrement = Δy / steps

Initialize starting point:
    x = x0
    y = y0

For each step from 0 to steps - 1:
    Plot the point (round(x), round(y)) on the grid
    Increment the coordinates:
    x = x + xIncrement
    y = y + yIncrement
```
This algorithm has runtime $O(N)$ where $N=max(∣Δx∣,∣Δy∣)$ = number of pixels you plot.

One positive aspect of this algorithm compared to the upcoming ones is there is no extra tests needed to determine the slope and order of the points. However, the major drawback is that we are using and having to round floating-point values per pixel. This is not as expensive as floating-point division per say but we can do better.

----------------------------------------
  
----------------------------------------


## [Bresenham's line drawing algorithm](https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm)

This algorithm was developed by Jack Elton Bresenham in 1962 while working at IBM and it is notable in that it is one of the earliest line drawing algorithms and that it only requires integer operations making it very economical and attractive to use in low-level architectures.

The central idea behind Bresehham's algorithm is that while sampling in either the x or y dimensions we will end up with floating-point values that represent the line algebraically, and are usually some sub-pixel distance away from the center of pixels to which they should be assigned to. In other words there will be some error in the rasterization process that maps numerical values produced by the line equation to distinct pixel points aka raster. (make raster a special word that shows up in the mind map and has some definition alongside it). Consider the image below, the line starting from $(x_k, y_k)$ travels towards points $(x_{k+1}, y_k)$ and $(x_{k+1}, y_{k+1})$. Please note that the dots really represent the center of pixels. The value of the line at $x_{k+1}$ is some distance $d_1$ away from $(x_{k+1}, y_k)$ and $d_2$ distance away from $(x_{k+1}, y_{k+1})$. Bresenham's algorithm is basically just about selecting the next pixel that minimizes that distance between the line and the chosen pixel.  
![line diff](https://iq.opengenus.org/content/images/2019/03/bresenhams_line_generation.jpg)  
So lets find a rule that tells us depending on $d_1$ and $d_2$ if we should keep the same y value or add one to it preferably with no floating-point arithmetic. This is pretty simple as all we have to do is check if:
$$d_1 - d_2 < 0$$ then stay on the same line, else if
$$d_1 - d_2 > 0$$ then go up in the y direction.

Please note that right now we are going to derive the algorithm when the change in x is greater than change in y aka a shallow slope meaning that we are sampling in the x direction. This means that the algorithms will only work for lines drawn from left to right and only in the first octant, octant 0 in the image below.
![octants](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPY6LAVKsQZ577GcxwYX5kFM8LSQgM6OUrug&s)


Lets go and derive the distances for the if statement:  
Remember the equation for a line is $y=mx+b$ so the value of $y$ at $x_{k+1}$ is $y=m(x_{k+1})+b$ so the distances can be defined as:
$$d_1 = y-y_k = m(x_{k+1})+b - y_k$$ and
$$d_2 = y_{k+1} - y = y_{k+1} - (m(x_{k+1})+b)$$  
Now that we have $d_1$ and $d_2$ lets subtract them to find the rule for the if statement:  
$$d_1 - d_2 = [m(x_{k+1})+b - y_k] - [y_{k+1} - (m(x_{k+1})+b)]$$
$$d_1 - d_2 = m(x_{k+1})+b - y_k - y_{k+1} + (m(x_{k+1})+b)$$
Note that $y_{k+1}$ is literally just $y + 1$ since we are dealing with pixels and same for $x_{k+1}$ so lets rewrite $y_{k+1}$ as $y + 1$ but keep $x_{k+1}$ as is for now since we are iterating over the x-dimension.
$$d_1 - d_2 = m(x_{k+1})+b - y_k - y_k - 1 + (m(x_{k+1})+b)$$  
Thus  
$$d_1 - d_2 = 2mx_{k+1}-2y_k+2b-1$$
This looks good but we still have that pesky slope $m = \frac{\Delta y}{\Delta x}$ in there so lets try to remove that by multiplying both sides of the equation by $\Delta x$
$$\Delta x[d_1 - d_2] = \Delta x[2mx_{k+1}-2y_k+2b-1]$$
$$\Delta x[d_1 - d_2] = \Delta x[2(\frac{\Delta y}{\Delta x})x_{k+1}-2y_k+2b-1]$$
$$\Delta x[d_1 - d_2] = 2\Delta yx_{k+1}-2\Delta xy_k+2\Delta xb-\Delta x$$
Now we will substitute $x + 1$ for $x_{k+1}$
$$\Delta x[d_1 - d_2] = 2\Delta y(x_k+1)-2\Delta x y_k+2\Delta x b-\Delta x$$
$$\Delta x[d_1 - d_2] = 2\Delta y x_k + 2\Delta y -2\Delta x y_k+2\Delta x b -\Delta x$$
rewriting:  
$$\Delta x[d_1 - d_2] = 2\Delta y x_k -2\Delta x y_k + 2\Delta y+2\Delta x b -\Delta x$$
Observe that for the equation above the last 3 terms are a constant since the change in y and change in x for the line are a constant independent of any $x_k$ or $y_k$ terms, thus we can rewrite the equation:
$$\Delta x[d_1 - d_2] = 2\Delta y x_k -2\Delta x y_k$$

Here is the cool part, remember the above equation is just telling us what the difference between $d_1$ and $d_2$ should be so we can decide if we go up one pixel $(y_{next} = y_k + 1)$ or remain in the same row $(y_{next} = y_k)$. In other words the equation above is just a decision variable for our current $x_k$ and $y_k$ values that define the position of a pixel with decision value $P_k$. Similarly we can find the decision parameter for the next pixel $P_{k+1}$ that is defined by $x_k + 1$ and either at $y_k$ or $y_k + 1$ depending on our previous decision. So lets go and subtract $P_k$ from $P_{k+1}$. In the equations below I will write $y_{next}$ to encapsulate the possibility of $y_k$ or $y_k + 1$ depending on our previous decision. Also note that if we are sampling along the x-dimension the change in x between samples will always be 1.

$$P_{k+1}-P_k = [ 2\Delta y x_k+1 -2\Delta x y_{next}] - [ 2\Delta y x_k -2\Delta x y_k]$$
$$P_{k+1}-P_k = 2\Delta y x_k+1 -2\Delta x y_{next} - 2\Delta y x_k + 2\Delta x y_k$$
$$P_{k+1}-P_k = 2\Delta y(x_k+1 - x_k) -2\Delta x (y_{next}- y_k)$$
$$P_{k+1}-P_k = 2\Delta y -2\Delta x (y_{next}- y_k)$$
Now we see that the change in decision value from one pixel to the next is dependent on the change in $y$ and the change in $x$ multiplied by the difference in the next and previus $y$ position. As stated beforehand depending on the previous decision $y_{next}$ could be $y_k$ or $y_k + 1$.

If $y_{next}$ is $y_k$ or in other words we remain on the same y-coordinate between samples of x then $P_{k+1}-P_k$ or the change in P is:
$$P_{k+1}-P_k = 2\Delta y -2\Delta x (y_k - y_k)$$
$$P_{k+1}-P_k = 2\Delta y$$
Thus change in P is $2\Delta y$ meaning:
$$P_{k+1} = P_k + 2\Delta y$$  
  

If $y_{next}$ is $y_k + 1$ or in other words we go up one y-coordinate between samples of x then $P_{k+1}-P_k$ or the change in P is:
$$P_{k+1}-P_k = 2\Delta y -2\Delta x (y_k + 1 - y_k)$$
$$P_{k+1}-P_k = 2\Delta y -2\Delta x $$
Thus change in P is $2\Delta y$ meaning:
$$P_{k+1} = P_k + 2\Delta y -2\Delta x $$ 

Ok so we found how we should update $P_k$ but what should its initial value be?  
$$P_1 = 2\Delta y x_1 -2\Delta x y_1 + 2\Delta y+2\Delta x b -\Delta x$$
substituting $b = y_1 - \frac{\Delta y}{\Delta x}x_1$ we get:
$$P_1 = 2\Delta y x_1 -2\Delta x y_1 + 2\Delta y+2\Delta x [ y_1 - \frac{\Delta y}{\Delta x}x_1] -\Delta x$$
$$P_1 = 2\Delta y x_1 -2\Delta x y_1 + 2\Delta y+2\Delta x y_1 -2\Delta y x_1 -\Delta x + 1$$
$$P_1 = 2\Delta y x_1 -2\Delta x y_1 + 2\Delta y+2\Delta x y_1 -2\Delta y x_1 -\Delta x + 1$$
$$P_1 = 2\Delta y -\Delta x $$

Whheeew that was a lot of funky algebra but the main logical we used is as follows: 
1. We want to find the y position of the pixel that will be the closest to the y position of the line equation sampled at that x coordinate. 
2. To do this we need to find the distance between the line and the two possible points $d_1$ and $d_2$.
3. $$d_1 - d_2 < 0$$ then stay on the same line, else if
$$d_1 - d_2 > 0$$ then go up in the y direction.
4. We then got rid of the slope which turns the algorithm into integer only (yaaaay)
5. We are left with an equation for a decision parameter for the kth point. So to find how to update this parameter from one point to the next we find $P_{k+1}-P_k$.
6. We find the initial value of $P_k$ by substituting in the y-intercept.


```
Bresenham's(x0, y0, x1, y1)
    dx = x1 - x0
    dy = y1 - y0
    D = 2*dy - dx
    y = y0

    for x from x0 to x1
        plot(x, y)
        if D > 0
            y = y + 1
            D = D - 2*dx
        end if
        D = D + 2*dy
```
So much math for such a short program. 
However, note that this code only works with lines drawn in the first octant with a shallow slope, that is a slope less than 1.
We can modify the algorithm to check if $y$ should increase or decrease thus extending our algorithm to cover lines in the 0th and 7th octant. 
We'll call this algorithm plotLineShallow as it is able to handle lines with slope < 1:

```
plotLineShallow(x0, y0, x1, y1)
    dx = x1 - x0
    dy = y1 - y0
    yi = 1
    if dy < 0
        yi = -1
        dy = -dy
    end if
    D = (2 * dy) - dx
    y = y0

    for x from x0 to x1
        plot(x, y)
        if D > 0
            y = y + yi
            D = D - 2*dx
        end if
            D = D + 2*dy
        end if

```
The change in the function is that we check if the change in y is less than 0 and if so we will now decrement the y value so we step downwards if D > 0. Note that the sign of dy is always positive since we want the decision parameter D to accumulate the error over the steps. 

Next, we can handle slopes with magnitude greater than 1 aka steep slopes by simply switching the x and y-axis in the function similar to how we switched the axis of sampling in the DDA algorithm. For shallow slopes the x-axis has more point we can sample and for steep slopes the y-axis has more points to sample.

```
plotLineSteep(x0, y0, x1, y1)
    dx = x1 - x0
    dy = y1 - y0
    xi = 1
    if dx < 0
        xi = -1
        dx = -dx
    end if
    D = (2 * dx) - dy
    x = x0

    for y from y0 to y1
        plot(x, y)
        if D > 0
            x = x + xi
            D = D - 2*dy
        else
            D = D + 2*dx
        end if
```

These two functions now cover the entire right side of a graph ie all lines drawn from left to right. 
To be able to draw in any direction we have to check if $x_1 > x_0$ or $y_1 > y_0$ abd if not we need to flip the order of the points we input to the functions above:

```
plotLine(x0, y0, x1, y1)
    // If shallow slope
    if abs(y1 - y0) < abs(x1 - x0)
        // if drawn from right to left aka on the left side of a graph, flip
        if x0 > x1
            plotLineLow(x1, y1, x0, y0)
        else
            plotLineLow(x0, y0, x1, y1)
        end if
    else // if steep slope
        if y0 > y1 // if drawn from top to bottom, flip
            plotLineHigh(x1, y1, x0, y0)
        else
            plotLineHigh(x0, y0, x1, y1)
        end if
    end if

```

Similar to DDA Bresenham's Line algorithm is also $O(N)$ where $N=max(∣Δx∣,∣Δy∣)$ = number of pixels you plot, but now instead of working with a floating-point slope value we are using an integer based slope error value and working with integer coordinates making the entire algorithm floating-point free. 


## Resources

- [Bresenham's Line Wiki](https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm)
- [great youtube video on Bresenham's Line algorithm derivation](https://www.youtube.com/watch?v=RGB-wlatStc)
- [Bresenham from Helsinki](https://www.cs.helsinki.fi/group/goa/mallinnus/lines/bresenh.html)

## Extra

I'm in the process of writing a small graphics library for my esp32s3 based microcontroller and there I'm using the following combine d. optimized version of Bresenham's lien drawing algorithms:

```c
static inline void IRAM_ATTR _draw_line_solid_fast(uint16_t * __restrict fb, int x0, int y0, int x1, int y1, uint16_t color) {
    // Fast paths: fully horizontal / vertical
    // Horizontal
    if (y0 == y1) {
        if (x1 < x0) { int t=x0; x0=x1; x1=t; } // swap x0 and x1
        uint16_t *p = fb + (size_t)y0 * FB_STRIDE + x0;
        for (int n = x1 - x0; n >= 0; --n) { *p++ = color; }
        return;
    }
    // Vertical
    if (x0 == x1) {
        if (y1 < y0) { int t=y0; y0=y1; y1=t; } // swap y0 and y1
        uint16_t *p = fb + (size_t)y0 * FB_STRIDE + x0;
        for (int n = y1 - y0; n >= 0; --n) { *p = color; p += FB_STRIDE; }
        return;
    }

    // Change in x and y
    int dx = x1 - x0;
    int dy = y1 - y0;
    int sx = 1, sy = 1; // sign of x and y
    // If change in x or y is negative, adjust sign and make delta positive
    if (dx < 0) { dx = -dx; sx = -1; } 
    if (dy < 0) { dy = -dy; sy = -1; }
    dy = -dy;                             // Flip since y grows downward on screen
    int err = dx + dy;

    uint16_t *p = fb + (size_t)y0 * FB_STRIDE + x0;
    const int stepX = sx;                 // ±1 pixel
    const int stepY = sy * FB_STRIDE;     // ±one row
    // Bresenham's main loop
    for (;;) {
        *p = color;
        if (x0 == x1 && y0 == y1) break;
        int e2 = err << 1; // *2
        if (e2 >= dy) { err += dy; x0 += sx; p += stepX; }
        if (e2 <= dx) { err += dx; y0 += sy; p += stepY; }
    }
}

```
