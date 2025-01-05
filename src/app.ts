import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as dotenv from "dotenv";
import { AdUnit } from './domain/AdUnit';
import { AdService } from './application/AdService';
import { PrebidIntegration } from './infrastructure/PrebidIntegration';
import { AnalyticsService } from './infrastructure/AnalyticsService';
import { AdRenderer } from './presentation/AdRenderer';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 0

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize services
const adService = new AdService();
const prebidIntegration = new PrebidIntegration();
const analyticsService = new AnalyticsService();
const adRenderer = new AdRenderer();

// Endpoint to add an ad unit
app.post('/ad-unit', (req, res): void => {
    try {
        const { id, sizes, deviceType } = req.body;

        // Validate required fields
        if (!id || !sizes || !deviceType) {
            res.status(400).json({ message: 'Missing required fields: id, sizes, deviceType' });
            return; // Ensure the function exits after sending the response
        }

        const adUnit = new AdUnit(id, sizes, deviceType);

        // Add the ad unit and check if it already exists
        const result = adService.addAdUnit(adUnit);

        if (result.success) {
            res.status(201).json({ message: result.message });
        } else {
            res.status(400).json({ message: result.message });
        }
    } catch (error) {
        console.error('Error adding ad unit:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Endpoint to request bids
app.post('/request-bids', async (req, res) => {
    try {
        const adUnits = adService.getAdUnits();

        // Convert AdUnit instances to plain objects
        const plainAdUnits = adUnits.map((adUnit) => ({
            id: adUnit.id,
            sizes: adUnit.sizes,
            deviceType: adUnit.deviceType,
        }));

        console.log('Setting up ad units:', plainAdUnits);
        await prebidIntegration.setupAdUnits(plainAdUnits);

        console.log('Requesting bids...');
        const bids = await prebidIntegration.requestBids();
        console.log('Bids received:', bids);

        // Track bids in analytics
        bids.forEach((bid) => analyticsService.trackBid(bid));

        // Determine the winning bid
        const winningBid = adService.getWinningBid();
        if (winningBid) {
            analyticsService.trackWin(winningBid);
            const adHtml = adRenderer.renderAd(winningBid);
            res.status(200).json({ adHtml });
        } else {
            const fallbackAdHtml = adRenderer.renderFallbackAd();
            res.status(200).json({ adHtml: fallbackAdHtml });
        }
    } catch (error) {
        console.error('Error requesting bids:', error);
        analyticsService.trackError(error as Error);

        // Render a fallback ad in case of errors
        const fallbackAdHtml = adRenderer.renderFallbackAd();
        res.status(500).json({ error: 'Failed to request bids', adHtml: fallbackAdHtml });
    } finally {
        // Close the Puppeteer browser
        await prebidIntegration.close();
    }
});

// Start the server
const startServer = async () => {
    try {
        // Initialize Puppeteer and Prebid.js
        await prebidIntegration.initialize();
        console.log('Prebid integration initialized');

        // Start the server
        const server = app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });

        // Graceful shutdown
        process.on('SIGINT', () => {
            console.log('Shutting down server...');
            server.close(async () => {
                await prebidIntegration.close();
                console.log('Server and Puppeteer browser closed.');
                process.exit(0);
            });
        });
    } catch (error) {
        console.error('Failed to initialize Prebid integration:', error);
        process.exit(1); // Exit the process if initialization fails
    }
};

startServer();