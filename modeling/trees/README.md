# Generating trees

- `generate-tree.js` is the main script, see more comments there.
- `shapes.js` has functions that generate attraction points where a tree will grow
  - it uses seedrandom for repeatability
  - random number generator probably should be a parameter, actually
  - the shapes code is not very polished; `nRandomSpheres` is actually neither N nor random at the moment
- `tree-generator.js` defines the main tree growing algorithm
  - follows space colonisation algorithm as described in http://algorithmicbotany.org/papers/colonization.egwnp2007.large.pdf
- `scad-output.js` provides a function to output the tree into an OpenSCAD file
- `point.js` is a class for representing 3d points (and vectors from origin)

To create an OpenSCAD file with a tree, run
```sh
node generate-tree.js > tree.scad
```
