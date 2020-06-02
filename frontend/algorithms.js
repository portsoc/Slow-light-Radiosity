import * as Rad from '../radiosity/index.js';
import * as components from './tools/basic-components.js';

export const algorithms = new components.Selector('radiosity algorithm', [
  {
    instance: new Rad.SlowRad(),
    name: 'Slow-light Radiosity',
  },
  {
    instance: new Rad.ProgRad(),
    name: 'Progressive Radiosity (fast and static light)',
  },
  {
    instance: makeOvershootingProgRad(),
    name: 'Progressive Radiosity with overshooting',
  },
]);

function makeOvershootingProgRad() {
  const alg = new Rad.ProgRad();
  alg.overFlag = true;
  return alg;
}
