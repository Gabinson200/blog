# Rasterization Definition

Rasterization is the process of converting geometric representations of objects—such as points, lines, and triangles—into a discrete grid of pixels for display on a screen. In computer graphics, rasterization transforms the continuous shapes in a scene into fragments (potential pixels) and determines their color, depth, and other attributes to produce the final image.

It is a key stage of the graphics pipeline and is typically optimized for speed, since it needs to run in real time for interactive applications like video games.

*Quick Example*

Imagine you have a triangle defined by three vertices in 2D space:  
A(2, 1), B(6, 1), C(4, 4)
Rasterization determines all the pixel centers inside this triangle and fills them with the appropriate color.  
For instance, if the triangle is red, the rasterizer will mark every pixel covered by the triangle as red, producing a filled red triangle on the screen.
