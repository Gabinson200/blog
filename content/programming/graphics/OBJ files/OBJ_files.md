# OBJ files

**Resources**:  
[scratch-a-pixel obj files](https://www.scratchapixel.com/lessons/3d-basic-rendering/obj-file-format/obj-file-format.html)  
[CMU obj files](https://www.cs.cmu.edu/~mbz/personal/graphics/obj.html)  
[Paul Bourke](https://paulbourke.net/dataformats/obj/)  
[Paul Bourke .obj specs](https://paulbourke.net/dataformats/obj/obj_spec.pdf)  


In my little graphics engine for an ESP32 I currently have the following definition for a mesh structure:

```cpp
// ---------- Mesh Definition ----------
typedef struct {
    // Vertex Data (VBO)
    vertex_t* vertices;
    uint16_t   vertex_count;
    
    // Index Data (EBO)
    uint16_t* indices;       
    uint32_t   index_count;   
    
    // Primitive Batches
    submesh_t* batches;       
    uint16_t   batch_count;   
    
    // Transform & Bounds
    mat4f_t    model_matrix; 
    vec4f_t    bounds_center; 
    float      bounds_radius; 
} mesh_t;

// where each vertex_t is defined as

typedef struct {
    vec3f_t  pos;      
    vec3f_t  normal;   
    vec2f_t  uv;       
    Color565 color;    
} vertex_t;

// and each submesh has a primitive type:

typedef enum {
    PRIM_TRIANGLES,      // Standard list: v0, v1, v2, v3, v4, v5...
    PRIM_TRIANGLE_STRIP, // Linked strip: v0, v1, v2 -> (0,1,2), (1,3,2)...
    PRIM_TRIANGLE_FAN    // Fan from center: v0, v1, v2 -> (0,1,2), (0,2,3)...
} PrimitiveType;

typedef struct {
    PrimitiveType type;
    uint32_t      start_index; // Offset into mesh->indices
    uint32_t      index_count; // Number of indices in this batch
} submesh_t;
```

The Primitive type allows for submeshes arranged for optimizing space using: standard lists, strips, and fans.

The question is given this format of storing meshes how can I transform an .obj file to this format and for that matter what IS and .obj file?

## What is an obj file

.obj file format is one of the oldest file formats being created in 1984. It is used throughout different graphics and design industries for its simplicity and ability to be tweaked and reinterpreted. 


In .obj the vertex data provides surface coordinates for:
- geometric vertices (v) 3f (x, y, z)
- texture vertices (vt) 2f (u, v)
- vertex normals (vn) 3f (i, j, k)
Note: a right hand coordinate system is used.

Additionally:
- faces (f) are defined by $n$ vertex indices for $n$ sided faces where, each vertex can include its position and/or normal and/or texture coordinate.
Note that the face stores integer values for the vertex indices, not the float positions themselves and .obj uses 1-based index values not 0 like in most list / array comprehension.

Comment lines are denoted with "#" symbols and "g" can be used to define labels for groups which allows users to annotate different sections of faces or collections of indices as belonging to separate sub-meshes. 
For example if I have a character mesh some vertex indices can be labeled with "head" or "torso" to denote what part of the model they belong to.

ex:
```.obj

v 0.000000 2.000000 2.000000
v 0.000000 0.000000 2.000000
v 2.000000 0.000000 2.000000
v 2.000000 2.000000 2.000000
v 0.000000 2.000000 0.000000
v 0.000000 0.000000 0.000000
v 2.000000 0.000000 0.000000
v 2.000000 2.000000 0.000000
# 8 vertices

g front_cube
f 1 2 3 4
g back_cube
f 8 7 6 5
g right_cube
f 4 3 7 8
g top_cube
f 5 1 4 8
g left_cube
f 5 6 2 1
g bottom_cube
f 2 6 7 3
# 6 elements
```

Usually, .obj files define a mesh by grouping information in this order:

- obj1
    - obj1 vertices (pos, uv, norm)
    - obj1 face indices
- obj2
    - obj2 vertices (pos, uv, norm)
    - obj2 face indices

... So on


Here is my shitty python code to parse a .obj file into a .h file for my microcontroller.
The only additional thing I do is use a fan to break up quads and polygons into a triangle so 
if in the .obj file a face has more than 3 vertices it can still be processed.

```py
# Simple OBJ to C Header converter for vertex buffers

import sys

def parse_obj(filename):
    vertices = [] # List of (x,y,z)
    normals = []  # List of (x,y,z)
    uvs = []      # List of (u,v)
    
    # Final buffers
    final_verts = [] 
    final_indices = []
    
    # Maps "v/vt/vn" string to index in final_verts
    # This is needed because OBJ allows a position to be
    # shared across five faces with different UVs/normals
    unique_map = {} 
    
    try:
        with open(filename, 'r') as f:
            # for each line in file
            for line in f:
                parts = line.split()
                if not parts: continue
                
                if parts[0] == 'v':
                    vertices.append([float(x) for x in parts[1:4]])
                elif parts[0] == 'vn':
                    normals.append([float(x) for x in parts[1:4]])
                elif parts[0] == 'vt':
                    uvs.append([float(x) for x in parts[1:3]])
                elif parts[0] == 'f':
                    # Triangulate simple fans if face is > 3 verts
                    face_verts = parts[1:] # e.g. ["1/1/1", "2/2/1", "3/3/1", "4/4/1"] for a plane quad
                    for i in range(1, len(face_verts) - 1):
                        # Create the triangle represented by this face
                        tri = [face_verts[0], face_verts[i], face_verts[i+1]] # eg ["1/1/1", "3/3/1", "4/4/1"]
                        # Process each vertex in the triangle
                        for t in tri: # eg "1/1/1"
                            if t not in unique_map: # if we haven't seen this combo of v/vt/vn before:
                                # Parse v/vt/vn
                                v_idx, vt_idx, vn_idx = 0, 0, 0
                                comps = t.split('/') # eg ["1", "1", "1"]
                                v_idx = int(comps[0]) - 1 # OBJ is 1-based indexing
                                if len(comps) > 1 and comps[1]: vt_idx = int(comps[1]) - 1
                                if len(comps) > 2 and comps[2]: vn_idx = int(comps[2]) - 1
                                
                                # Construct Vertex by looking up position, normal, uv
                                pos = vertices[v_idx]
                                nrm = normals[vn_idx] if vn_idx < len(normals) else [0,0,0]
                                uv  = uvs[vt_idx] if vt_idx < len(uvs) else [0,0]
                                
                                unique_map[t] = len(final_verts) # assign next index in final_verts to this unique combo
                                final_verts.append({'pos': pos, 'norm': nrm, 'uv': uv})

                            # whether new or seen before, append the index for this vertex to final_indices
                            final_indices.append(unique_map[t])

    except FileNotFoundError:
        print(f"Error: File {filename} not found.")
        return

    # Output C Header format
    print(f"// Generated from {filename}")
    print("#pragma once")
    print('#include "gfx_types.h"')
    print(f"const int mesh_v_count = {len(final_verts)};")
    print(f"const int mesh_i_count = {len(final_indices)};")
    
    print("const vertex_t mesh_vertices[] = {")
    for v in final_verts:
        p, n, u = v['pos'], v['norm'], v['uv']
        # Note: Color defaults to white (0xFFFF)
        print(f"    {{ {{ {p[0]:.4f}f, {p[1]:.4f}f, {p[2]:.4f}f }}, "
              f"{{ {n[0]:.4f}f, {n[1]:.4f}f, {n[2]:.4f}f }}, "
              f"{{ {u[0]:.4f}f, {u[1]:.4f}f }}, 0xFFFF }},")
    print("};")
    
    print("const uint16_t mesh_indices[] = {")
    for i in range(0, len(final_indices), 12):
        chunk = final_indices[i:i+12]
        print("    " + ", ".join(str(idx) for idx in chunk) + ",")
    print("};")

if __name__ == "__main__":
    print("Usage: python obj2header.py < model.obj>")
    if len(sys.argv) < 2:
        print("Usage: python obj2header.py < model.obj>")
    else:
        parse_obj(sys.argv[1])
```

