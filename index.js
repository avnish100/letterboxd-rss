const express = require("express");
const app = express();

// Enable CORS for Framer
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Replace this with your Letterboxd RSS feed URL
const LETTERBOXD_RSS_FEED_URL = "https://letterboxd.com/avnishjha/rss/";

app.get("/latest-movies", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const username = req.query.username || "avnishjha"; // Add default username

    const LETTERBOXD_RSS_FEED_URL = `https://letterboxd.com/${username}/rss/`;
    const response = await fetch(LETTERBOXD_RSS_FEED_URL);
    const text = await response.text();

    // Parse the RSS feed
    const movies = [];
    const regex = /<item>.*?<title>(.*?)<\/title>.*?<link>(.*?)<\/link>.*?<pubDate>(.*?)<\/pubDate>.*?<description>(?:.*?src="(.*?)")?.*?<\/description>/gs;
    let match;
    while ((match = regex.exec(text)) && movies.length < limit) {
      movies.push({
        title: match[1],
        link: match[2],
        published: new Date(match[3]).toISOString(),
        imageUrl: match[4] || "", // Changed null to empty string for better Framer compatibility
        summary: match[4] ? match[0].split('"/>')[1].replace(/<[^>]*>/g, "").trim() : "",
      });
    }

    // Wrap the response in a data object for better Framer compatibility
    res.json({
      data: movies,
      status: "success",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: "error",
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));