import { Bid } from '../Bid';

describe('Bid', () => {
  it('should validate a valid bid', () => {
    const bid = new Bid('appnexus', 1.5, 'ad1', '<div>Ad 1</div>', 'example.com');
    expect(bid.isValid()).toBe(true);
  });

  it('should invalidate a bid with missing advertiser domain', () => {
    const bid = new Bid('appnexus', 1.5, 'ad1', '<div>Ad 1</div>', '');
    expect(bid.isValid()).toBe(false);
  });

  it('should invalidate a bid with a negative price', () => {
    const bid = new Bid('appnexus', -1.0, 'ad1', '<div>Ad 1</div>', 'example.com');
    expect(bid.isValid()).toBe(false);
  });
});