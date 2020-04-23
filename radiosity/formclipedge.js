export default class FormClipEdge {
  constructor() {
    this.next = null;           // Next clipper
    this.normal = null;         // Plane normal (Vector4)
    this.first = null;          // First vertex (Vector4)
    this.start = null;          // Start vertex (Vector4)
    this.firstInside = false;   // First vertex inside flag
    this.startInside = false;   // Start vertex inside flag
    this.firstFlag = false;     // FIrst vertex seen flag
  }

  isInside(v) {
    return this.normal.dot(v) >= 0;
  }

  intersect(s, e) {
    let r = e.sub(s);
    const d = this.normal.dot(r);
    r *= (Math.abs(d) > 0) ? (-this.normal.dot(s) / d) : 1;
    return s.add(r);
  }

  output(v, out) {
    if (this.next != null) this.next.clip(v, out);
    else out.addVertex(v);
  }

  clip(current, out) {
    const currentInside = this.isInside(current);
    if (!this.firstFlag) {
      this.first = current;
      this.firstInside = currentInside;
      this.firstFlag = true;
    } else {
      if (this.startInside ^ currentInside) this.output(this.intersect(this.start, current), out);
      if (currentInside) this.output(current, out);
      this.start = current;
      this.startInside = currentInside;
    }
  }

  close(out) {
    if (this.firstFlag) {
      if (this.startInside ^ this.firstInside) this.output(this.intersect(this.start, this.first), out);
      if (this.next != null) this.next.close(out);
      this.firstFlag = false;
    }
  }
}
