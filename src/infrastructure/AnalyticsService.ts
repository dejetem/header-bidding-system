import { Bid } from '../domain/Bid';
import { trackEvent } from '../util/analytics-server';

export class AnalyticsService {
  async trackBid(bid: Bid): Promise<void> {
    console.log(`Tracked bid: ${bid.bidder} - ${bid.price}`);
    // if (typeof (window as any).gtag === 'function') {
    //   (window as any).gtag('event', 'bid_received', {
    //     bidder: bid.bidder,
    //     price: bid.price,
    //     adId: bid.adId,
    //   });
    // }
    await trackEvent('bidding', 'bid_received', {
      bidder: bid.bidder,
      price: bid.price,
      adId: bid.adId,
    });
  }

  async trackWin(bid: Bid): Promise<void> {
    console.log(`Tracked win: ${bid.bidder} - ${bid.price}`);
    // if (typeof (window as any).gtag === 'function') {
    //   (window as any).gtag('event', 'bid_won', {
    //     bidder: bid.bidder,
    //     price: bid.price,
    //     adId: bid.adId,
    //   });
    // }
    await trackEvent('bidding', 'bid_won', {
      bidder: bid.bidder,
      price: bid.price,
      adId: bid.adId,
    });
  }

  async trackError(error: Error): Promise<void> {
    console.error(`Tracked error: ${error.message}`);
    // if (typeof (window as any).gtag === 'function') {
    //   (window as any).gtag('event', 'error', {
    //     error_message: error.message,
    //   });
    // }
    await trackEvent('bidding', 'error', {
      error_message: error.message,
    });
  }
}