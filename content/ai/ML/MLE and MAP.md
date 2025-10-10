# MLE (Maximum Likelihood Estimation) and MAP (Maximum a Posteriori)


The goal of the following post is to quickly set up the probabilistic Bayesian framework / tools we will use later for the expectation maximization algorithm and later on Gaussian Mixture Models (GMMs)


# Setup:


In data science situations such as these we will have or want to generate some data $X$
that is made up of some data points $x_n$. These data point could be a single scalar value or any n-dimensional point. In many data science applications the dimensionality of the data will depend on the number of attributes that belong to each data point for example a dataset consisting of medical data for newborns may have attributes of: weight, height, sex, eye color etc.. 

Thus we can write our data as:
$$X={x_1​,x_2​,…,x_n​}$$ all the way up to our total number of data points $N$. 

Our goal is to try to model the distribution of our data $X$ primarily in an effort to predict new data, find outliers, or generate new synthetic data. 

To do this we posit that there is some probabilistic model or combination of models such that $p(X|\theta)$ which we call the likelihood function, where $X$ is the observed or collected data and $\theta$ is the parameters of our model. In English $p(X|\theta)$ means: "Given this parameter(s) setting $\theta$, what is the probability or probability density of observing this data $X$".  
My first time seeing the likelihood function it made logical sense but it still seemed a bit backwards since in real life we usually collect some data first and then try to fit our model to it whereas in the equation the parameters of our model and thus the shape of our data are assumed. However, thanks to Bayes' rule we can flip our "givens" and write:
$$p(\theta|X) = \frac{p(X|\theta)p(\theta)}{p(X)}$$
The difference in the two approaches delineate the Bayesian vs frequentists approach in data science and the MLE vs MAP as we will see later.

# MLE

The maximum likelihood estimate is the parameter value that maximizes the likelihood of the observed data:
$$\theta_{mle} = argmax_{\theta} p(X|\theta)$$
In other words the MLE is the setting of our parameter(s) of our assumed model / distribution that maximizes the likelihood of generating our data. If we assume an independent and identically distributed (i.i.d.) dataset meaning that each data sample is independent of the others and originates from the dame probability distribution then we know that the overall likelihood is just the product of probabilities over the dataset:
$$\theta_{mle} = argmax_{\theta} \prod_{n=1}^{N} p(x_n|\theta)$$
Additionally to make the differentiation that we must perform later to find the argmax easier we can use log-likelihood since the log of a differentiable function that is greater than 0 will have the same stationary points (zeros) when differentiated as the original function when differentiated. In other words the zeros of $f'(\theta) = log(f(\theta))'$. This is quite a nice property since logs turn products into sums se we can rewrite MLE as:
$$\theta_{mle} = argmax_{\theta} \sum_{n=1}^{N} log(p(x_n|\theta))$$
Going back to our original MLE equation: $\theta_{mle} = argmax_{\theta} p(X|\theta)$ we can see that this approach uses a frequentist viewpoint where the parameters $\theta$ are considered fixed but unknown and only as we sample more points from our dataset do we adjust $\theta$ to maximize the likelihood of the observed data, that is all information about $\theta$ comes form the data with no external / prior beliefs assumed about the data. Indeed we will see that MLE is actually just a special case of MAP when the prior is flat or uninformative; additionally and intuitively as data grows the prior influence tends to vanish and thus MLE and MAP converge (if priors are well behaved). 

# MAP

Maximum a posteriori or MAP estimate is the mode or the highest point of the posterior distribution $p(\theta|X)$:
$$\theta_{map} = argmax_\theta p(\theta|X) = argmax_{\theta} [\frac{p(X|\theta)p(\theta)}{p(X)}] = argmax_{\theta}[p(X|\theta)p(\theta)]$$ In the equation above we can get rid of $p(X)$ because it does not depend on $\theta$. 
Once again we can take the log likelihood to get:
$$\theta_{map} = argmax_{\theta}[log(p(X|\theta)) + log(p(\theta))]$$
we can look at $log(p(\theta))$ as a regularization term that adds to the log-likelihood given some prior assumption about the latent variable. In short the prior can encode domain knowledge, regularization, or bias against extreme parameter values; so it can also be interpreted as regularized MLE where the log prior plays the role of a penalty term. 


# Combined Interpretation

MLE can be seen as a special case of MAP when the prior is flat/uniform. 

However, actual flat or “uninformative” priors are subtle in many continuous parameter spaces (because of issues like improper priors).
