# Little Printer RSS Feed Processor

A Firebase Cloud Function that monitors RSS feeds and sends updates to a Little Printer device.

## What it does

This function:
1. Runs every 12 hours in the europe-west3 region
2. Reads RSS feed URLs from a Firestore collection called "feeds"
3. Checks each feed for new content
4. When new content is found:
   - Updates the feed document in Firestore with the latest data
   - Sends the new content to a Little Printer device via webhook

## Setup

1. Install dependencies:
```bash
cd functions
npm install
```

2. Deploy to Firebase:
```bash
firebase deploy --only functions
```

## Firestore Structure

The function expects a collection called "feeds" with documents containing:
- `url`: The RSS feed URL to monitor
- `lastUpdated`: (automatically managed) Timestamp of the last update
- `latestData`: (automatically managed) Object containing the latest feed item's data

## Testing

You can test the function manually through the Firebase Console:
1. Go to Firebase Console > Functions
2. Find "processRSSFeeds"
3. Click the three dots menu (⋮)
4. Select "Test function"
5. Use this test event:
```json
{
  "data": {
    "message": {
      "data": "test"
    }
  }
}
```

## Output Format

When new content is found, it sends a POST request to the Little Printer webhook with:
- Content-Type: text/html
- Body: HTML formatted content with the feed item's title and content 