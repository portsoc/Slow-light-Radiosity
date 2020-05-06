import FormClipEdge from '../../radiosity/formclipedge.js';
import Vector4 from '../../radiosity/vector4.js';

test('constructor', () => {
  const n1 = new Vector4(1, 2, 3, 4).normalize();
  const fce1 = new FormClipEdge(n1);

  expect(fce1.normal).toBe(n1);
  expect(fce1.normal).toStrictEqual(new Vector4(1, 2, 3, 4).normalize());
  expect(fce1.first).toBeInstanceOf(Vector4);
  expect(fce1.start).toBeInstanceOf(Vector4);
  expect(fce1.intersection).toBeInstanceOf(Vector4);
});

test('setNext()', () => {
  const n1 = new Vector4(1, 0, 0, 0).normalize();
  const fce1 = new FormClipEdge(n1);
  const fce2 = new FormClipEdge(n1);

  expect(fce1.nextPlane).toBeNull();
  expect(fce2.nextPlane).toBeNull();

  fce1.setNext(fce2);
  expect(fce1.nextPlane).toBe(fce2);
  expect(fce2.nextPlane).toBeNull();
});

test('isInside()', () => {
  const n1 = new Vector4(1, 0, 0, 0).normalize();
  const fce1 = new FormClipEdge(n1);

  expect(fce1.isInside(new Vector4(0, 1, 0, 0))).toBe(true);
  expect(fce1.isInside(new Vector4(1, 1, 0, 0))).toBe(true);
  expect(fce1.isInside(new Vector4(-0.01, 1, 0, 0))).toBe(false);
  expect(fce1.isInside(new Vector4(-1, 1, 0, 0))).toBe(false);
});

test('intersect()', () => {
  // very simple set of tests:
  // a line parallel to X at y=2, (z=w=0)
  // normals at X, 45°, and 1-to-2
  // intersect at 0, -2, and -1

  const s = new Vector4(-2, 2, 0, 0);
  const e = new Vector4(2, 2, 0, 0);

  const n1 = new Vector4(1, 0, 0, 0).normalize();
  const fce1 = new FormClipEdge(n1);
  expect(fce1.intersect(s, e)).toStrictEqual(new Vector4(0, 2, 0, 0));

  const n2 = new Vector4(1, 1, 0, 0).normalize();
  const fce2 = new FormClipEdge(n2);
  expect(fce2.intersect(s, e)).toStrictEqual(new Vector4(-2, 2, 0, 0));

  const n3 = new Vector4(2, 1, 0, 0).normalize();
  const fce3 = new FormClipEdge(n3);
  expect(fce3.intersect(s, e)).toStrictEqual(new Vector4(-1, 2, 0, 0));

  const s2 = new Vector4(-6, 2, 0, 0);
  const e2 = new Vector4(10, 2, 0, 0);
  expect(fce1.intersect(s2, e2)).toStrictEqual(new Vector4(0, 2, 0, 0));
  expect(fce2.intersect(s2, e2)).toStrictEqual(new Vector4(-2, 2, 0, 0));
  expect(fce3.intersect(s2, e2)).toStrictEqual(new Vector4(-1, 2, 0, 0));

  // intersecting the line with the X axis (normal at Y) returns end of line
  const ny = new Vector4(0, 1, 0, 0).normalize();
  const fcey = new FormClipEdge(ny);
  expect(fcey.intersect(s, e)).toStrictEqual(new Vector4(2, 2, 0, 0));
});

