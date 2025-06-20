---
layout: layouts/base.njk
title: Home
---
# Welcome

Hello! I’m Adam Kocsis, an AI & embedded-systems tinkerer.

<!-- add some wiki-links so graphData isn’t empty: -->
This blog has two main posts: [[post-one|First Post]] and [[post-two|Second Post]].

<div id="graph-container" class="h-96 border"></div>

<script id="graph-data" type="application/json">
{{ collections.graphData | jsonify | safe }}
</script>
