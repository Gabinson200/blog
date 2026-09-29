[My blog site](https://gabinson200.github.io/blog/mindmap.html)

RSS: https://gabinson200.github.io/blog/feed.xml

## Semantic article graph

`semantic.html` places articles by meaning. You enter 1, 2, or 4 concepts and articles
are plotted by their similarity to them. It reads `semantic-index.json`, which holds the
chunk embeddings of every article in `articles.json`.

The index is rebuilt automatically by the "Update Semantic Index" GitHub Action whenever
a markdown file or `articles.json` changes. To rebuild it locally (Node 20+):

```sh
npm install
npm run build:embeddings            # only re-embeds articles whose markdown changed
npm run build:embeddings -- --force # re-embed everything
```

The first run downloads the `Xenova/all-MiniLM-L6-v2` model (about 23 MB) into `.cache/`.
