/* istanbul ignore file */ // don't report as not covered by tests, we test these visually

import * as Rad from '../../radiosity/index.js';
import Transform3 from '../transform3.js';
import * as Cube from '../cube.js';

// create a room with a bench like in the book listing 6.13 page 430
// base size is 10 (the shorter side of the room)
// the book seems to use base size 1 but that's harder to work with
export default function createRoom613() {
  const room = makeRoom();
  const bench = makeBench();
  const light1 = makeLight();
  const light2 = makeLight();

  const l1x = new Transform3();
  l1x.translate(2, 1, 8);
  l1x.transform(light1);

  const l2x = new Transform3();
  l2x.translate(13.5, 1, 8);
  l2x.transform(light2);

  const bx = new Transform3();
  bx.scale(1.6, 1.6, 0.8);
  bx.rotate(0, 0, 90);
  bx.translate(15, 1, 0);
  bx.transform(bench);

  return new Rad.Environment([light1, light2, bench, room]);
}

function makeRoom(subdivision = 5) {
  const x = 16;
  const y = 10;
  const z = 10;

  const retval = Cube.unitCubeMultiSurface(subdivision);

  // The sides are in order of front (standing on x), back, right, left, top, bottom.
  retval.surfaces[0].reflectance.add(new Rad.Spectra(0.8, 0.8, 0.8)); // front
  retval.surfaces[1].reflectance.add(new Rad.Spectra(0.8, 0.8, 0.8)); // back
  retval.surfaces[2].reflectance.add(new Rad.Spectra(0.8, 0.8, 0.8)); // right
  retval.surfaces[3].reflectance.add(new Rad.Spectra(0.95, 0.0, 0.0)); // left
  retval.surfaces[4].reflectance.add(new Rad.Spectra(0.2, 0.3, 0.3)); // top (floor due to inversion scaling)
  retval.surfaces[5].reflectance.add(new Rad.Spectra(0.95, 0.95, 0.95)); // bottom (ceiling due to inv.scaling)

  const roomXform = new Transform3();
  roomXform.scale(x, y, -z);
  roomXform.translate(0, 0, z);
  roomXform.transform(retval);

  return retval;
}

