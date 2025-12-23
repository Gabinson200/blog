# Splines

Honestly for splines just watch:

[Freya Holmer splines video](https://www.youtube.com/watch?v=jvPPXbo87ds)

[Freya Holmer Bezier curve video](https://www.youtube.com/watch?v=aVwxzDHniEw)


# Hermite vs Cubic Bezier

Although Hermite and Cubic Bezier splines are parameterized differently, they describe identical cubic curves. You can convert between them losslessly using the geometry of their control points.

## The Geometric Relationship

Hermite Spline: Defined by two endpoints ($P_{start}, P_{end}$) and two tangent vectors ($v_0, v_1$).  

Bezier Spline: Defined by four control points ($P_0, P_1, P_2, P_3$). The curve interpolates the endpoints, while the inner points define the tangent directions.

**Key Insight**: The tangent vector at the beginning and endpoint of a Bezier curve is exactly 3 times the vector from that point to its adjacent control point. $\mathrm{d} p(0) = 3(p_1-p_0)$ and $\\mathrm{d} p(1) = 3(p_3 - p_2)$

## Conversion Equations

### Converting Bézier $\to$ Hermite
If you have Bézier points $(P_0, P_1, P_2, P_3)$ and want Hermite data:
$$\begin{aligned}
&P_{start} = P_0 \\
&P_{end} = P_3 \\
&v_0 = 3(P_1 - P_0) \\
&v_1 = 3(P_3 - P_2) \\
\end{aligned}$$

### Converting Hermite $\to$ Bézier
If you have Hermite data $(P_{start}, P_{end}, v_0, v_1)$ and want Bézier control points:

$$\begin{aligned}
&P_0 = P_{start} \\
&P_1 = P_{start} + \frac{1}{3}v_0 \\
&P_2 = P_{end} - \frac{1}{3}v_1 \\
&P_3 = P_{end}
\end{aligned}$$

## Matrix Form (For Implementation)

For graphics engines, it is often more efficient to map the geometry vectors directly using transition matrices.

### Bézier to Hermite Matrix ($M_{B \to H}$)
$$
\begin{bmatrix} P_{start} \\ P_{end} \\ v_0 \\ v_1 \end{bmatrix} = 
\begin{bmatrix} 
1 & 0 & 0 & 0 \\
0 & 0 & 0 & 1 \\
-3 & 3 & 0 & 0 \\
0 & 0 & -3 & 3
\end{bmatrix}
\cdot
\begin{bmatrix} P_0 \\ P_1 \\ P_2 \\ P_3 \end{bmatrix}
$$

### Hermite to Bézier Matrix ($M_{H \to B}$)
$$
\begin{bmatrix} P_0 \\ P_1 \\ P_2 \\ P_3 \end{bmatrix} = 
\begin{bmatrix} 
1 & 0 & 0 & 0 \\
1 & 0 & 1/3 & 0 \\
0 & 1 & 0 & -1/3 \\
0 & 1 & 0 & 0
\end{bmatrix}
\cdot
\begin{bmatrix} P_{start} \\ P_{end} \\ v_0 \\ v_1 \end{bmatrix}
$$

# Write some stuff about spline usrfaces here

# maybe some stuff about NURBS


