# Rodriguez Rotation 


Lets say you have a model/mesh (set of points) that you want to rotate around an arbitrary axis by an angle theta($\theta$) or similarly you want to align a model to face in the same direction as another arbitrary vector (similar to the Look-At function). 

## Mathematical Derivation
If we have a vector $v$ in $R^3$ and another unit vector $k$ around which we want to rotate $v$ by an angle $\theta$ we can use Rodrigues' rotation formula to do this. Alternatively, if we want to align $v$ to face the same direction as another vector $w$ we can find the unit vector $k$:
$$k = \frac{v \times w}{|v \times w|} = \frac{v \times w}{|v||w|sin(\theta)}$$  
and apply Rodrigues' rotation formula all the same.

The main idea behind the derivation of Rodrigues' formula is that we can decompose our vector $v$ into three components: a component of $v$ that is in the direction of $k$, and two vectors that then describe the rotation in a plane that our first component lands on. There are many different ways to derive the formula but since I want to get into some code optimizations later I will stick with one from wikipedia that slightly trades brevity for clarity, although I don't think its too bad, especially if we keep in mind a geometric view throughout our derivation. 


First we start by decomposing our original vector $v$ into its components parallel and perpendicular to our rotational axis $k$. 
$v = v_{para} + v_{perp}$. The parallel component is simply the vector projection of $v$ onto $k$: 
$$\text{(1)  } v_{para} = proj_k(v) = \frac{v \cdot k}{|k|}\frac{k}{|k|} = (v \cdot k)k \text{  ;since k is a unit vector}$$

![Rodriguez formula 1 img](\rodrig_form1.png)

and since $v_{perp} = v - v_{para}$ we can convert it into the form:
$$v_{perp} = v - v_{para} = v - (v \cdot k)k$$ then using the vector triple formula:
$$a \times (b \times c) = (a \cdot c)b - (a \cdot b)c$$
where $$a = -k, b = k, c = v$$
we can turn it into:
$$\text{(2)  }v_{perp} = v - (v \cdot k)k = -(-k \cdot k)v + (-k \cdot v)k = -k \times (k \times v)$$


Additionally, since we defined $v_{perp} = v-(v \cdot k)k$ then if we  take the cross product of $v$'s perpendicular component with $k$:
$$k \times v_{perp} = k \times v-(v \cdot k)k = k \times v - (k \times k)(k \cdot v)$$ since $(k \times k) = 0$ the equation reduces to:
$$\text{(3)  }k \times v_{perp} = k \times v$$ which basically states that taking the cross product between $k$ and just the perpendicular direction of $v$ to $k$ is the same as taking the cross product between $k$ and all of $v$. 

Now that we have $k$, $v_{perp}$, and $k \times v$ (which can be found with $k \times v_{perp}$) we have defined a 3D basis vector around $v$ that can be derived just from $k$ and $v$. 

But why go through all this hassle of decomposing $v$ into its parallel and perpendicular parts to $k$?

Well, we can see that when we rotate $v$ around $k$ the parallel component of $v$ will not change direction or magnitude, ie rotation invariant with respect to $k$. $$\text{(4)  } v_{para.rotated} = v_{para}$$
This means that when we do the rotation we can disregard $v_{para}$, rotate just $v_{perp}$, and then use $v_{para}$ to basically realign $v$.
So we decompose $v$ to allow us to project $v$ down into the plane defined by $v_{perp}$ and $k \times v = k \times v_{perp}$, perform the rotation in that plane, and then add back in $v_{para}$.

To perform the rotation in the $v_{perp}$ and $k \times v_{perp}$ plane we can use the polar coordinates defined by those two vectors analogously to how $r = rcos(\theta)(x-axis) + rsin(\theta)(y-axis)$ defines a rotation in the x-y plane. 
$$\text{(5)  }v_{perp.rotated} = cos(\theta)v_{perp} + sin(\theta)(k \times v_{perp})$$
(Note: in some derivations an extra angle may be used to basically get to this point using trigonometry)

