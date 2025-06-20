// src/folder-index.11ty.js
module.exports = class {
  data() {
    return {
      // Paginate OVER your directories (only those with children)
      pagination: {
        data:   "collections.navDirs",
        size:   1,
        alias:  "folder"
      },
      // Use the URL you already computed on each folder
      permalink: data => data.folder.url,
      layout:    "layouts/base.njk",
      eleventyExcludeFromCollections: true
    };
  }

  render({ folder }) {
    let list = folder.children
      .map(c=>`<li><a href="${c.url}" class="text-blue-600 hover:underline">${c.title}</a></li>`)
      .join("");
    return `
      <h1 class="text-3xl font-bold mb-4">${folder.title}</h1>
      <ul class="list-disc pl-6 space-y-2">${list}</ul>
    `;
  }
};
