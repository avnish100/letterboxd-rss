const express = require("express");
const app = express();

// Replace this with your Letterboxd RSS feed URL
const LETTERBOXD_RSS_FEED_URL = "https://letterboxd.com/avnishjha/rss/";

app.get("/latest-movies", async (req, res) => {
  try {
    const limit = 5;

    // Fetch the RSS feed
    const response = await fetch(LETTERBOXD_RSS_FEED_URL);
    const text = await response.text();

    // Parse the RSS feed (basic parsing)
    const movies = [];
    const regex = /<item>.*?<title>(.*?)<\/title>.*?<link>(.*?)<\/link>.*?<pubDate>(.*?)<\/pubDate>.*?<description>(.*?)<\/description>/gs;
    let match;
    while ((match = regex.exec(text)) && movies.length < limit) {
      movies.push({
        title: match[1],
        link: match[2],
        published: new Date(match[3]).toISOString(),
        summary: match[4].replace(/<[^>]*>/g, ""), // Remove HTML tags
      });
    }

    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));