describe('clip(), output(), close()', () => {
  // real FormPoly has a fixed space for up to 10
  // so we use a fake FormPoly and we can check its addVertex is called correctly
  // in the mock fakePoly.addVertex(), we copy the vector and call our addVertexStore
  // this way we can use addVertexStore's mock properties
  let fce;
  const addVertexStore = jest.fn();
  const fakePoly = {};
  fakePoly.addVertex = jest.fn((v) => addVertexStore(new Vector4(v)));

  // this function performs one clip() (if given a v) or close(),
  // then checks that the expected output vertices were output
  function clipStep(v, ...output) {
    addVertexStore.mockClear();
    if (v) {
      fce.clip(new Vector4(...v), fakePoly);
    } else {
      fce.close(fakePoly);
    }
    expect(addVertexStore).toHaveBeenCalledTimes(output.length);

    // check each output matches the respective call to addVertex
    for (let i = 0; i < output.length; i += 1) {
      const calledWith = addVertexStore.mock.calls[i];
      expect(calledWith).toHaveLength(1);
      expect(calledWith[0]).toBeInstanceOf(Vector4);
      // compare coordinates of the vector
      expect(calledWith[0].x).toBeCloseTo(output[i][0], 5);
      expect(calledWith[0].y).toBeCloseTo(output[i][1], 5);
      expect(calledWith[0].z).toBeCloseTo(output[i][2], 5);
      expect(calledWith[0].w).toBeCloseTo(output[i][3], 5);
    }
  }

  describe('single plane', () => {
    describe('front plane FCE', () => {
      test('longer sequence, close behind plane', () => {
        // create fce for front plane
        fce = new FormClipEdge(new Vector4(0, 0, 1, 0).normalize());

        // should clip everything with n<0
        //
        // front     n=1       3--4             10              .
        // of plane    |      /    \           /  \             .
        // ------------+-----*------*------8--9----11--12-------> u
        // back of     |    /        \    /              \      .
        // plane      -1   1          6--7                13    .

        clipStep([1, 0, -1, 0]);
        clipStep([3, 0, 1, 0], [2, 0, 0, 0], [3, 0, 1, 0]);
        clipStep([4, 0, 1, 0], [4, 0, 1, 0]);
        clipStep([6, 0, -1, 0], [5, 0, 0, 0]);
        clipStep([7, 0, -1, 0]);
        clipStep([8, 0, 0, 0], [8, 0, 0, 0], [8, 0, 0, 0]);
        clipStep([9, 0, 0, 0], [9, 0, 0, 0]);
        clipStep([10, 0, 1, 0], [10, 0, 1, 0]);
        clipStep([11, 0, 0, 0], [11, 0, 0, 0]);
        clipStep([12, 0, 0, 0], [12, 0, 0, 0]);
        clipStep([13, 0, -1, 0], [12, 0, 0, 0]);
        clipStep(); // close without output
      });

      test('close in front of plane', () => {
        // front     n=1   1         7      .
        // of plane    |    \      _/       .
        // ------------+-----*----*---------> u
        // back of     |      \ _/          .
        // plane      -1       3            .

        clipStep([1, 0, 1, 0], [1, 0, 1, 0]);
        clipStep([3, 0, -1, 0], [2, 0, 0, 0]);
        clipStep([7, 0, 1, 0], [5, 0, 0, 0], [7, 0, 1, 0]);
        clipStep();
      });

      test('close through plane', () => {
        // front     n=1   1                .
        // of plane    |    \               .
        // ------------+-----*--------------> u
        // back of     |      \             .
        // plane      -1       3----5       .

        clipStep([1, 0, 1, 0], [1, 0, 1, 0]);
        clipStep([3, 0, -1, 0], [2, 0, 0, 0]);
        clipStep([5, 0, -1, 0]);
        clipStep(null, [3, 0, 0, 0]);
      });

      test('with nothing above plane', () => {
        // front     n=1                    .
        // of plane    |                    .
        // ------------+--------------------> u
        // back of     |                    .
        // plane      -1   1--3----5        .

        clipStep([1, 0, -1, 0]);
        clipStep([3, 0, -1, 0]);
        clipStep([5, 0, -1, 0]);
        clipStep();
      });
    });

    describe('left plane FCE', () => {
      test('sequence with close across plane', () => {
        // create fce for left plane
        fce = new FormClipEdge(new Vector4(1, 0, 0, 0).normalize());

        // should clip everything with u<0
        //
        // front     u=1       3--4          9      .
        // of plane    |      /    \        /       .
        // ------------+-----*------*------8--------> v
        // back of     |    /        \    /         .
        // plane      -1   1          6--7          .

        clipStep([-1, 1, 0, 0]);
        clipStep([1, 3, 0, 0], [0, 2, 0, 0], [1, 3, 0, 0]);
        clipStep([1, 4, 0, 0], [1, 4, 0, 0]);
        clipStep([-1, 6, 0, 0], [0, 5, 0, 0]);
        clipStep([-1, 7, 0, 0]);
        clipStep([0, 8, 0, 0], [0, 8, 0, 0], [0, 8, 0, 0]);
        clipStep([1, 9, 0, 0], [1, 9, 0, 0]);
        clipStep(null, [0, 5, 0, 0]);
      });
    });

    describe('right plane FCE', () => {
      test('sequence with close across plane', () => {
        // create fce for right plane
        fce = new FormClipEdge(new Vector4(-1, 0, 0, 1).normalize());

        // should clip everything with u>w
        //
        // front     u=w-1     3--4          9      .
        // of plane    |      /    \        /       .
        // ------------+-----*------*------8--------> w=u
        // back of     |    /        \    /         .
        // plane     w+1   1          6--7          .

        clipStep([2, 0, 0, 1]);
        clipStep([2, 0, 0, 3], [2, 0, 0, 2], [2, 0, 0, 3]);
        clipStep([3, 0, 0, 4], [3, 0, 0, 4]);
        clipStep([7, 0, 0, 6], [5, 0, 0, 5]);
        clipStep([8, 0, 0, 7]);
        clipStep([8, 0, 0, 8], [8, 0, 0, 8], [8, 0, 0, 8]);
        clipStep([8, 0, 0, 9], [8, 0, 0, 9]);
        clipStep(null, [5, 0, 0, 5]);
      });
    });

    // top and bottom clipping planes assumed to work if the above works
  });

  describe('all five planes', () => {
    const front = new FormClipEdge(new Vector4(0, 0, 1, 0).normalize());
    const left = new FormClipEdge(new Vector4(1, 0, 0, 0).normalize());
    const right = new FormClipEdge(new Vector4(-1, 0, 0, 1).normalize());
    const top = new FormClipEdge(new Vector4(0, -1, 0, 1).normalize());
    const bottom = new FormClipEdge(new Vector4(0, 1, 0, 0).normalize());

    beforeEach(() => {
      front.setNext(left);
      left.setNext(right);
      right.setNext(top);
      top.setNext(bottom);

      fce = front;
    });

    test('entirely within view', () => {
      // clips to within n>=0, 0<=u<=w, 0<=v<=w
      // we'll stick to n=1 and w=5 for simplicity
      clipStep([1, 0, 0, 5], [1, 0, 0, 5]);
      clipStep([1, 1, 0, 5], [1, 1, 0, 5]);
      clipStep([1, 1, 1, 5], [1, 1, 1, 5]);
      clipStep([1, 0, 1, 5], [1, 0, 1, 5]);
      clipStep();

      clipStep([1, 0.1, 0.1, 5], [1, 0.1, 0.1, 5]);
      clipStep([1, 0.9, 0.1, 5], [1, 0.9, 0.1, 5]);
      clipStep([1, 0.9, 0.9, 5], [1, 0.9, 0.9, 5]);
      clipStep([1, 0.1, 0.9, 5], [1, 0.1, 0.9, 5]);
      clipStep();
    });

    test('quad that encircles the view, clips to the view box', () => {
      // clips to within n>=0, 0<=u<=w, 0<=v<=w
      // we'll stick to n=1 and w=5 for simplicity

      // quad is at v0,v1,v2,v3
      const v0 = [-1, -1, 1, 5];
      const v1 = [6, -1, 1, 5];
      const v2 = [6, 6, 1, 5];
      const v3 = [-1, 6, 1, 5];

      // abcdefgh are, following the circle of v0,v1,v2,v3,v0, the intersections with each plane
      // jklm are the intersections of the plane with the view box, each nearest v0,v1,v2,v3 respectively
      // cdgh actually are never used
      const a = [0, -1, 1, 5];
      const b = [5, -1, 1, 5];
      // const c = [6, 0, 1, 5];
      // const d = [6, 5, 1, 5];
      const e = [5, 6, 1, 5];
      const f = [0, 6, 1, 5];
      // const g = [-1, 5, 1, 5];
      // const h = [-1, 0, 1, 5];
      const j = [0, 0, 1, 5];
      const k = [5, 0, 1, 5];
      const l = [5, 5, 1, 5];
      const m = [0, 5, 1, 5];

      // break the chain of faces so we use front face only
      front.setNext(null);
      left.setNext(null);
      right.setNext(null);
      top.setNext(null);

      // with only front
      clipStep(v0, v0);
      clipStep(v1, v1);
      clipStep(v2, v2);
      clipStep(v3, v3);
      clipStep();

      front.setNext(left);
      // with front and left
      clipStep(v0);
      clipStep(v1, a, v1);
      clipStep(v2, v2);
      clipStep(v3, f);
      clipStep();

      left.setNext(right);
      // with front, left and right
      clipStep(v0);
      clipStep(v1, a, b);
      clipStep(v2);
      clipStep(v3, e, f);
      clipStep();

      right.setNext(top);
      // with front, left, right and top
      clipStep(v0);
      clipStep(v1, a, b);
      clipStep(v2);
      clipStep(v3, l);
      clipStep(null, m);


      top.setNext(bottom);
      // with all
      clipStep(v0);
      clipStep(v1);
      clipStep(v2);
      clipStep(v3, k, l);
      clipStep(null, m, j);


      top.setNext(bottom);
      // now let's try quad v2,v1,v0,v3
      clipStep(v2);
      clipStep(v1);
      clipStep(v0);
      clipStep(v3);
      clipStep(null, j, m, l, k);
    });

    test('quad that intersects the view box in a corner and other points', () => {
      // clips to within n>=0, 0<=u<=w, 0<=v<=w
      // we'll stick to n=1 and w=5 for simplicity

      // quad is at v0,v1,v2,v3
      const v0 = [3, -1, 1, 5];
      const v1 = [5.5, -1, 1, 5];
      const v2 = [2, 6, 1, 5];
      const v3 = [-1, 3, 1, 5];

      // jklm are as in earlier tests, corners of the view box (only k is used)
      // kabcde are the various intersections of the view box by the quad v0,v1,v2,v3,v0
      const a = [2.5, 5, 1, 5];
      const b = [1, 5, 1, 5];
      const c = [0, 4, 1, 5];
      const d = [0, 2, 1, 5];
      const e = [2, 0, 1, 5];
      // const j = [0, 0, 1, 5];
      const k = [5, 0, 1, 5];
      // const l = [5, 5, 1, 5];
      // const m = [0, 5, 1, 5];

      clipStep(v0);
      clipStep(v1);
      clipStep(v2, k, a);
      clipStep(v3, b, c);
      clipStep(null, d, e);
    });

    test('quad with one point in the corner of the view box, other points outside', () => {
      // clips to within n>=0, 0<=u<=w, 0<=v<=w
      // we'll stick to n=1 and w=5 for simplicity

      // quad at v0,k,v2,v3; v0,v2,v3 are taken from above
      // v1 is now in point k
      const v0 = [3, -1, 1, 5];
      const v2 = [2, 6, 1, 5];
      const v3 = [-1, 3, 1, 5];

      // abcdejklm are as in previous test
      const a = [2.5, 5, 1, 5];
      const b = [1, 5, 1, 5];
      const c = [0, 4, 1, 5];
      const d = [0, 2, 1, 5];
      const e = [2, 0, 1, 5];
      // const j = [0, 0, 1, 5];
      const k = [5, 0, 1, 5];
      // const l = [5, 5, 1, 5];
      // const m = [0, 5, 1, 5];

      clipStep(v0);
      clipStep(k, k, k); // repeated because k lies on the edge and is approached from the outside
      clipStep(v2, a);
      clipStep(v3, b, c);
      clipStep(null, d, e);
    });
  });
});
