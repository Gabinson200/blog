# Descriptive vs Inferential Community Detection in Networks


Community detection allows us to divide large networks into smaller groups of nodes that have "similar" properties or contributions to the overall network structure. Not only can this be used for node classification and clustering but also for generating a simplified description of the network that is more tractable to work with. 

## Describing vs Explaining

The goal of graph partitioning is to split / cluster a graph such that some desired global metric is achieved. Ex; transistor positioning to optimize for space or parallel task scheduling so that time spent is minimized. Community detection on the other hand not only aims to identify and cluster nodes but to also gleam some insight into what underlying process caused the clustering in the first place. "The communities identified are usually directly used for representation and/or interpretation of the data, rather than as a mere device to solve a particular optimization problem" - Peixoto. 


Fun example from the text:
>The process of explanation
must invariably involve at its core an application of the law of parsimony, or Occam’s razor.
This principle predicates that when considering two hypotheses compatible with an observation,
the simplest one must prevail. Employing this logic results in the conclusion that what we are
seeing is in fact a regular mountain, without denying that it looks like a face in that picture and
instead acknowledging that it does so accidentally. In other words, the “facial” description is not
useful as an explanation, as it emerges out of random features rather than exposing any underlying
mechanism.

## Litmus Test for Descriptive vs Inferential Methods

Q: “Would the usefulness of our conclusions change if we learn, after obtaining the communities, that the network being analyzed is maximally random?”

- If the answer is “yes,” then an inferential approach is needed.
- If the answer is “no,” then an inferential approach is not required.

## Descriptive vs Inferential Methods




have some parallels between frequentist vs bayesian methods

Decs

## Model description as compression metrics

The idea is we need some set amount of information to describe a network that has some lower bound defined by Shannon’s source coding theorem which states that it is impossible to compress data sampled from a distribution $P(x)$ using fewer bits per symbol than the entropy of the distribution, $H = − ∑x P(x) log_2 P(x)$.

The idea is, to specify a network in information theoretical terms, we can split up the description length of the networks into two terms: M and D where M quantifies the amount of information in bits necessary to describe the parameters of the model and D determines how many bits are necessary to encode the network itself once the model parameters are known. 
