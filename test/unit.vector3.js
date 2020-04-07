const Vector3 = require('../radiosity/vector3');

let result;
let v1;
let v2;

QUnit.testStart(() => {
  v1 = new Vector3(1, 2, 3);
  v2 = new Vector3(-6, 0, 5);
});

QUnit.test('magnitude()', (assert) => {
  result = v1.magnitude();
  assert.equal(result, Math.sqrt(14));
});

QUnit.test('addVector3()', (assert) => {
  result = new Vector3(-5, 2, 8);
  v1.addVector3(v2);
  assert.propEqual(result, v1);
});

QUnit.test('subVector3()', (assert) => {
  result = new Vector3(7, 2, -2);
  v1.subVector3(v2);
  assert.propEqual(result, v1);
});

QUnit.test('multScalar()', (assert) => {
  result = new Vector3(5, 10, 15);
  v1.multScalar(5);
  assert.propEqual(result, v1);
});

QUnit.test('divScalar()', (assert) => {
  result = new Vector3(0.25, 0.5, 0.75);
  v1.divScalar(4);
  assert.propEqual(result, v1);
});

QUnit.test('invert()', (assert) => {
  result = new Vector3(-1, -2, -3);
  v1.invert();
  assert.propEqual(result, v1);
});

QUnit.test('addVector3s()', (assert) => {
  result = new Vector3(-5, 2, 8);
  assert.propEqual(result, Vector3.addVector3s(v1, v2));
});

QUnit.test('subVector3s()', (assert) => {
  result = new Vector3(7, 2, -2);
  assert.propEqual(result, Vector3.subVector3s(v1, v2));
});

QUnit.test('multVector3ByScalar()', (assert) => {
  result = new Vector3(5, 10, 15);
  assert.propEqual(result, Vector3.multVector3ByScalar(v1, 5));
});

QUnit.test('divVector3ByScalar()', (assert) => {
  result = new Vector3(0.25, 0.5, 0.75);
  assert.propEqual(result, Vector3.divVector3ByScalar(v1, 4));
});

QUnit.test('invertVector3()', (assert) => {
  result = new Vector3(-1, -2, -3);
  assert.propEqual(result, Vector3.invertVector3(v1));
});

QUnit.test('dotProduct()', (assert) => {
  result = 4;
  assert.propEqual(result, Vector3.dotProduct(v1, v2));
});

QUnit.test('crossProduct()', (assert) => {
  result = new Vector3(10, -23, 12);
  assert.propEqual(result, Vector3.crossProduct(v1, v2));
});
