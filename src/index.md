---
layout: layouts/base.njk
title: Home
---
# Welcome

Hello! I’m Adam Kocsis, thanks for reading my blog. I'm not sure if blog is the right word for it, it is more of a place for me to write down some of my thoughts, share my interests, or just ramble in general. Below is a knoweldge graph I will aim to expand with different articles and concepts, this should provide some insignt into the areas and patterns of my interests and beliefs. 

<!-- add some wiki-links so graphData isn’t empty: -->
If you are intereted in my more moral / philosophical rambilgs check out [[morality/base-tenets|Morality]].
If you are interested in some scientific topics check out [[science/AI|science]].


<div id="graph-container" class="h-96 border"></div>
<script id="graph-data" type="application/json">
{{ collections.graphData | jsonify | safe }}
</script>
