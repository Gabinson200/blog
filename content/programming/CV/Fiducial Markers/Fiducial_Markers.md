## Resources
[april tag github](https://github.com/AprilRobotics/apriltag), 
[apriltag 1](https://april.eecs.umich.edu/media/pdfs/olson2011tags.pdf), 
[apriltag 2](https://april.eecs.umich.edu/pdfs/wang2016iros.pdf), 
[apriltag 3](https://april.eecs.umich.edu/papers/details.php?name=krogius2019iros) 

# Fiducial markers

Fiducial markers are special markers widely used in robotics and AR that can be placed in a scene to provide extra information. These markers are designed to be easily identifiable and given the known size, position, or orientation can be used to provide the system with relative position and / or orientation information. Fiducial markers look similar to QR codes but whereas QR codes are optimized mainly for the transfer of information fiducial markers are optimized for automatic detection and localization. Furthermore, in most use cases more than one marker is used to improve localization. The two main stages necessarily involved in the use of fiducial markers are: 
- Marker detection: Finding where a marker is i an image.
- Information Extraction: Reading the payload off the marker, such as tag id.

Once the marker is detected and identified other algorithms can be use to find the relative distance and orientation to the marker(s). 


# Apriltags

The first Apriltag paper was published in 2016 by Edwin Olson at the University of Michigan.

## (AprilTag 1) Tag Detector:
The tag detector has three main parts, line fitting, quad detection, and homography / extrinsics estimation.

### Line Fitting:
 - Turn image into black and white
 - Apply low pass filter / Gaussian blur
 - Compute per-pixel gradient direction and magnitude
 - Use graph based clustering algorithm like [Felzenszwalb]() to merge pixels into components. 
 - fit line segments to components using least-squares procedure 
 - Adjust line segments so the darker side of the line is on its left and the light side is on the right. This allows us to enforce a winding rule around each quad which will be useful later.

The line fitting phase is the slowest phase in the tag detection scheme and can be improved by halving the input image resolution to reduce pixels at the loss of granularity. 

### Quad Detection:
 - Create a tree where the first layer nodes are all the found lines
 - For the following three layers the child of a node (line) are all lines "close enough" to the end of the parent line segment and obey a CC winding rule. 
 - close enough = 2 x parent line length + 5 pixels
 - We populate the 4 layer tree as described and can use depth first search to extract quads. 

The quad detection phase is quite fast and requires minimal computational requirements. 

### Homography and extrinsic estimation

We use Direct Linear Transform (DLT) to map 2D homogeneous points in the tag's coordinate system where the origin is the center of the tag, to the 2D image coordinate system. We can compute the tag's position and orientation if we know the camera's focal length and physical tag size. 

## (AprilTag 2) Tag Detector:

The second paper is basically all about optimizing the tag detection phase by improving detection rates and lowering computational time.

- grayscale image into black and white-image
- Tile the image into regions of 4x4 pixels and find local min-max for each tile and find extrema of 3x3 sets of tiles to be used in adaptive thresholding
-  Assign each pixel as black if its above the threshold $(max+min)/2$ and white otherwise, regions with insufficient contrasta re excluded from future processing
- Use union-find algorithm to connect pixels into enumerated components
- connect nearby components using hash table
-  use Harris corner detection to find corners
- iterate through all permutations of four candidate corner points and fit fit lines to them, select the candidate lines which minimize MSE
- we prefilter poor quad fits by rejecting those with less than 4 corners, too large MSE, or corner angles which are >> 90 degrees (careful of projection)
- we can do optional edge refinement by taking the gradient along the found quad edges and using the gradient magnitude along the normal and winding number to remove nearby noisy pixels. (edge refinement can help with pose estimation)


Pseudo code for finding boundaries:
```
function find_boundaries(im, w, h):
    // Find connected components using union-find
    uf = union_find(w * h)
    for each pixel (x, y):
        for each neighbor (x', y'):
            if im[x,y] = im[x', y'] : uf.union(y*w + x, y' * w + x')

    // Group components into continuous boundary
    h = HashTable()
    for each pixel (x, y):
        for each neighbor (x', y'):
            if im[x,y] != im[x', y']:
                r_0 = uf.find(y*w + x)
                r_1 = uf.find(y'*w + x')
                id = concatenateBits(sort(r_0, r_1))
                if (id DNE in h): h[id] = list
                p = ((x+x')/2, (y+y')/2)
                h[id].append(p)

// Neighbors of a pixel are its 8-adjacent pixels
```


## Coding System:

| Family | Gen | Layout | N | H | IDs (ncodes) | ID bits $\,\log_2(\text{ncodes})\,$ | Errors $\,\left\lfloor\frac{H-1}{2}\right\rfloor\,$ | Notes |
|:--|--:|:--|--:|--:|--:|--:|--:|:--|
| `tag16h5` | 2 | Classic square | 16 | 5 | 30 | $\approx 4.91$ | 2 | Small dictionary; fast |
| `tag25h9` | 2 | Classic square | 25 | 9 | 35 | $\approx 5.13$ | 4 | Still small ID count |
| `tag36h10` | 2 | Classic square | 36 | 10 | 2320 | $\approx 11.18$ | 4 | Much larger than `36h11` |
| `tag36h11` | 2 | Classic square | 36 | 11 | 587 | $\approx 9.20$ | 5 | Common legacy family |
| `tagCircle21h7` | 3 | Circle | 21 | 7 | 38 | $\approx 5.25$ | 3 | Circular form factor |
| `tagCircle49h12` | 3 | Circle | 49 | 12 | 65535 | $\approx 16.00$ | 5 | Very large dictionary |
| `tagCustom48h12` | 3 | Custom | 48 | 12 | 42211 | $\approx 15.37$ | 5 | “Hole/recursive” style |
| `tagStandard41h12` | 3 | Standard | 41 | 12 | 2115 | $\approx 11.05$ | 5 | Recommended default |
| `tagStandard52h13` | 3 | Standard | 52 | 13 | 48714 | $\approx 15.57$ | 6 | Many IDs |


