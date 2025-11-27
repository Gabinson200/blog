
## What is clipping?

Clipping is the process of cutting away parts of geometric objects (points, lines, polygons, etc.) that lie outside a chosen region, usually the view or screen window, so that only the visible portion inside that region is kept and drawn.

## When do we clip?

In 2D (and in 3D after projection), we usually define a **clipping window** or **clipping rectangle**. Anything outside this window is considered not visible and can be discarded. In rendering, clipping saves work and avoids drawing pixels off-screen. In editing operations (delete/copy/move parts of objects), clipping defines which parts of an object are affected.

Clipping can be applied to different primitives:
- Point clipping
- Line clipping
- Area / polygon clipping
- Curve clipping
- Text clipping
- Exterior clipping (everything _outside_ a region instead of inside)

Here we’ll focus on point and line clipping, and then the Cohen–Sutherland line clipping algorithm.

## Point Clipping

Goal: decide whether a point lies inside or outside a rectangular clipping window.
Let the window be defined by $(x_{\min}, y_{\min}, x_{\max}, y_{\max})$ and a point $P = (p_x, p_y)$.
The point is inside the window iff both coordinates are within the ranges:
$$
[  
x_{\min} \le p_x \le x_{\max}  
]
\text{ and }
[  
y_{\min} \le p_y \le y_{\max}  
]
$$
If both inequalities hold, the point is visible; otherwise, it is outside and can be rejected.
This simple test is the building block for more complex clipping, like lines and polygons.

---
---

## Line Clipping

A line segment is defined by its two endpoints: $P_0 = (x_0, y_0)$ and  $P_1 = (x_1, y_1)$
We want to either:
- keep it as is (fully visible),
- discard it entirely (fully invisible), or
- clip it to the window (partially visible).
### Visibility categories

1. **Fully visible line**  
    Both endpoints are inside the window. The entire segment is inside (for a convex rectangular window), so we can draw it unchanged.

2. **Fully invisible line**  
    Both endpoints are outside _and_ the entire segment lies on one side of the window (e.g., completely to the left or below). This can be rejected without computing intersections.

3. **Partially visible line**  
    The line intersects the window. Some portion of the segment lies inside, so we must compute the precise intersection points with the window edges and replace the endpoints with these intersection points. In the case that one point is inside the clipping window there will be one intersection. In the case that two points have at least one opposing left-right or up-down bit then there will be two intersections since the line defined by the two points must necessarily enter and exit the clipping window.

Note: there may be some edge cases where the line just barely intersects a corner or side of the clipping window but these are handled by the following algorithm.

## Cohen–Sutherland Line Clipping Algorithm

Cohen–Sutherland gives us a fast way to:
- quickly accept (case 1),
- quickly reject (case 2),
- and only do real intersection math in the “maybe” case (case 3).

We can use a simple point clipping test to see if lines are fully visible or nonvisible, but for partially visible lines we need a way to find where the segment crosses the clipping window.

Cohen–Sutherland does this by:
1. Dividing the plane into **9 regions** around the window.
2. Assigning a 4-bit region code (also called an _outcode_) to each point.
3. Using bitwise logic on these codes to:
    - quickly accept or reject a line, or
    - determine how to clip it.

### Region codes (TBRL)

We split the space into 9 regions (3×3 grid). The center region is the clipping window. Each region gets a 4-bit code: T = Top, B = Bottom, R = Right, L = Left. Conceptually the bits are: **T B R L**.  
In code, we usually just give each direction a bit mask:
```c
#define CS_LEFT   1   // 0001
#define CS_RIGHT  2   // 0010
#define CS_BOTTOM 4   // 0100
#define CS_TOP    8   // 1000
```
The actual order of bits isn’t important, as long as we use these masks consistently.
The clipping window has code `"0000"` (no bits set) and is defined by $(x_{\min}, y_{\min}, x_{\max}, y_{\max})$

For a point $P = (p_x, p_y)$:
- If $p_y > y_{\max}$ i.e. above window: set T bit
- If $p_y < y_{\min}$ i.e. below window: set B bit
- If $p_x < x_{\min}$ i.e. left window: set L bit
- If $p_x > x_{\max}$ i.e. right window: set R bit

For example:
- Code `0000` → inside window.
- Code `1001` (T + L) → above and to the left of the window, etc.

```text
   1001   1000   1010
   0001   0000   0010
   0101   0100   0110
```

Where the middle `0000` is the clipping window.

### Using region codes for line visibility

Now that we have defined the region codes we can encode a segment between points $P_0$ and $P_1$, as: `code0` = outcode of $P_0$ and code1`code1` = outcode of $P_1$.

