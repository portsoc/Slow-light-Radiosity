/* istanbul ignore file */ // don't report as not covered by tests, we test these visually

import * as Rad from '../../radiosity/index.js';
import Transform3 from '../transform3.js';
import { trianglePatchesToSize } from '../subdivision.js';

const WHITE = new Rad.Spectra(1, 1, 1);

// ten subdivided triangles
export default function createTriangles(minLength = 1) {
  const instances = [];
  for (let i = 0; i < 10; i += 1) {
    const vertices = [v(), v(), v()];
    const patches = trianglePatchesToSize(vertices, minLength);
    const surface = new Rad.Surface3(WHITE, null, patches);
    const instance = new Rad.Instance([surface]);

    // move to a random place so the triangles are more spread out
    const tx = new Transform3();
    tx.translate(i * minLength * 5, 0, 0);
    tx.transform(instance);

    instances.push(instance);
  }

  return new Rad.Environment(instances);


  // random position ±5x minLengths
  function p() {
    return (Math.random() - 0.5) * 10 * minLength;
  }

  // random vertex in XZ plane
  function v() {
    return new Rad.Vertex3(new Rad.Point3(p(), 0, p()));
  }
}
