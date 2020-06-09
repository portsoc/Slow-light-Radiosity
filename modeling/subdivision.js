import * as Rad from '../radiosity/index.js';

/*
 * Take the quad defined by the given array of 4 vertices,
 * and generate `sizes[0]` x `sizes[1]` subdivisions as Element3 instances.
 * If sizes is a single number, it will be used for both directions.
 * The given vertices form the corners of the subdivisions and
 * are used by the corner elements.
 *
 * sizes=[4,2]
 * 3 -+--+--+- 2
 * |  |  |  |  |
 * +--+--+--+--+
 * |  |  |  |  |
 * 0 -+--+--+- 1
 *
 * sizes=[1,3]
 * 3 -- 2
 * |    |
 * +----+
 * |    |
 * +----+
 * |    |
 * 0 -- 1
 */
export function quadElements(vertices, sizes = [1, 1]) {
  if (typeof sizes === 'number') sizes = [sizes, sizes];

  const [sizex, sizey] = sizes;

  if (sizex <= 1 && sizey <= 1) return [new Rad.Element3(vertices)];

  const grid = generateVertexGrid(vertices, sizex, sizey);
  const retval = [];

  for (let x = 0; x < sizex; x += 1) {
    for (let y = 0; y < sizey; y += 1) {
      retval.push(new Rad.Element3([
        grid[x][y],
        grid[x + 1][y],
        grid[x + 1][y + 1],
        grid[x][y + 1],
      ]));
    }
  }

  return retval;
}

/* same as quadElements but returns an array of patches,
 * each with one element of those above.
 */
export function quadPatches(vertices, sizes = [1, 1]) {
  if (typeof sizes === 'number') sizes = [sizes, sizes];

  const [sizex, sizey] = sizes;

  if (sizex <= 1 && sizey <= 1) {
    const el = new Rad.Element3(vertices);
    return [new Rad.Patch3(vertices, [el])];
  }

  const grid = generateVertexGrid(vertices, sizex, sizey);
  const retval = [];

  for (let x = 0; x < sizex; x += 1) {
    for (let y = 0; y < sizey; y += 1) {
      const vertices = [
        grid[x][y],
        grid[x + 1][y],
        grid[x + 1][y + 1],
        grid[x][y + 1],
      ];
      const el = new Rad.Element3(vertices);
      retval.push(new Rad.Patch3(vertices, [el]));
    }
  }

  return retval;
}

/*
 * generates a grid with n x n squares (so every side has n+1 vertices)
 *
 * ^ y
 * |
 * 0,ny ... nx,ny
 * :        :
 * :        :
 * 0,0 .... nx,0 --> x
 */
function generateVertexGrid(corners, nx, ny) {
  // start with empty (nx+1 x ny+1) 2D array
  const grid = [];
  for (let i = 0; i <= nx; i += 1) grid[i] = [];

  // put corners in
  grid[0][0] = corners[0];
  grid[nx][0] = corners[1];
  grid[nx][ny] = corners[2];
  grid[0][ny] = corners[3];

  // fill in left and right side
  gridVLine(0, ny, grid);
  gridVLine(nx, ny, grid);

  // fill in the rest
  for (let i = 0; i <= ny; i += 1) {
    gridHLine(i, nx, grid);
  }

  return grid;
}

// vertical line (parallel to Y axis) where the end points are already there
function gridVLine(x, n, grid) {
  const points = subdivideVertexLine(grid[x][0], grid[x][n], n);

  for (let y = 1; y < n; y += 1) {
    grid[x][y] = points[y];
  }
}

function gridHLine(y, n, grid) {
  const points = subdivideVertexLine(grid[0][y], grid[n][y], n);

  for (let x = 1; x < n; x += 1) {
    grid[x][y] = points[x];
  }
}