// bench size 5 x 2.5 x 2.5
function makeBench() {
  // copied from the book
  const points = [
    new Rad.Point3(0.0, 0.0, 2.5),
    new Rad.Point3(2.5, 0.0, 2.5),
    new Rad.Point3(2.5, 2.5, 2.5),
    new Rad.Point3(0.0, 2.5, 2.5),
    new Rad.Point3(5.0, 0.0, 2.5),
    new Rad.Point3(5.0, 2.5, 2.5),
    new Rad.Point3(5.0, 0.0, 0.0),
    new Rad.Point3(5.0, 2.5, 0.0),
    new Rad.Point3(5.0, 2.5, 2.5),
    new Rad.Point3(5.0, 0.0, 2.5),
    new Rad.Point3(0.0, 0.0, 0.0),
    new Rad.Point3(0.0, 0.0, 2.5),
    new Rad.Point3(0.0, 2.5, 2.5),
    new Rad.Point3(0.0, 2.5, 0.0),
    new Rad.Point3(4.8, 0.0, 0.0),
    new Rad.Point3(4.8, 0.0, 2.3),
    new Rad.Point3(4.8, 2.5, 2.3),
    new Rad.Point3(4.8, 2.5, 0.0),
    new Rad.Point3(0.2, 0.0, 0.0),
    new Rad.Point3(0.2, 2.5, 0.0),
    new Rad.Point3(0.2, 2.5, 2.3),
    new Rad.Point3(0.2, 0.0, 2.3),
    new Rad.Point3(5.0, 0.0, 0.0),
    new Rad.Point3(5.0, 2.5, 0.0),
    new Rad.Point3(5.0, 2.5, 2.5),
    new Rad.Point3(5.0, 0.0, 2.5),
    new Rad.Point3(0.0, 0.0, 0.0),
    new Rad.Point3(0.0, 2.5, 0.0),
    new Rad.Point3(0.0, 2.5, 2.5),
    new Rad.Point3(0.0, 0.0, 2.5),
  ];

  const v = points.map(p => new Rad.Vertex3(p));

  const p0elements = [];
  const p1elements = [];
  const p2elements = [];
  const p3elements = [];
  const p4elements = [];
  const p5elements = [];
  const p6elements = [];
  const p7elements = [];
  const p8elements = [];
  const p9elements = [];
  const p10elements = [];
  const p11elements = [];
  const p12elements = [];
  const p13elements = [];

  p0elements.push(new Rad.Element3([v[0], v[1], v[2], v[2]]));
  p0elements.push(new Rad.Element3([v[0], v[2], v[3], v[3]]));
  p0elements.push(new Rad.Element3([v[4], v[2], v[1], v[1]]));
  p0elements.push(new Rad.Element3([v[4], v[5], v[2], v[2]]));
  p1elements.push(new Rad.Element3([v[6], v[7], v[8], v[8]]));
  p1elements.push(new Rad.Element3([v[6], v[8], v[9], v[9]]));
  p2elements.push(new Rad.Element3([v[10], v[11], v[12], v[12]]));
  p2elements.push(new Rad.Element3([v[10], v[12], v[13], v[13]]));
  p3elements.push(new Rad.Element3([v[14], v[15], v[16], v[17]]));
  p4elements.push(new Rad.Element3([v[18], v[19], v[20], v[21]]));
  p5elements.push(new Rad.Element3([v[21], v[20], v[16], v[15]]));
  p6elements.push(new Rad.Element3([v[17], v[16], v[24], v[23]]));
  p7elements.push(new Rad.Element3([v[16], v[20], v[28], v[24]]));
  p8elements.push(new Rad.Element3([v[19], v[27], v[28], v[20]]));
  p9elements.push(new Rad.Element3([v[14], v[17], v[23], v[22]]));
  p10elements.push(new Rad.Element3([v[26], v[27], v[19], v[18]]));
  p11elements.push(new Rad.Element3([v[14], v[22], v[25], v[15]]));
  p12elements.push(new Rad.Element3([v[21], v[15], v[25], v[29]]));
  p13elements.push(new Rad.Element3([v[26], v[18], v[21], v[29]]));

  const s0patches = [];
  const s1patches = [];
  const s2patches = [];
  const s3patches = [];

  s0patches.push(new Rad.Patch3([v[0], v[4], v[5], v[3]], p0elements));
  s1patches.push(new Rad.Patch3([v[6], v[7], v[8], v[9]], p1elements));
  s2patches.push(new Rad.Patch3([v[10], v[11], v[12], v[13]], p2elements));
  s3patches.push(new Rad.Patch3([v[14], v[15], v[16], v[17]], p3elements));
  s3patches.push(new Rad.Patch3([v[18], v[19], v[20], v[21]], p4elements));
  s3patches.push(new Rad.Patch3([v[21], v[20], v[16], v[15]], p5elements));
  s3patches.push(new Rad.Patch3([v[17], v[16], v[24], v[23]], p6elements));
  s3patches.push(new Rad.Patch3([v[16], v[20], v[28], v[24]], p7elements));
  s3patches.push(new Rad.Patch3([v[19], v[27], v[28], v[20]], p8elements));
  s3patches.push(new Rad.Patch3([v[14], v[17], v[23], v[22]], p9elements));
  s3patches.push(new Rad.Patch3([v[26], v[27], v[19], v[18]], p10elements)); // fixed v10 to 26 so surfaces don't share vertices
  s3patches.push(new Rad.Patch3([v[14], v[22], v[25], v[15]], p11elements));
  s3patches.push(new Rad.Patch3([v[21], v[15], v[25], v[29]], p12elements));
  s3patches.push(new Rad.Patch3([v[26], v[18], v[21], v[29]], p13elements));

  const s0 = new Rad.Surface3(new Rad.Spectra(0.5, 0.2, 0.7), null, s0patches);
  const s1 = new Rad.Surface3(new Rad.Spectra(0.0, 0.8, 0.3), null, s1patches);
  const s2 = new Rad.Surface3(new Rad.Spectra(0.0, 0.8, 0.3), null, s2patches);
  const s3 = new Rad.Surface3(new Rad.Spectra(0.0, 0.3, 0.0), null, s3patches);

  return new Rad.Instance([s0, s1, s2, s3]);
}

function makeLight() {
  const x = 0.5;
  const y = 8;
  const z = 0.2;

  // lightness
  const L = 1;

  const retval = Cube.unitCubeMultiSurface([1, 15, 1]);

  // The sides are in order of front (standing on x), back, right, left, top, bottom.
  retval.surfaces[0].reflectance.add(new Rad.Spectra(0.0, 0.0, 0.5)); // front
  retval.surfaces[1].reflectance.add(new Rad.Spectra(0.0, 0.0, 0.5)); // back
  retval.surfaces[2].reflectance.add(new Rad.Spectra(0.0, 0.0, 0.5)); // right
  retval.surfaces[3].reflectance.add(new Rad.Spectra(0.0, 0.0, 0.5)); // left
  retval.surfaces[4].emittance.add(new Rad.Spectra(L * 0.5, L * 0.5, L * 0.5)); // top
  retval.surfaces[5].emittance.add(new Rad.Spectra(L, L, L)); // bottom

  const roomXform = new Transform3();
  roomXform.scale(x, y, z);
  roomXform.transform(retval);

  return retval;
}
