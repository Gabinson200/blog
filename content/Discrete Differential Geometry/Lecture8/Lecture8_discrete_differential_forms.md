# Discrete Differential Forms

Example:

Question: Given a 2-form $w = dx \wedge dy$, find a 1-form $\alpha$ such that $d\alpha = w$. ie find the 1 form that when derived gives is a 2-form. (Remember, derivation raises the form by 1)

Any 1-form can be expressed as: $\alpha = udx + vdy$ for some pair of functions $u, v$. 

So we can write $d\alpha$ as $d\alpha = du\wedge dx + dv \wedge dy$ 

We also know that $dx \wedge dy = -dy \wedge dx$

Thus we can rewrite $w$ as $w = -0.5dy \wedge dx + 0.5dx \wedge dy$

this means that $du$ in $\alpha$ must have the form $-0.5dy$ in $w$ after differentiation, the same thing applies to $dv$ and $dx$. Thus:
$$u(x, y) = -0.5y + a, v(x, y) = 0.5x+b$$
where $a,b \in R$

This is somewhat paradoxical as $\alpha$ has some non-constant swirling that when derived does lead to a constant 2-form $w$. 

As this shows derivation of even very easy differential equations are hard to do by hand, which is why we need a computational approach to approximate solutions. 

## $\star$ Fundamental Approach
Basic ideas to turn derivation into computation:
- replace domain with mesh (work with an oriented simplicial complex)
- replace differential forms with values on mesh (differential k-forms become values on k-simplicies)
- replace differential operators with matrices (e.g. exterior derivative is given by signed incidence matrices)


## Discretization and Interpolation

**Discretization**: Given a continuous object, how do I turn it into a finite (discrete) collection of measurements. 

**Interpolation**: given a discrete object (a finite collection of measurements), how do I come up with a continuous object that agrees with (interpolates) it. 

In the case of differential k-forms:

Discretization happens via integration over oriented k-simplices (de Rham map). 
Interpolation is performed by taking linear combinations of continuous functions associated with k-simplices. (Whitney interpolation)


## Discretization