// return an array of n+1 vertices from (and including) start to end
function subdivideVertexLine(start, end, n) {
  const cachedSubdivision = getCachedSubdivision(start, end, n);
  if (cachedSubdivision) return cachedSubdivision;

  // compute new subdivision
  const retval = [start];

  const s = start.pos; // start
  const v = new Rad.Vector3(start.pos, end.pos);

  for (let i = 1; i < n; i += 1) {
    const vi = new Rad.Vector3(v); // vector to i-th point
    vi.scale(i).div(n); // allows precise integer arithmetic

    const pi = new Rad.Point3(s); // i-th point
    pi.addVector(vi);

    retval.push(new Rad.Vertex3(pi));
  }
  retval.push(end);

  cacheSubdivision(start, end, n, retval);
  cacheSubdivision(end, start, n, retval.slice().reverse());
  return retval;
}

const subdivisionCache = new WeakMap();

function getCachedSubdivision(start, end, n) {
  const startCache = subdivisionCache.get(start);
  if (!startCache) return null;

  const endCache = startCache.get(end);
  if (!endCache) return null;

  const cachedSubdivision = endCache.get(n);
  return cachedSubdivision;
}

function cacheSubdivision(start, end, n, retval) {
  if (!subdivisionCache.has(start)) subdivisionCache.set(start, new WeakMap());
  const startCache = subdivisionCache.get(start);

  if (!startCache.has(end)) startCache.set(end, new Map());
  const endCache = startCache.get(end);

  endCache.set(n, retval);
}

// subdivide a triangle into patches with maximum side length `maxLength`
export function trianglePatchesToSize(vertices, maxLength, result = []) {
  if (len(vertices[0], vertices[1]) <= maxLength &&
      len(vertices[1], vertices[2]) <= maxLength &&
      len(vertices[0], vertices[2]) <= maxLength) {
    result.push(makePatch(vertices));
    return result;
  }

  // find the biggest internal angle
  const angles = getAngles(vertices);
  const maxIndex = findMaxIndex3(angles);

  // set vertices ABC so the angle at A is the widest
  const a = vertices[maxIndex];
  const b = vertices[(maxIndex + 1) % 3];
  const c = vertices[(maxIndex + 2) % 3];

  // side BC is the longest so we will subdivide it
  const segments = Math.ceil(len(b, c) / maxLength);
  const subBC = subdivideVertexLine(b, c, segments);

  // find subdivision point closest to A
  let d = subBC[1];
  let dDist = len(a, d);
  for (let i = 2; i < segments; i += 1) {
    const dist = len(a, subBC[i]);
    if (dist < dDist) {
      d = subBC[i];
      dDist = dist;
    }
  }

  // recursively subdivide the resulting two triangles
  trianglePatchesToSize([a, b, d], maxLength, result);
  trianglePatchesToSize([a, d, c], maxLength, result);
  return result;
}

// length of side between vertices
function len(v1, v2) {
  const retval = v1.pos.dist(v2.pos);
  // console.log(`len ${retval}`);
  return retval;
}

function makePatch(vertices) {
  return new Rad.Patch3(vertices);
}

// in a triangle defined by vertices, compute angles at each point
// returns an array of angles (numbers in radians)
function getAngles(vertices) {
  // side vectors
  const s01 = new Rad.Vector3(vertices[0].pos, vertices[1].pos);
  const s02 = new Rad.Vector3(vertices[0].pos, vertices[2].pos);
  const s12 = new Rad.Vector3(vertices[1].pos, vertices[2].pos);
  const s21 = new Rad.Vector3(vertices[2].pos, vertices[1].pos);

  return [
    getAngle(s01, s02),
    getAngle(s21, s01),
    getAngle(s02, s12),
  ];
}

function getAngle(vect1, vect2) {
  return Math.acos(vect1.dot(vect2) / vect1.length / vect2.length);
}

// find the index of the largest element in array of 3 numbers
function findMaxIndex3(arr3) {
  return arr3[0] > arr3[1]
    ? (arr3[0] > arr3[2] ? 0 : 2)
    : (arr3[1] > arr3[2] ? 1 : 2);
}

export const _testing = {
  len,
  makePatch,
  getAngles,
  getAngle,
  findMaxIndex3,
};
