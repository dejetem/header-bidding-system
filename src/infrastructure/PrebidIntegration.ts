import puppeteer, { Browser, Page } from 'puppeteer';
import * as dotenv from "dotenv";
import { AdUnit } from '../domain/AdUnit';
import { Bid } from '../domain/Bid';

// Load environment variables
dotenv.config();

export class PrebidIntegration {
    private browser: Browser | null = null;
    private page: Page | null = null;

    // Initialize Puppeteer and load Prebid.js
    async initialize() {
        try {
            console.log('Launching Puppeteer browser...');
            this.browser = await puppeteer.launch({
                protocolTimeout: 300000, // Increase timeout to 300 seconds (5 minutes)
                // headless: false, // Run in non-headless mode for debugging
                // args: ['--disable-features=BlockInsecurePrivateNetworkRequests'], // Disable network restrictions
            });
            console.log('Puppeteer browser launched successfully.');

            this.page = await this.browser.newPage();

            // Listen for errors in the browser context
            this.page.on('pageerror', (error) => {
                console.error('Error in browser context:', error);
            });

            // Log all console messages from the browser
            this.page.on('console', (msg) => {
                console.log('Browser console:', msg.text());
            });

            // Log network requests and responses
            this.page.on('request', (request) => {
                console.log('Request:', request.url());
            });

            this.page.on('response', (response) => {
                console.log('Response:', response.url(), response.status());
            });

            try {
                console.log('Navigating to about:blank...');
                await this.page.goto('about:blank', { timeout: 300000 });
                console.log('Navigation to about:blank successful.');
            } catch (error) {
                console.error('Error navigating to about:blank:', error);
                throw error;
            }

            try {
                console.log('Waiting for body element...');
                await this.page.waitForSelector('body', { timeout: 300000 });
                console.log('Body element detected.');
            } catch (error) {
                console.error('Error waiting for body element:', error);
                throw error;
            }

            // Log before injecting Prebid.js
            console.log('Injecting Prebid.js...');

            // Inject Prebid.js into the page
            await this.page.addScriptTag({
                url: 'https://cdn.jsdelivr.net/npm/prebid.js@latest/dist/not-for-prod/prebid.js',
            });

            // Log after injecting Prebid.js
            console.log('Prebid.js injected. Waiting for it to load...');

            // Wait for Prebid.js to load
            await this.page.evaluate(() => {
                return new Promise<void>((resolve, reject) => {
                    const checkPrebid = () => {
                        if ((window as any).pbjs) {
                            console.log('Prebid.js is loaded:', JSON.stringify((window as any).pbjs, null, 2));
                            resolve();
                        } else {
                            setTimeout(checkPrebid, 100);
                        }
                    };
                    checkPrebid();
                });
            });

            // Set Prebid.js configuration
            await this.page.evaluate(() => {
                const pbjs = (window as any).pbjs;
                if (pbjs) {
                    pbjs.setConfig({
                        debug: true, // Enable debug mode
                        priceGranularity: 'high',
                    });
                }
            });

            // Register event listeners for bid errors
            await this.page.evaluate(() => {
                const pbjs = (window as any).pbjs;
                if (pbjs) {
                    // Listen for bid timeouts
                    pbjs.onEvent('bidTimeout', (timedOutBidders: any) => {
                        console.error('Bidder(s) timed out:', timedOutBidders);
                        timedOutBidders.forEach((bidder: any) => {
                            console.error(`Timeout: ${bidder.bidderCode} failed to respond in time.`);
                        });
                    });

                    // Listen for bid errors
                    pbjs.onEvent('bidError', (error: any) => {
                        console.error('Bid error:', error);
                        if (error.bidder === 'appnexus') {
                            console.error('AppNexus failed to connect:', error);
                        } else if (error.bidder === 'rubicon') {
                            console.error('Rubicon failed to connect:', error);
                        }
                    });

                    // Listen for no bids
                    pbjs.onEvent('noBid', (noBidResponse: any) => {
                        console.error('No bid response:', noBidResponse);
                        if (noBidResponse.bidder === 'appnexus') {
                            console.error('AppNexus returned no bid:', noBidResponse);
                        } else if (noBidResponse.bidder === 'rubicon') {
                            console.error('Rubicon returned no bid:', noBidResponse);
                        }
                    });
                }
            });

            console.log('Prebid.js initialized successfully');
        } catch (error) {
            console.error('Error in initialize:', error);
            throw error;
        }
    }

