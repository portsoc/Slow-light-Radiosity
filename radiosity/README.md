# Radiosity implementation

These classes implement the environment and radiosity algorithm from the book.

## Constructing models

The environment model is the same as in the book: an Environment has any number of Instances, each Instance has one or more Surfaces, each Surface is divided into planar Patches, each Patch can be divided into Elements in the same plane, each Patch and each Element has three or four Vertices.

The following is the proper sequence in which a model should be constructed (when parsing model files or creating models in code):

1. create vertices
   * Note: vertices should be reused between elements and patches of a single sufrace as appropriate, but not between surfaces
2. create elements with their vertices
   * element automatically tells each vertex that the vertex is used by this element
3. create patches with vertices and elements
   * patch tells each element that it is its parentPatch
   * a patch can be created without elements, in which case it creates one element with the same vertices as the patch – i.e. no subdivision
4. create surfaces with exitance and emitance and the list of patches
   * surface tells each patch that it is its parentSurface
5. create instance with surfaces
6. create environment with instances
   * to check whether any vertices in the environment are shared by multiple surfaces (which shouldn't happen), call `environment.checkNoVerticesAreShared()`

## Notable differences from the book

1. instead of linked lists, we use arrays
2. we don't have `Space3`, `Spheric3` coordinates; handling colours is in the front-end and not around `Spectra`; we don't have any code for gamma correction or colour reduction techniques
3. list of instance vertices is built on demand, not precomputed
   * the `vertices` getter returns an array of all the vertices in all the instance's surfaces, without repetition (even if patches and elements share vertices)
4. the code has some limited type checking, not as much as C++ would give us
5. we don't attempt to hide implementation details much even though modern JS has private class fields
6. we use chainable mutator methods instead of operator overloading
7. we need to be careful when transcribing the book code to note when a value is being copied vs assigned by reference
8. we do not support the file format from the book
