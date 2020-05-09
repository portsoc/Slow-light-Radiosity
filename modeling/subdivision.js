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
