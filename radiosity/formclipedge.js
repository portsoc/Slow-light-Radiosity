import Vector4 from './vector4.js';

const MIN_VALUE = 1e-10;

export default class FormClipEdge {
  constructor(normal) {
    this.normal = normal;       // Plane normal (Vector4)
    this.nextPlane = null;      // Next clipper

    this.first = new Vector4(); // First vertex
    this.start = new Vector4(); // Start vertex
    this.firstInside = false;   // First vertex inside flag
    this.startInside = false;   // Start vertex inside flag
    this.firstSeen = false;     // First vertex seen flag

    this.intersection = new Vector4(); // temporary object used in intersect()
  }

  setNext(next) { // public
    this.nextPlane = next;
  }

  isInside(v) {
    return this.normal.dot(v) >= 0;
  }

  intersect(s, e) {
    this.intersection.setTo(e).sub(s);
    const d = this.normal.dot(this.intersection);
    if (Math.abs(d) > MIN_VALUE) {
      this.intersection.scale(-this.normal.dot(s) / d);
    }
    return this.intersection.add(s);
  }

  output(v, out) {
    if (this.nextPlane != null) {
      this.nextPlane.clip(v, out);
    } else {
      out.addVertex(v);
    }
  }

  clip(current, out) { // public
    const currentInside = this.isInside(current);

    if (!this.firstSeen) {
      this.first.setTo(current);
      this.firstInside = currentInside;
      this.firstSeen = true;
    } else {
      // does edge intersect plane?
      if (this.startInside !== currentInside) {
        const intersection = this.intersect(this.start, current);
        this.output(intersection, out);
      }
    }
    if (currentInside) {
      this.output(current, out);
    }
    this.start.setTo(current);
    this.startInside = currentInside;
  }

  close(out) { // public
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
