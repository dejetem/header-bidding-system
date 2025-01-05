// import { Bid } from '../domain/Bid';

// export class AdRenderer {
//     private observer: IntersectionObserver;

//     constructor() {
//         this.observer = new IntersectionObserver((entries) => {
//             entries.forEach(entry => {
//                 if (entry.isIntersecting) {
//                     this.renderAdContainer(entry.target as HTMLElement);
//                     this.observer.unobserve(entry.target);
//                 }
//             });
//         });
//     }

//     observeAdContainer(adContainer: HTMLElement): void {
//         this.observer.observe(adContainer);
//     }

//     // Render a generic ad when the container comes into view
//     renderAdContainer(adContainer: HTMLElement): void {
//         adContainer.innerHTML = '<div>Lazy-loaded Ad</div>';
//     }

//     // Render a specific bid's creative
//     renderAd(bid: Bid): void {
//         const adContainer = document.getElementById('ad-container');
//         if (adContainer) {
//             adContainer.innerHTML = bid.creative;
//         }
//     }

//     // Render a fallback ad
//     renderFallbackAd(): void {
//         const adContainer = document.getElementById('ad-container');
//         if (adContainer) {
//             adContainer.innerHTML = '<div>Fallback Ad</div>';
//         }
//     }
// }


import { Bid } from '../domain/Bid';

export class AdRenderer {
  // Render a specific bid's creative
  renderAd(bid: Bid): string {
    return bid.creative;
  }

  // Render a fallback ad
  renderFallbackAd(): string {
    return '<div>Fallback Ad</div>';
  }
}