    // Set up ad units in Prebid.js
    async setupAdUnits(adUnits: AdUnit[]): Promise<void> {
        if (!this.page) {
            throw new Error('Page is not initialized. Call initialize() first.');
        }

        try {
            console.log('Setting up ad units in Prebid.js...');

            // Log adUnits in browser context
            await this.page.evaluate((adUnits) => {
                console.log('adUnits in browser context:', JSON.stringify(adUnits, null, 2));
            }, adUnits);

            // Set up ad units
            await this.page.evaluate((adUnits) => {
                try {
                    console.log('Inside page.evaluate...');

                    // Check if Prebid.js is available
                    const pbjs = (window as any).pbjs;
                    if (!pbjs) {
                        throw new Error('Prebid.js is not available');
                    }
                    console.log('Prebid.js is available:', JSON.stringify(pbjs, null, 2));

                    // Initialize pbjs.que if it doesn't exist
                    pbjs.que = pbjs.que || [];
                    console.log('pbjs.que initialized:', JSON.stringify(pbjs.que, null, 2));

                    console.log('Setting up ad units in Prebid.js...');

                    pbjs.que.push(() => {
                        console.log('Configuring Prebid.js...');

                        // Set Prebid.js configuration
                        pbjs.setConfig({
                            debug: true,
                            priceGranularity: 'high',
                        });

                        console.log('Adding SSP adapters...');
                        if (!pbjs.aliasBidder.called) {
                            pbjs.aliasBidder('appnexus', 'appnexusAst');
                            pbjs.aliasBidder('rubicon', 'rubicon');
                            pbjs.aliasBidder.called = true; // Mark as called
                        }

                        console.log('Defining ad units...');
                        pbjs.addAdUnits(
                            adUnits.map((adUnit) => ({
                                code: adUnit.id,
                                mediaTypes: {
                                    banner: {
                                        sizes: adUnit.sizes,
                                    },
                                },
                                bids: [
                                    {
                                        bidder: 'appnexus',
                                        params: {
                                            placementId: process.env.APPNEXUS_PLACEMENT_ID, // placement ID
                                        },
                                    },
                                    {
                                        bidder: 'rubicon',
                                        params: {
                                            accountId: process.env.RUBICON_ACCOUNT_ID, // account ID
                                            siteId: process.env.RUBICON_SITE_ID, // site ID
                                            zoneId: process.env.RUBICON_ZONE_ID, // zone ID
                                        },
                                    },
                                ],
                            }))
                        );

                        console.log('Ad units set up successfully:', JSON.stringify(adUnits, null, 2));
                    });
                } catch (error) {
                    console.error('Error in browser context:', error);
                    throw error; // Re-throw to propagate to Node.js context
                }
            }, adUnits);
        } catch (error) {
            throw new Error(`Failed to set up ad units: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Request bids from SSPs
    async requestBids(): Promise<Bid[]> {
        if (!this.page) {
            throw new Error('Page is not initialized. Call initialize() first.');
        }

        return new Promise((resolve, reject) => {
            this.page!.evaluate(() => {
                const pbjs = (window as any).pbjs || {};
                return new Promise((resolve, reject) => {
                    pbjs.que.push(() => {
                        console.log('Requesting bids...');

                        pbjs.requestBids({
                            timeout: 300000, // Increased timeout
                            bidsBackHandler: (bids: any) => {
                                console.log('Bids received:', bids);
                                if (!bids || bids.length === 0) {
                                    reject(new Error('No bids received'));
                                } else {
                                    resolve(bids);
                                }
                            },
                            errorHandler: (error: any) => {
                                console.error('Bid request failed:', error);
                                reject(new Error(`Bid request failed: ${error.message}`));
                            },
                        });
                    });
                });
            })
                .then((bids: any) => {
                    const parsedBids = bids.map(
                        (bid: any) =>
                            new Bid(bid.bidder, bid.cpm, bid.adId, bid.ad, bid.advertiserDomain)
                    );
                    resolve(parsedBids);
                })
                .catch((error) => {
                    console.error('Error in requestBids:', error);
                    reject(error);
                });
        });
    }

    // Close the Puppeteer browser
    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}