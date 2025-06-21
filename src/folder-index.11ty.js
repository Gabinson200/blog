// src/folder-index.11ty.js
module.exports = class {
  data() {
    return {
      pagination: {
        data:  "collections.navDirs",
        size:  1,
        alias: "folder"
      },
      // We use the folder.url (like "/science/") as-is here.
      permalink: data => data.folder.url,
      layout:    "layouts/base.njk",
      eleventyExcludeFromCollections: true
    };
  }

  render({ folder, pathPrefix = "" }) {
    // pathPrefix === "/blog/" (both locally in Eleventy Serve and in Pages)
    let list = folder.children.map(child => {
      // Always prepend pathPrefix, then collapse "//" → "/"
      let href = (pathPrefix + child.url).replace(/\/{2,}/g, "/");

      return `
        <li>
          <a href="${href}"
             class="text-blue-600 hover:underline">
            ${child.title}
          </a>
        </li>
      `;
    }).join("");

    return `
      <h1 class="text-3xl font-bold mb-4">${folder.title}</h1>
      <ul class="pl-6 list-disc space-y-2">
        ${list}
      </ul>
    `;
  }
};
