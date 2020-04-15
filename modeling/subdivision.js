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
  const start = grid[x][0].pos;
  const end = grid[x][n].pos;
  const v = new Rad.Vector3(start, end);

  for (let y = 1; y < n; y += 1) {
    grid[x][y] = vertexAlongVector(start, v, y, n);
  }
}

function gridHLine(y, n, grid) {
  const start = grid[0][y].pos;
  const end = grid[n][y].pos;
  const v = new Rad.Vector3(start, end);

  for (let x = 1; x < n; x += 1) {
    grid[x][y] = vertexAlongVector(start, v, x, n);
  }
}

function vertexAlongVector(start, v, i, n) {
  const vy = new Rad.Vector3(v);
  vy.scale(i).div(n); // allows precise integer arithmetic

  // copy start point, add scaled vector
  const point = new Rad.Point3(start);
  point.addVector(vy);

  return new Rad.Vertex3(point);
}