Now that we have all our building block equations (1-5) we can find the final $v_{rotated}$ which is just $v_{para.rotated} + v_{perp.rotated}$. Since $v_{para.rotated}$ is rotationally invariant it is  equal to $v_{para}$ (4), then we can substitute in the polar equation for $v_{perp.rotated}$. 

![Rogriguez Formual 2 img](\rodrig_form2.png)


$$v_{rotated} = v_{para.rotated} + v_{perp.rotated} = v_{para} + cos(\theta)v_{perp} + sin(\theta)(k \times v_{perp})$$  

using (3):

$$\text{(6)  } v_{rotated} = v_{para} + cos(\theta)v_{perp} + sin(\theta)(k \times v)$$  

using  $v_{perp} = v - v_{para}$ :

$$v_{rotated} = v_{para} + cos(\theta)( v - v_{para}) + sin(\theta)(k \times v)$$  

$$v_{rotated} = v_{para} + cos(\theta)(v) - cos(\theta)(v_{para}) + sin(\theta)(k \times v)$$  

$$v_{rotated} = v_{para}(1-cos(\theta)) + cos(\theta)(v) + sin(\theta)(k \times v)$$ 

using (1) $v_{para} = (v \cdot k)k$:

$$\text{Form 1:  }v_{rotated} = ((v \cdot k)k)(1-cos(\theta)) + cos(\theta)(v) + sin(\theta)(k \times v)$$ 

alternatively if we substitute in $v_{para} = v - v_{perp}$ to (6):

$$v_{rotated} = (v - v_{perp}) + cos(\theta)v_{perp} + sin(\theta)(k \times v)$$  

using (2):

$$v_{rotated} = (v - (-k \times (k \times v))) + cos(\theta)(-k \times (k \times v)) + sin(\theta)(k \times v)$$ 

$$v_{rotated} = (v + k \times (k \times v)) + cos(\theta)(-k \times (k \times v)) + sin(\theta)(k \times v)$$ 

$$v_{rotated} = v + k \times (k \times v)(1 - cos(\theta)) + sin(\theta)(k \times v)$$ 

$$\text{Form 2:  } v_{rotated} = v + sin(\theta)(k \times v) + (1 - cos(\theta))k \times (k \times v)$$

While the first form is usually shown in math textbooks the second form is more computationally favorable since it only has cross-products and more cache-able elements.


## Matrix Form

Nice, so we got the vector form of Rodrigues’ formula. It would be even nicer to package this as a single 3×3 matrix $R$ so that, just like in the [2D and 3D Transformations Article](article.html?slug=programming/graphics/2D%20and%203D%20Transformations/2D%20and%203D%20Transformations)
we can perform linear transformation of $v$ by $R$ to rotate it to our desire. 
$$v_{rotated} = Rv$$

Since all the individual operations in our equation are linear we can find their corresponding transformation matrices and then combine them into a final matrix $R$.

For completeness sake I'll decompose both Form 1 and Form 2 into their matrix representations:

### Form 1:

Form 1 is made up of scalar multiplication, dot, and cross products.

$$v_{rotated} = (v \cdot k)k(1-cos(\theta)) + cos(\theta)(v) + sin(\theta)(k \times v)$$ 

>Note: The dot product, which is just a special case of the inner product, of two vectors yields a scalar while the outer product creates a matrix by multiplying every element of the first vector by every element of the second. 

For more info check out [Outer product](add link here)

We already know that $v_{para} = (v \cdot k)k$
which can be written as an outer product:
$$(v \cdot k)k = (kk^T)v$$

So $(v \cdot k)k(1-cos(\theta))$ becomes $(1-cos(\theta))(kk^T)v$

For the cross products you can express them in a skew-symmetric matrix of $k$:
$$k_{\times} = \begin{pmatrix} 0 & -k_z & k_y \\\
                      k_z & 0 & -k_x \\\
                      -k_y & k_x & 0
                \end{pmatrix}$$
so $k \times v = k_{\times}v$.  
Thus $sin(\theta)(k \times v)$ becomes $sin(\theta)(k_{\times}v)$

