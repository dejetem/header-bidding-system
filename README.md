# Simplified Header Bidding System

This project implements a simplified header bidding system that allows publishers to manage ad units, request bids from demand partners, and display winning ads. The system includes features like fallback ads, lazy loading, and analytics tracking.

---

## **Features**
1. **Ad Unit Management**:
   - Add ad units with unique IDs, sizes, and device types.
   - Prevent duplicate ad units from being added.

2. **Header Bidding**:
   - Simulate bid requests from demand partners (e.g., AppNexus, Rubicon).
   - Validate bids against floor prices.

3. **Fallback Ads**:
   - Display fallback ads when no bids are received or bidding fails.

4. **Lazy Loading**:
   - Load ads only when they are in the viewport to optimize performance.

5. **Analytics**:
   - Track bid requests, wins, and errors using Google Analytics.

---

## **Setup Instructions**

### **Prerequisites**
1. Node.js (v16 or higher)
2. npm (v8 or higher)
3. Epress.js
4. Puppeteer (for Prebid.js integration)
5. Axios
6. Jest (for Jest.js integration)

### **Installation**
1. Clone the repository:
   ```bash
   git clone https://github.com/dejetem/header-bidding-system.git
   cd header-bidding-system
   ```
2. ```bash
    npm install
   ```
3. ```bash
    npm run dev
   ```

### **Tools and Technologies**
Backend:
Node.js with Express.js for the server.

Puppeteer for Prebid.js integration.

node-localstorage for persistent storage.

Frontend:
HTML, CSS, and JavaScript for the UI.

IntersectionObserver API for lazy loading.

Analytics:
Google Analytics for tracking events.

Testing:
Jest.
```bash
  npm test
```

Browser DevTools for debugging.

API: http://localhost:3000
open the index.html file in the public folder in the browser

### **API Endpoints**
Add Ad Unit:
POST /ad-unit
```javascript
Request Body:
{
  "id": "div-1",
  "sizes": [["300", "250"]],
  "deviceType": "desktop"
}

Response:
{
  "message": "Ad unit added successfully"
}
```

Request Bids:
POST /request-bids
```javascript
{
  "adHtml": "<div>Winning Ad</div>"
}
```

