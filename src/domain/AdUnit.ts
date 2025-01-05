export class AdUnit {
    constructor(
      public readonly id: string,
      public readonly sizes: string[][], // Array of sizes, e.g., [['300', '250'], ['728', '90']]
      public readonly deviceType: 'mobile' | 'desktop'
    ) {}
  }