Thus we can rewrite Form 1 as:
$$v_{rotated} = (1-cos(\theta))(kk^T)v + cos(\theta)v + sin(\theta)(k_{\times}v)$$
$$v_{rotated} = [(1-cos(\theta))(kk^T) + cos(\theta)I + sin(\theta)(k_{\times})]v$$
$$R(k, \theta) = (1-cos(\theta))(kk^T) + cos(\theta)I + sin(\theta)(k_{\times})$$

We can represent this equation as a sum of 3 matrices:

$$R(k, \theta) = (1-cos(\theta))
                \begin{pmatrix} 
                k_xk_x & k_xk_y & k_xk_z \\\
                k_yk_x & k_yk_y & k_yk_z \\\
                k_zk_x & k_zk_y & k_zk_z
                \end{pmatrix}
                +
                cos(\theta)
                \begin{pmatrix} 
                1 & 0 & 0 \\\
                0 & 1 & 0 \\\
                0 & 0 & 1
                \end{pmatrix}
                +
                sin(\theta)
                \begin{pmatrix} 
                0 & -k_z & k_y \\\
                k_z & 0 & -k_x \\\
                -k_y & k_x & 0
                \end{pmatrix}
$$


Expanding the equation into vector form:
$c = cos(\theta), s = sin(\theta), t = 1-c$ Then:
$$R(k, \theta) = \begin{pmatrix} tk^2_x+c & tk_xk_y-sk_z & tk_xk_z + sk_y \\\
                      tk_yk_x+sk_z & tk^2_y+c & tk_yk_z-sk_x \\\
                      tk_zk_x - sk_y & tk_zk_y+sk_x & tk^2_z + c
                 \end{pmatrix}
                $$

Then for any vector $v = (x, y, z)^T$, the rotated vector is simply:
$v_{rotated} = R(k, \theta)v$

### Form 2

For form 2 since we got rid of the dot product all we have to convert is the cross of the cross products $k \times (k \times v)$.
Which we can expand into dot products using the vector triple formula again. $a \times (b \times c) = (a \cdot c)b - (a \cdot b)c$

$$k \times (k \times v) = (k \cdot v)k - (k \cdot k)v = (kk^t-I)v$$
since $k \cdot k = 1$. 

Substituting $k_{\times}v$ for $k \times v$ once again we get:

$$v_{rotated} = [I + sin(\theta)k_{\times} + (1-cos(\theta))(kk^T - I)]v$$

$$v_{rotated} = [(1-cos(\theta))(kk^T) + cos(\theta)I + sin(\theta)(k_{\times})]v$$

Which is equivalent to what we found for Form 1.

## Programming

