const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Parser = require('rss-parser');
const fetch = require('node-fetch');
const config = require('./config');

// Initialize Firebase Admin with your project configuration
admin.initializeApp({
  projectId: config.projectId,
  storageBucket: config.storageBucket
});

const db = admin.firestore();
const parser = new Parser();

// Function to process RSS feeds
exports.processRSSFeeds = functions
  .runWith({
    timeoutSeconds: 300,
    memory: '256MB'
  })
  .region("europe-west3").pubsub.schedule('every 12 hours')
  .onRun(async (context) => {
    try {
      // Check if the function is paused
      const settingsDoc = await db.collection('settings').doc('main').get();
      if (!settingsDoc.exists) {
        console.log('Settings document not found, creating with default values');
        await db.collection('settings').doc('main').set({ paused: false });
      } else {
        const settings = settingsDoc.data();
        if (settings.paused) {
          console.log('Function is paused, skipping feed processing');
          return null;
        }
      }

      // Get all RSS feeds from Firestore
      const feedsSnapshot = await db.collection('feeds').get();
      const updates = [];
      
      for (const feedDoc of feedsSnapshot.docs) {
        const feedData = feedDoc.data();
        const feedUrl = feedData.url;
        
        try {
          // Parse the RSS feed
          const feed = await parser.parseURL(feedUrl);
          
          // Get the latest item
          const latestItem = feed.items[0];
          
          // Check if we have new content
          const lastUpdated = feedData.lastUpdated || 0;
          const newItemDate = new Date(latestItem.pubDate).getTime();
          
          if (newItemDate > lastUpdated) {
            console.log('new feed!');
            // Update the feed document with new data
            await feedDoc.ref.update({
              lastUpdated: newItemDate,
              latestData: {
                title: latestItem.title,
                link: latestItem.link,
                pubDate: latestItem.pubDate,
                content: latestItem.content
              }
            });

            // Collect the update
            updates.push({
              title: latestItem.title,
              content: latestItem.content
            });
          }
        } catch (error) {
          console.error(`Error processing feed ${feedUrl}:`, error);
        }
      }

      // If we have any updates, send them all in one webhook call
      if (updates.length > 0) {
        const webhookUrl = "https://device.li/llj0vztkg890wcybj3n9?from=littleprinter";
        
        // Create HTML content for all updates
        const htmlContent = updates.map(update => 
          `<h1>${update.title}</h1><br/>${update.content}`
        ).join('<hr/>');

        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/html',
          },
          body: htmlContent
        });

        console.log(`Sent ${updates.length} updates to Little Printer`);
      }
      
      return null;
    } catch (error) {
      console.error('Error in processRSSFeeds:', error);
      throw error;
    }
  }); 