Now there are three key cases:
1. Both points are inside the clipping window (trivial accept)
```c
if (code0 == 0 && code1 == 0) {
    // entire segment is inside window
}
```
2. Both points are definitively outside (trivial reject). If the bitwise AND of the codes is non-zero:
```c
if (code0 & code1 != 0) {
	// the segment is fully outside on the same side
}
```
3. Partially visible line (must clip)
    Otherwise, at least one endpoint is outside with two sub-options:
    - either one point is inside and the other outside, or
    - they are in different outside regions that force the line to cross the window.

### Clipping step (computing intersections)

We treat the segment as a parametric line:
$$
x(t) = x_0 + t(x_1 - x_0), \quad  
y(t) = y_0 + t(y_1 - y_0), \quad 0 \le t \le 1  
$$

Algorithm:
1. Choose one endpoint that is **outside** (nonzero outcode). Call its code `codeOut`.
2. Based on which bit is set in `codeOut`, we intersect the infinite line with the corresponding boundary:
    - If `codeOut & CS_TOP` (above window): intersect with $y = y_{\max}$
    - If `codeOut & CS_BOTTOM`: intersect with $y = y_{\min}$
    - If `codeOut & CS_RIGHT`: intersect with $x = x_{\max}$
    - If `codeOut & CS_LEFT`: intersect with $x = x_{\min}$

	For example, if the point is above the window (top bit set):
	$$y = y_{\max}, \quad t = \frac{y_{\max} - y_0}{y_1 - y_0}, \quad x = x_0 + t(x_1 - x_0)$$
	Similarly, for the left boundary:
	$$ x = x_{\min}, \quad t = \frac{x_{\min} - x_0}{x_1 - x_0}, \quad y = y_0 + t (y_1 - y_0)$$
3. Replace the outside endpoint with this intersection point and recompute its outcode.
4. Loop back:
    - If both codes become 0 then trivial accept with the new clipped endpoints.
    - If `(code0 & code1) != 0` at any point then trivial reject.
    - Otherwise keep clipping.

This process always terminates in less than 4 iterations per line because each clipping move nudges one endpoint to lie exactly on a boundary or brings it inside. So for each endpoint it will clip at most twice to align it with the vertical or horizontal boundaries of the clipping window.

## Easy to read code 
```c
#include <stdbool.h>

#define CS_LEFT   1   // 0001
#define CS_RIGHT  2   // 0010
#define CS_BOTTOM 4   // 0100
#define CS_TOP    8   // 1000

static int outcode(float x, float y,
                   float xmin, float ymin,
                   float xmax, float ymax)
{
    int code = 0;
    if (x < xmin)      code |= CS_LEFT;
    else if (x > xmax) code |= CS_RIGHT;
    if (y < ymin)      code |= CS_BOTTOM;
    else if (y > ymax) code |= CS_TOP;
    return code;
}

// Returns true if the line is at least partially inside.
// On success, (*x0,*y0)-(*x1,*y1) are replaced by the clipped segment.
bool cohen_sutherland_clip(
    float *x0, float *y0,
    float *x1, float *y1,
    float xmin, float ymin,
    float xmax, float ymax)
{
    int code0 = outcode(*x0, *y0, xmin, ymin, xmax, ymax);
    int code1 = outcode(*x1, *y1, xmin, ymin, xmax, ymax);

    while (1) {
        if (!(code0 | code1)) {
            // Case 1: both endpoints inside (codes == 0) -> accept
            return true;
        } else if (code0 & code1) {
            // Case 2: both endpoints share an outside region -> reject
            return false;
        } else {
            // Case 3: at least one endpoint is outside
            float x, y;
            //Chooses outside code if the other one is inside
            //if both outside either one can be choosen
            int codeOut = code0 ? code0 : code1;

            if (codeOut & CS_TOP) {
                // Point is above clip window
                float t = (ymax - *y0) / (*y1 - *y0);
                x = *x0 + t * (*x1 - *x0);
                y = ymax;
            } else if (codeOut & CS_BOTTOM) {
                // Point is below clip window
                float t = (ymin - *y0) / (*y1 - *y0);
                x = *x0 + t * (*x1 - *x0);
                y = ymin;
            } else if (codeOut & CS_RIGHT) {
                // Point is to the right of clip window
                float t = (xmax - *x0) / (*x1 - *x0);
                y = *y0 + t * (*y1 - *y0);
                x = xmax;
            } else { // CS_LEFT
                float t = (xmin - *x0) / (*x1 - *x0);
                y = *y0 + t * (*y1 - *y0);
                x = xmin;
            }

            // Move the outside endpoint to the intersection point
            if (codeOut == code0) {
                *x0 = x; *y0 = y;
                code0 = outcode(*x0, *y0, xmin, ymin, xmax, ymax);
            } else { // codeOut == code1
                *x1 = x; *y1 = y;
                code1 = outcode(*x1, *y1, xmin, ymin, xmax, ymax);
            }
        }
    }
}
```


Extra links:

https://sighack.com/post/cohen-sutherland-line-clipping-algorithm

