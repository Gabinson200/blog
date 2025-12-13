
## Paravectors

Paravector is a fancy name for the sum of scalars and vectors $a+v$.  Paravectors don't have a nice geometric interpretation but we can still perform algebraic operations on them all the same:
- $(a+u) + (b+v) = (a+b) + (u+v)$
- $c(a+u) = ca + cu$
- $-(a+u) = -a-u$
- $0+(a+u) = a+u$ here the $0$ can be either the scalar zero or the vector 0.
-  In fact the scalar and vector zero are the same $$\overrightarrow{0} + 0 = \overrightarrow{0}$$and $$0 + \overrightarrow{0} = 0$$ thus $$\overrightarrow{0} = 0$$
## Direct Sums

Now that we know how to do linear operations (scaling and addition) on scalars, vectors, and their combinations (paravectors), lets see how we can do linear operations on vectors in different linear spaces. Given linear spaces $U$ and $V$ and vectors $u \in U$ and $v \in V$, $u+v$ creates a new bigger linear space, called the direct sum of the two linear spaces: $U \oplus V$. Note that direct sums is an operation on linear spaces not on vectors, and the direct sum of linear spaces have a shared origin; $U \oplus V, 0_u = 0_v$. In the same way that for 2D paravectors $a +be_1 + ce_2$ has basis $\{1, e_1, e_2\}$ which is comprised of the basis of numbers $\{1\}$ and the basis for 2D vectors $\{e_1, e_2\}$ the direct sum of linear spaces $U$ and $V$ with basis $\{u_1, u_2 ... u_n\}$ and $\{v_1, v_2 ... v_m\}$ respectively, has basis $\{u_1, u_2 ... u_n, v_1, v_2 ... v_m\}$, thus the dimension of a direct sum $U \oplus V$ is of size $dim(U)+dim(V)$.

Next Article: [Bivectors](article.html?slug=\geometric_algebra\Bivectors)
