import * as Cube from '../../modeling/cube.js';

test('todo', () => {
  expect(Cube).toBeDefined();
  expect(() => Cube.unitCube(null, null, 1)).not.toThrow();
  expect(() => Cube.unitCubeMultiSurface(1)).not.toThrow();
  expect(() => Cube.unitCube(null, null)).not.toThrow();
  expect(() => Cube.unitCubeMultiSurface()).not.toThrow();
});

test.todo('more, e.g. cube with different x,y,z subdivisions');
