# glTF 

This article is more or less just for me to learn more about the glTF file format as I would like to use it to define and import, scenes, textures, meshes, lights, animations, etc into my 3D renderer.


I will be basing off my notes from this resource:
https://github.com/KhronosGroup/glTF-Tutorials/tree/main

I will likely not go into detail on every feature of glTF only the ones I wish to use for my own purposes. 


# glTF Basics

The basis structure of glTf is a JSON file which describes a scene graph made up of a hierarchy of nodes. 

---

Summary of scene elements lifted directly from documentation:

- The `scene` is the entry point for the description of the scene that is stored in the glTF. It refers to the nodes that define the scene graph.

- The `node` is one node in the scene graph hierarchy. It can contain a transformation (e.g., rotation or translation), and it may refer to further (child) nodes. Additionally, it may refer to mesh or camera instances that are "attached" to the node, or to a skin that describes a mesh deformation.

- The `camera` defines the view configuration for rendering the scene.

- A `mesh` describes a geometric object that appears in the scene. It refers to accessor objects that are used for accessing the actual geometry data, and to materials that define the appearance of the object when it is rendered.

- The `skin` defines parameters that are required for vertex skinning, which allows the deformation of a mesh based on the pose of a virtual character. The values of these parameters are obtained from an accessor.
(We will not focus on skins as my renderer does not support skinning)

- An `animation` describes how transformations of certain nodes (e.g., rotation or translation) change over time.

- The `accessor` is used as an abstract source of arbitrary data. It is used by the mesh, skin, and animation, and provides the geometry data, the skinning parameters and the time-dependent animation values. It refers to a bufferView, which is a part of a buffer that contains the actual raw binary data.

- The `material` contains the parameters that define the appearance of an object. It usually refers to texture objects that will be applied to the rendered geometry.

- The `texture` is defined by a sampler and an image. The sampler defines how the texture image should be placed on the object.

---

As stated above buffers contain the raw binary data that actually define the geometry, texture, and other heavier assets. The JSON simply links to the asset files (likely binary or .obj for meshes and .jpg or .png for textures and images). 

Ex:
A buffer contains a URI that points to a file containing the raw, binary buffer data:
```
"buffer01": {
    "byteLength": 12352,
    "type": "arraybuffer",
    "uri": "buffer01.bin"
}
```
This binary data is just a raw block of memory that is read from the URI of the buffer, with no inherent meaning or structure. Buffers, BufferViews, and Accessors define how the raw data is extended with information about data types and the data layout.


I think instead of continuing to write more about glTF I will simply write down noteworthy information I find as I continue reading the tutorial / documentation as it is very well made.

---

