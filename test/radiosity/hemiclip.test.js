import FormClipEdge from '../../radiosity/formclipedge.js';
import FormPoly from '../../radiosity/formpoly.js';
import HemiClip, { FACES, TOP, FRONT, RIGHT, BACK, LEFT } from '../../radiosity/hemiclip.js';
import Vector3 from '../../radiosity/vector3.js';
import Vertex3 from '../../radiosity/vertex3.js';
import Point3 from '../../radiosity/point3.js';
import Patch3 from '../../radiosity/patch3.js';
import Element3 from '../../radiosity/element3.js';

const randomNumbers = [0.5, 0.9, 0.5];
let nextRandomNumberIndex = 0;
function nextRandomNumber() {
  const retval = randomNumbers[nextRandomNumberIndex];
  nextRandomNumberIndex = (nextRandomNumberIndex + 1) % randomNumbers.length;
  return retval;
}

test('constructor', () => {
  const hc = new HemiClip();

  let plane = hc.clipper;
  expect(plane).toBeInstanceOf(FormClipEdge); // front
  expect(plane = plane.nextPlane).toBeInstanceOf(FormClipEdge); // left
  expect(plane = plane.nextPlane).toBeInstanceOf(FormClipEdge); // right
  expect(plane = plane.nextPlane).toBeInstanceOf(FormClipEdge); // top
  expect(plane = plane.nextPlane).toBeInstanceOf(FormClipEdge); // bottom
  expect(plane = plane.nextPlane).toBe(null);

  expect(hc.originVector).toBeInstanceOf(Vector3);
});

test.todo('setView(), randomizeUV()');
test.todo('updateView(), buildTransform()');

