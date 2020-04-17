import * as Rad from '../radiosity/index.js';

/*
 * Take the quad defined by the given array of 4 vertices,
 * and generate `size` x `size` subdivisions as Element3 instances.
 * The given vertices form the corners of the subdivisions and
 * are used by the corner elements.
 */
export function quad(vertices, size = 1) {
  if (size <= 1) return [new Rad.Element3(vertices)];

  const grid = generateVertexGrid(vertices, size);
  const retval = [];

  for (let x = 0; x < size; x += 1) {
    for (let y = 0; y < size; y += 1) {
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

/*
 * generates a grid with n x n squares (so every side has n+1 vertices)
 *
 * ^ y
 * |
 * 0,n .... n,n
 * :        :
 * :        :
 * 0,0 .... n,0 --> x
 */
function generateVertexGrid(corners, n) {
  // start with empty (n+1 x n+1) 2D array
  const grid = [];
  for (let i = 0; i <= n; i += 1) grid[i] = [];

  // put corners in
  grid[0][0] = corners[0];
  grid[n][0] = corners[1];
  grid[n][n] = corners[2];
  grid[0][n] = corners[3];

  // fill in left and right side
  gridVLine(0, n, grid);
  gridVLine(n, n, grid);

  // fill in the rest
  for (let i = 0; i <= n; i += 1) {
    gridHLine(i, n, grid);
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
