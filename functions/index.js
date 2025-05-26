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
      // Get all RSS feeds from Firestore
      const feedsSnapshot = await db.collection('feeds').get();
      
      for (const feedDoc of feedsSnapshot.docs) {
        const feedData = feedDoc.data();
        const feedUrl = feedData.url;
        
        console.log(feedUrl);
        try {
          // Parse the RSS feed
          const feed = await parser.parseURL(feedUrl);
          
          // Get the latest item
          const latestItem = feed.items[0];
          
          // Check if we have new content
          const lastUpdated = feedData.lastUpdated || 0;
          const newItemDate = new Date(latestItem.pubDate).getTime();
          
          console.log(newItemDate, lastUpdated);
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
            
            // Make POST request with the new data
            const webhookUrl = "https://device.li/llj0vztkg890wcybj3n9?from=littleprinter";
            

            await fetch(webhookUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'text/html',
              },
              body: `<h1>${latestItem.title}</h1><br/>${latestItem.content}`
            });
            
            console.log(`Updated feed: ${feed.title}`);
          }
        } catch (error) {
          console.error(`Error processing feed ${feedUrl}:`, error);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error in processRSSFeeds:', error);
      throw error;
    }
  }); 