describe('clip()', () => {
  // create hemiclip,
  // set view to patch with normal along z axis and center at 0,0,0
  // undo randomization so u=-x and v=y

  const hc = new HemiClip();
  const out = new FormPoly();

  const points = [
    new Point3(-0.5, -0.5, 0),
    new Point3(0.5, -0.5, 0),
    new Point3(0.5, 0.5, 0),
    new Point3(-0.5, 0.5, 0),
  ];
  const vertices = points.map(p => new Vertex3(p));
  const patch = new Patch3(vertices);

  // where hc.setView() uses a random vector, mock a random vector along X axis
  const mockRandom = jest.spyOn(global.Math, 'random').mockImplementation(nextRandomNumber);
  hc.setView(patch);

  test('sanity checks', () => {
    expect(patch.normal).toStrictEqual(new Vector3(0, 0, 1));
    expect(mockRandom).toHaveBeenCalledTimes(3);
    // verify u and v vectors to be -x and y
    expect(hc.u).toStrictEqual(new Vector3(-1, 0, 0));
    expect(hc.v).toStrictEqual(new Vector3(0, 1, -0)); // -0 is an artifact of the calculation
  });

  test('element floating above the patch, fully in view of top hemicube face', () => {
    const el = new Element3([
      new Point3(-0.5, -0.5, 1),
      new Point3(0.5, -0.5, 1),
      new Point3(0.5, 0.5, 1),
      new Point3(-0.5, 0.5, 1),
    ].map(p => new Vertex3(p)));

    // clip against top hemicube face
    hc.updateView(TOP);
    hc.clip(el, out);
    comparePoly(out, [0.75, 0.25], [0.25, 0.25], [0.25, 0.75], [0.75, 0.75]);

    // clip against side hemicube faces - element not visible
    for (let i = 1; i < FACES.length; i += 1) {
      hc.updateView(FACES[i]);
      hc.clip(el, out);
      comparePoly(out); // should be empty
    }

    // same element just raised by 1 away from the patch
    const el2 = new Element3([
      new Point3(-0.5, -0.5, 2),
      new Point3(0.5, -0.5, 2),
      new Point3(0.5, 0.5, 2),
      new Point3(-0.5, 0.5, 2),
    ].map(p => new Vertex3(p)));

    // clip against top hemicube face
    hc.updateView(TOP);
    hc.clip(el2, out);
    comparePoly(out, [0.625, 0.375], [0.375, 0.375], [0.375, 0.625], [0.625, 0.625]);

    // clip against side hemicube faces - element not visible
    for (let i = 1; i < FACES.length; i += 1) {
      hc.updateView(FACES[i]);
      hc.clip(el2, out);
      comparePoly(out); // should be empty
    }
  });

  test('element floating above the patch, exact fit for view box', () => {
    const el = new Element3([
      new Point3(-1, -1, 1),
      new Point3(1, -1, 1),
      new Point3(1, 1, 1),
      new Point3(-1, 1, 1),
    ].map(p => new Vertex3(p)));

    // clip against top hemicube face
    hc.updateView(TOP);
    hc.clip(el, out);
    comparePoly(out, [1, 0], [0, 0], [0, 1], [1, 1]);
  });

  test('element just above the patch not visible', () => {
    // not visible because it is in front of the front clipping plane for top face
    const el = new Element3([
      new Point3(-0.5, -0.5, 0.001),
      new Point3(0.5, -0.5, 0.001),
      new Point3(0.5, 0.5, 0.001),
      new Point3(-0.5, 0.5, 0.001),
    ].map(p => new Vertex3(p)));

    // clip against top hemicube face - element not visible
    hc.updateView(TOP);
    hc.clip(el, out);
    comparePoly(out); // should be empty
  });

  test('large element floating above the patch, overlaps all hemicube sides', () => {
    const el = new Element3([
      new Point3(-1.5, 0, 1),
      new Point3(0, -1.5, 1),
      new Point3(1.5, 0, 1),
      new Point3(0, 1.5, 1),
    ].map(p => new Vertex3(p)));

    // clip against top hemicube face
    // the element is rotated so it forms an octagon on the top hemicube face
    hc.updateView(TOP);
    hc.clip(el, out);
    comparePoly(out, [1, 0.25], [0.75, 0], [0.25, 0], [0, 0.25], [0, 0.75], [0.25, 1], [0.75, 1], [1, 0.75]);

    // against the side faces the element always becomes a triangle by the top side
    hc.updateView(LEFT);
    hc.clip(el, out);
    comparePoly(out, [0.75, 1], [0.5, 5 / 6], [0.25, 1]);

    hc.updateView(RIGHT);
    hc.clip(el, out);
    comparePoly(out, [0.5, 5 / 6], [0.25, 1], [0.75, 1]);

    hc.updateView(FRONT);
    hc.clip(el, out);
    comparePoly(out, [0.75, 1], [0.5, 5 / 6], [0.25, 1]);

    hc.updateView(BACK);
    hc.clip(el, out);
    comparePoly(out, [0.75, 1], [0.5, 5 / 6], [0.25, 1]);
  });

  test('a wall standing on our patch', () => {
    // the wall is a 2x2 square standing on the XY plane, touching the x=0.5 side of the origin patch
    const el = new Element3([
      new Point3(0.5, 1, 0),
      new Point3(0.5, -1, 0),
      new Point3(0.5, -1, 2),
      new Point3(0.5, 1, 2),
    ].map(p => new Vertex3(p)));

    // through top hemisphere face, we see the far side of the wall completely,
    // but the front-size is behind front projection plane
    hc.updateView(TOP);
    hc.clip(el, out);
    comparePoly(out, [0.25, 0], [0.375, 0.25], [0.375, 0.75], [0.25, 1], [0, 1], [0, 0]);

    // against the side faces the element always becomes a triangle by the top side
    hc.updateView(LEFT);
    hc.clip(el, out);
    comparePoly(out, [0, 0.5], [1, 0.5], [1, 1], [0, 1]);

    hc.updateView(RIGHT);
    hc.clip(el, out);
    comparePoly(out); // nothing

    hc.updateView(FRONT);
    hc.clip(el, out);
    comparePoly(out, [0.75, 0.5], [1, 0.5], [1, 1], [0.75, 1]);

    hc.updateView(BACK);
    hc.clip(el, out);
    comparePoly(out, [0, 0.5], [0.25, 0.5], [0.25, 1], [0, 1]);
  });
});

function comparePoly(out, ...xyCoordinates) {
  expect(out.numVert).toBe(xyCoordinates.length);
  for (let i = 0; i < xyCoordinates.length; i += 1) {
    expect(out.vertices[i].x).toBeCloseTo(xyCoordinates[i][0], 5);
    expect(out.vertices[i].y).toBeCloseTo(xyCoordinates[i][1], 5);
  }
}