>I basically stole the optimization from [Inigo Quilez's blog](https://iquilezles.org/articles/noacos/) which is a great resource with other awesome graphics topics.

Now that we have the matrix form we can implement it in code:

$c = cos(\theta), s = sin(\theta), t = 1-cos(\theta)$:
$$R(k, \theta) = \begin{pmatrix} tk^2_x+c & tk_xk_y-sk_z & tk_xk_z + sk_y \\\
                      tk_yk_x+sk_z & tk^2_y+c & tk_yk_z-sk_x \\\
                      tk_zk_x - sk_y & tk_zk_y+sk_x & tk^2_z + c
                 \end{pmatrix}
                $$

becomes:
```cpp
mat3x3 rotationAxisAlign( const vec3 &v, float angle){
    const float sin = sinf(angle);
    const float cos = cosf(angle);
    const float ic = 1.0f - cos;

    mat3x3 rot_mat = (
        v.x*v.x*ic + cos, v.x*v.y*ic - sin*v.z, v.x*v.z*ic + sin*v.y,
        v.x*v.y*ic + sin*v.z, v.y*v.y*ic + cos, v.y*v.z*ic - sin*v.x,    
        v.x*v.z*ic - sin*v.y, v.y*v.z*ic + sin*v.x, v.z*v.z*ic + cos
    )
}

```

To implement a LookAt type algorithm as discussed in the [Vertex Shader Article](article.html?slug=programming/graphics/Vertex%20Shader/Vertex%20Shader) we can write a function where instead of defining an axis of rotation we provide an axis of alignment $d$, that we want our local coordinate system's $z$-axis to face.

Note:
The following derivations will assume that $z$ and $d$ are unit vectors. If they aren’t, you must normalize them first or adjust the formulas.

```cpp
const vec3   axi = normalize(cross(z, d)); // unit axis
const float  ang = acosf(clamp(dot(z, d), -1.0f, 1.0f)); // angle
const mat3x3 rot = rotationAxisAngle(axi, ang);

```

The above code technically works but if we expand the function with our new `axi` and `ang` variables we can see that were are doing quite a few redundant and costly trigonometric calculations. 


```cpp
const vec3   axi = normalize(cross(z, d)); // unit axis
const float  ang = acosf(clamp(dot(z, d), -1.0f, 1.0f)); // angle
// Step into rotationAxisAlign function
const float sin = sinf(ang);
const float cos = cosf(ang);
const float ic = 1.0f - cos;

mat3x3 rot_mat = (
    axi.x*axi.x*ic + cos, axi.x*axi.y*ic - sin*axi.z, axi.x*axi.z*ic + sin*axi.y,
    axi.x*axi.y*ic + sin*axi.z, axi.y*axi.y*ic + cos, axi.y*axi.z*ic - sin*axi.x,    
    axi.x*axi.z*ic - sin*axi.y, axi.y*axi.z*ic + sin*axi.x, axi.z*axi.z*ic + cos
)
```
Using the knowledge that:

1. $a \cdot b = |a||b|cos(\theta)$
2. $|a \times b| = |a||b|sin(\theta)$
3. $cos(arccos(\theta))= (\theta)$


Since $z$ and $d$ are both unit vectors their dot product is simply the cosine of the angle between them, using 1. we can skip computing `ang` and just set 
`
float cos = dot(z, d); // = cos(theta)
`
Thus saving us from having to compute cos / acos.

Similarly using 2. we can find $sin(\theta)$ by just taking the length of the cross product of our two unit vectors $z$ and $d$.


```cpp
vec3  ax = cross(z, d);      // a
float cos = dot(z, d);       // cos(theta)
float sin = length(ax);      // sin(theta) because z, d are unit
vec3  v  = ax / sin;         // normalized axis
float ic = 1.0f - cos;

```

Nice! so far we got rid of some of our trigonometric calls and even got rid of an explicit `normalize` call and we ended up with:
- $a=z \times d$
- $|a|=sin=sin(\theta)$
- $v = a / sin$


Lets see if we can simplify even further, looking back at our split up matrix form from before:
$$R(v, \theta) = (1-cos(\theta))
                \begin{pmatrix} 
                v_xv_x & v_xv_y & v_xv_z \\\
                v_yv_x & v_yv_y & v_yv_z \\\
                v_zv_x & v_zv_y & v_zv_z
                \end{pmatrix}
                +
                cos(\theta)
                \begin{pmatrix} 
                1 & 0 & 0 \\\
                0 & 1 & 0 \\\
                0 & 0 & 1
                \end{pmatrix}
                +
                sin(\theta)
                \begin{pmatrix} 
                0 & -v_z & v_y \\\
                v_z & 0 & -v_x \\\
                -v_y & v_x & 0
                \end{pmatrix}
$$

Looking at the matrices above we see that all the terms will have some combination of sines and cosines and we also know that $v = a / sin$, additionally an important trigonometric that allows us to switch between sines and cosines is: $1 = cos^2(\theta) + sin^2(\theta)$. We can see that for the first matrix all the elements on the diagonal are squares of $v$'s components and since $v = a / sin$ those elements evaluate to $\frac{a^2}{sin^2}(1-cos(\theta))$, 
Similarly, the contribution of the first submatrice's non-diagonal elements will evaluate to some combination of $\frac{a_{x,y,z}a_{x,y,z}}{sin^2}(1-cos(\theta))$; where the dimensions of the axis in the numerator are different. So, lets isolate the one minus cosine and sine squared terms and call it:
$$h = \frac{ic}{sin^2} = \frac{1-cos}{sin^2}$$
using the trig. formula above we get:
$$h = \frac{1-cos}{1-cos^2} = \frac{1-cos}{(1-cos)(1+cos)} = \frac{1}{1 + cos}$$
Lastly, if we just substitute $v = a / sin$ into our last sub-matrix all the sines will cancel 
so we can simplify our rotation matrix to:

$$R(v, \theta) = h
                \begin{pmatrix} 
                a_xa_x & a_xa_y & a_xa_z \\\
                a_ya_x & a_ya_y & a_ya_z \\\
                a_za_x & a_za_y & a_za_z
                \end{pmatrix}
                +
                cos(\theta)
                \begin{pmatrix} 
                1 & 0 & 0 \\\
                0 & 1 & 0 \\\
                0 & 0 & 1
                \end{pmatrix}
                +
                \begin{pmatrix} 
                0 & -a_z & a_y \\\
                a_z & 0 & -a_x \\\
                -a_y & a_x & 0
                \end{pmatrix}
$$

This way there are no sine terms in our final matrix and there is also no need to normalize the axis of rotation. 

```cpp
mat3x3 rotationAlign(const vec3 &d, const vec3 &z)
{
    const vec3  a = cross(z, d);     // axis
    const float c = dot(z, d);       // cosine
    const float h = 1.0f/(1.0f+c);

    return mat3x3( a.x*a.x*h + c,     a.y*a.x*h - a.z,    a.z*a.x*h + a.y,
                   a.x*a.y*h + a.z,   a.y*a.y*h + c,      a.z*a.y*h - a.x,
                   a.x*a.z*h - a.y,   a.y*a.z*h + a.x,    a.z*a.z*h + c    );
}
```

It is noteworthy that similar to the LookAt function in the [Vertex Shader Article](article.html?slug=programming/graphics/Vertex%20Shader/Vertex%20Shader) when $z$ and $d$ are opposite or parallel their cross product is zero and their dot product (cos) will be -1 which causes a divide by 0 in h. Geometrically: a 180° rotation to go from $z$ to $−z$ has infinitely many possible axes (any axis perpendicular to z). The cross product $z \times d$ can’t pick one, so it collapses to zero.


```cpp
mat3x3 rotationAlign(const vec3 &d_raw, const vec3 &z_raw)
{
    vec3 z = normalize(z_raw);
    vec3 d = normalize(d_raw);

    float c = dot(z, d);

    // 1. Already aligned
    if (c > 1.0f - 1e-6f) {
        return mat3x3(1.0f); // identity
    }

    // 2. Opposite directions
    if (c < -1.0f + 1e-6f) {
        // Pick any vector not parallel to z
        vec3 tmp = (fabs(z.x) > fabs(z.z))
                 ? vec3(-z.y, z.x, 0.0f)
                 : vec3(0.0f, -z.z, z.y);
        vec3 axis = normalize(tmp);   // unit axis parallel to z

        // 180 rotation: R = 2 * axis * axis^T - I
        float x = axis.x, y = axis.y, zc = axis.z;
        return mat3x3(
            2*x*x - 1, 2*x*y,     2*x*zc,
            2*y*x,     2*y*y - 1, 2*y*zc,
            2*zc*x,    2*zc*y,    2*zc*zc - 1
        );
    }

    // 3. General case
    vec3  a = cross(z, d);
    float h = 1.0f / (1.0f + c);

    return mat3x3(
        a.x*a.x*h + c,     a.y*a.x*h - a.z,    a.z*a.x*h + a.y,
        a.x*a.y*h + a.z,   a.y*a.y*h + c,      a.z*a.y*h - a.x,
        a.x*a.z*h - a.y,   a.y*a.z*h + a.x,    a.z*a.z*h + c
    );
}
```
We handle the opposite direction case by picking any axis perpendicular to $z$ and using the 180 rotation formula $R=2uu^T−I$.

