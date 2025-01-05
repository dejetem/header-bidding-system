
export class Bid {
    constructor(
      public readonly bidder: string,
      public readonly price: number,
      public readonly adId: string,
      public readonly creative: string,
      public readonly advertiserDomain: string
    ) {}
  
    isValid(): boolean {
      return (
        this.price > 0 &&
        this.advertiserDomain !== '' &&
        this.creative !== ''
      );
    }
  }