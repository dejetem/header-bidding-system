
import { AdUnit } from '../AdUnit';

describe('AdUnit', () => {
  it('should create an AdUnit instance', () => {
    const adUnit = new AdUnit('div-1', [['300', '250']], 'desktop');
    expect(adUnit.id).toBe('div-1');
    expect(adUnit.sizes).toEqual([['300', '250']]);
    expect(adUnit.deviceType).toBe('desktop');
  });
});