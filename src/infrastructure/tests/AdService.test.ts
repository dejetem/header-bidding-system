import { AdService } from '../../application/AdService';
import { AdUnit } from '../../domain/AdUnit';

describe('AdService', () => {
  it('should add an AdUnit', () => {
    const adService = new AdService();
    const adUnit = new AdUnit('div-1', [['300', '250']], 'desktop');
    adService.addAdUnit(adUnit);

    // Check if the array contains an object with the same properties
    expect(adService.getAdUnits()).toEqual(expect.arrayContaining([adUnit]));
  });
});