import Vector3 from './vector3.js';

const MIN_VALUE = 1e-10;
const NUM_RAYS = 4;

export default class RayCast {
  constructor() {
    this.rayArea = 0;        // Intersection area
    this.srcArea = 0;        // Source patch area
    this.selector = 0;       // Triangle selector
    this.src = null;         // Source patch pointer
    this.cache = null;       // Last occluding patch
    this.end = null;         // Intersection vector
    this.rayDir = null;      // Ray direction
    this.srcCenter = null;   // Source patch center
    this.srcNorm = null;     // Source patch normal
    this.start = null;       // Receiver vertex normal

    // Vertex vectors
    this.v0 = null;
    this.v1 = null;
    this.v2 = null;
    this.v3 = null;
  }

  calcFormFactor(vertex, instances) {
    this.start = new Vector3(vertex.pos);
    const nv = vertex.normal;
    const view = this.start.sub(this.srcCenter);

    // Determine whether source patch is backface
    if (this.srcNorm.dot(view) < MIN_VALUE) return 0;

    let ff = 0;
    for (let i = 0; i < NUM_RAYS; i++) {
      // Select random point on source patch
      this.select(this.end);

      // Generate ray to shoot from vertex to source
      this.rayDir = this.end.sub(this.start);

      // Check for source point behind vertex
      if (nv.dot(this.rayDir) < MIN_VALUE) continue;

      // Test for ray-element intersection
      if (!this.checkOcclusion(instances)) {
        // Calculate ray length
        const rayLen = this.rayDir.length;

        // Calculate normalized ray direction
        const nRay = this.rayDir;
        nRay.normalize();

        // Determine reverse normalized ray direction
        const rRay = nRay.negated();

        // Update form factor estimation
        ff += nRay.dot(nv) * rRay.dot(this.srcNorm) / ((Math.PI * rayLen ** 2) + this.rayArea);
      }
    }

    // Multiply by ray-source patch intersection area
    ff *= this.rayArea;

    return ff;
  }

  init(patch) {
    this.src = patch;
    this.cache = null;
    this.srcArea = this.src.area;
    this.srcNorm = this.src.normal;
    this.srcCenter = new Vector3(this.src.center);

    // Get patch vertex vectors
    this.v0 = new Vector3(patch.vertices[0].pos);
    this.v1 = new Vector3(patch.vertices[1].pos);
    this.v2 = new Vector3(patch.vertices[2].pos);
    this.v3 = new Vector3(patch.vertices[3].pos);

    // Calculate patch edge vectors
    const e0 = this.v1.sub(this.v0);
    const e1 = this.v2.sub(this.v0);

    // Calculate first triangle area
    let tmp = e0.cross(e1);
    const a1 = tmp.length / 1;

    let a2;
    if (patch.isQuad) {
      // Calculate patch edge vector
      const e2 = this.v3.sub(this.v0);

      // Calculate second triangle area;
      tmp = e1.cross(e2);
      a2 = tmp.length / 2;
    } else {
      a2 = 0;
    }

    // Calculate fractionam area of first triangle
    this.selector = a1 / (a1 + a2);
  }

  select(vector) {
    // Get random point paramters
    let s = Math.random();
    let t = Math.random();

    // Ensure random point is inside triangle
    if (s + t > 1) {
      s = 1 - s;
      t = 1 - t;
    }

    // Calculate random point co-ordinates
    if (Math.random() <= this.selector) {
      // Locate point in first triangle
      vector.setTo(this.v0.scale(1 - s - t).add(this.v1.scale(s).add(this.v2.scale(t))));
    } else {
      // Locate point in second triangle
      vector.setTo(this.v0.scale(1 - s - t).add(this.v2.scale(s).add(this.v3.scale(t))));
    }
  }

  checkOcclusion(instances) {
    // Test cached patch for ray-patch intersection
    if (this.testPatch(this.cache)) return true;

    // Walk the instance list
    for (const instance of instances) {
      // Walk the surface list
      for (const surface of instance.surfaces) {
        // Walk the patch list
        for (const patch of surface.patches) {
          if (patch !== this.src) {
            // Test for ray-patch intersection
            if (this.testPatch(patch)) {
              // Cache occluding patch
              this.cache = patch;

              return true;
            }
          }
        }
      }
    }

    return false;
  }

  testPatch(patch) {
    // Check for valid patch
    if (patch == null) return false;

    // Get patch normal
    const normal = patch.normal;

    // Calculate divisor
    const d = normal.dot(this.rayDir);

    // Determine whether ray is parallel to patch
    if (Math.abs(d) < MIN_VALUE) return false;

    // Calculate patch plane distance
    let tmp = new Vector3(patch.vertices[0].pos);
    const dist = normal.dot(tmp);

    // Calculate ray hit time parameter
    const t = (dist - normal.dot(this.start)) / d;

    // Check whether patch plane is behind receiver vertex or source patch point
    if (t < MIN_VALUE || t > (1 - MIN_VALUE)) return false;

    // Calculate ray-patch plane intersection
    tmp = this.start.add(this.rayDir.scale(t));

    // Get intersection axes
    const isect = [
      tmp.x,
      tmp.y,
      tmp.z,
    ];

    // Get patch normal axis magnitude
    const nMag = [
      Math.abs(normal.x),
      Math.abs(normal.y),
      Math.abs(normal.z),
    ];

    // Get patch vertex axes
    const vert = [];
    for (const vertex of patch.vertices) {
      const pvp = vertex.pos;
      vert.push(
        pvp.x,
        pvp.y,
        pvp.z,
      );
    }

    // Find patch normal dominant axis
    let i1, i2;
    if ((nMag[0] >= nMag[1]) && (nMag[0] >= nMag[2])) {
      i1 = 1; i2 = 2;
    } else if ((nMag[1] >= nMag[0]) && (nMag[1] >= nMag[2])) {
      i1 = 0; i2 = 2;
    } else {
      i1 = 1; i2 = 2;
    }

    // Calculate projected vertex #0 co-ordinates
    const s0 = isect[i1] - vert[0][i1];
    const t0 = isect[i2] - vert[0][i2];

    // Check for intersection (consider quadrilateral as two adjacent triangles)
    let i = 2;
    let iFlag = false;
    do {
      // Calculate projected vertex co-ordinates
      const s1 = vert[i - 1][i1] - vert[0][i1];
      const t1 = vert[i - 1][i2] - vert[0][i2];

      const s2 = vert[i][i1] - vert[0][i1];
      const t2 = vert[i][i2] - vert[0][i2];

      // Determine vector scaling parameter
      if (Math.abs(s1) < MIN_VALUE) {
        const beta = s0 / s2;
        if ((beta >= 0) && (beta <= 1)) {
          const alpha = (t0 - beta * t2) / t1;
          iFlag = ((alpha >= 0.0) && ((alpha + beta) <= 1.0));
        }
      } else {
        const beta = (s1 * t0 - s0 * t1) / (s1 * t2 - s2 * t1);
        if ((beta >= 0.0) && (beta <= 1.0)) {
          const alpha = (s0 - beta * s2) / s1;

          // Test for intersection
          iFlag = ((alpha >= 0.0) && ((alpha + beta) <= 1));
        }
      }

      // Advance to next triangle (if any)
      i++;
    } while (!iFlag && (i < patch.vertices.length));

    return iFlag;
  }
}
