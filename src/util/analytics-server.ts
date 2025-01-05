import axios from 'axios';
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const TRACKING_ID = process.env.TRACKING_ID || ''; // Tracking ID
const CLIENT_ID = process.env.CLIENT_ID || ''; // Unique client ID

export async function trackEvent(category: string, action: string, params: Record<string, any>): Promise<void> {
  const url = `https://www.google-analytics.com/collect`;
  const data = new URLSearchParams({
    v: '1', // Protocol version
    tid: TRACKING_ID, // Tracking ID
    cid: CLIENT_ID, // Client ID
    t: 'event', // Event type
    ec: category, // Event category
    ea: action, // Event action
    ...params, // Spread the additional parameters
  });

  try {
    await axios.post(url, data.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    console.log('Event tracked successfully');
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}