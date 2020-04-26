import Vector4 from './vector4.js';

const MIN_VALUE = 1e-10;

export default class FormClipEdge {
  constructor(normal, next) {
    this.normal = normal;       // Plane normal (Vector4)
    this.nextPlane = next;      // Next clipper

    this.first = null;          // First vertex (Vector4)
    this.start = null;          // Start vertex (Vector4)
    this.firstInside = false;   // First vertex inside flag
    this.startInside = false;   // Start vertex inside flag
    this.firstSeen = false;     // First vertex seen flag
  }

  isInside(v) {
    return this.normal.dot(v) >= 0;
  }

  intersect(s, e) {
    const r = new Vector4(e).sub(s);
    const d = this.normal.dot(r);
    if (Math.abs(d) > MIN_VALUE) {
      r.scale(-this.normal.dot(s) / d);
    }
    return r.add(s);
  }

  output(v, out) {
    if (this.nextPlane != null) {
      this.nextPlane.clip(v, out);
    } else {
      out.addVertex(v);
    }
  }

  clip(current, out) {
    const currentInside = this.isInside(current);

    if (!this.firstSeen) {
      this.first = current;
      this.firstInside = currentInside;
      this.firstSeen = true;
    } else {
      // does edge intersect plane?
      if (this.startInside !== currentInside) {
        const intersection = this.intersect(this.start, current);
        this.output(intersection, out);
      }
      if (currentInside) {
        this.output(current, out);
      }
      this.start = current;
      this.startInside = currentInside;
    }
  }

  close(out) {
    if (this.firstSeen) {
      // does edge intersect plane?
      if (this.startInside !== this.firstInside) {
        const intersection = this.intersect(this.start, this.first);
        this.output(intersection, out);
      }
      if (this.nextPlane != null) {
        this.nextPlane.close(out);
      }
      // reset for next run
      this.firstSeen = false;
    }
  }
}
