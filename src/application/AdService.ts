import { AdUnit } from '../domain/AdUnit';
import { Bid } from '../domain/Bid';
import { LocalStorage } from 'node-localstorage';

const localStorage = new LocalStorage('./scratch');

export class AdService {
  private adUnits: AdUnit[] = [];
  private bids: Bid[] = [];

  constructor() {
    // Load adUnits from local storage when the service is initialized
    this.loadAdUnits();
  }

  // Add an ad unit and save to local storage
  addAdUnit(adUnit: AdUnit): { success: boolean; message: string } {
    // Check if an ad unit with the same ID already exists
    const existingAdUnit = this.adUnits.find((unit) => unit.id === adUnit.id);
    if (existingAdUnit) {
      return { success: false, message: 'Ad unit already exists' };
    }

    // Add the new ad unit and save to local storage
    this.adUnits.push(adUnit);
    this.saveAdUnits();
    return { success: true, message: 'Ad unit added successfully' };
  }

  // Get all ad units
  getAdUnits(): AdUnit[] {
    return this.adUnits;
  }

  // Save adUnits to local storage
  private saveAdUnits(): void {
    localStorage.setItem('adUnits', JSON.stringify(this.adUnits));
  }

  // Load adUnits from local storage
  private loadAdUnits(): void {
    const adUnitsData = localStorage.getItem('adUnits');
    if (adUnitsData) {
      this.adUnits = JSON.parse(adUnitsData).map(
        (data: any) => new AdUnit(data.id, data.sizes, data.deviceType)
      );
    }
  }

  getFloorPrice(adUnit: AdUnit): number {
    // Example floor pricing logic
    if (adUnit.deviceType === 'mobile') {
      return 0.5; // $0.50 floor price for mobile
    } else {
      return 1.0; // $1.00 floor price for desktop
    }
  }

  requestBids(): void {
    // Simulate bid requests with floor price validation
    this.bids = [
      new Bid('appnexus', 1.5, 'ad1', '<div>Ad 1</div>', 'example.com'),
      new Bid('rubicon', 0.8, 'ad2', '<div>Ad 2</div>', 'example.com'),
    ].filter((bid) => bid.price >= this.getFloorPrice(this.adUnits[0]));
  }

  getWinningBid(): Bid | null {
    if (this.bids.length === 0) return null;
    return this.bids.reduce((prev, current) =>
      prev.price > current.price ? prev : current
    );
  }
}