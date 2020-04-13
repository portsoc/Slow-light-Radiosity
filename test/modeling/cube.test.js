import * as Cube from '../../modeling/cube.js';

test('todo', () => {
  expect(Cube).toBeDefined();
  expect(Cube.unitCube).not.toThrow();
  expect(Cube.unitCubeMultiSurface).not.toThrow();
});
