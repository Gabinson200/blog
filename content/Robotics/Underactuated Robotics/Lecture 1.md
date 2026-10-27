# Lecture 1: Robot Dynamics and model-based control


Robots can be controlled by a mix of:
- planning and mechanics
- reinforcement learning
- immitation learning

What makes control difficult:
- Uncertainity / Partial observability
- Long term consequence of actions
- Nonlinearity


Nonlinear Differential Equations:  
Something of the form:
$$\dot{x} = f(x, u)$$
where
- $\dot{x}$ is some derivative of $x$
- $f()$ is a vector valued function
- $x$ is a state vector
- $u$ is some control input

Along with an observation model: 
$$y=g(x)$$
where $y$ is some output vector of observations

**Def 1**:
A second-order control differential equation of the general form:
$$\tag{1} \ddot{q} = f(q, \dot{q}, u, t)$$

$(1)$ is **fully actuated** in $q, \dot{q}$ at time $t$ iff for every $\ddot{q}$ there exists a some control input $u$ which produces a desired response. Otherwise it is said to be **underactuated**.

Feedback Equivalence:

Given some system $\ddot{q} = f_1(q, \dot{q}) + f_2(q, \dot{q}, u)$ and a desired output $\ddot{q}_d$

Then $u = f_2^{-1}(q, \dot{q})[\ddot{q}_d - f_1(q, \dot{q})]$

So as long as $f_2^{-1}$ exists ie $f_2$ is invertible, the system is fully actuated.







