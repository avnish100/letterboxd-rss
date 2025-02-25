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
    const username = req.query.username || "avnishjha";

    const LETTERBOXD_RSS_FEED_URL = `https://letterboxd.com/${username}/rss/`;
    const response = await fetch(LETTERBOXD_RSS_FEED_URL);
    const text = await response.text();

    // Parse the RSS feed
    const movies = [];
    const regex = /<item>.*?<title>(.*?),\s*(\d{4})\s*-\s*((?:★|½)*)\s*<\/title>.*?<link>(.*?)<\/link>.*?<pubDate>(.*?)<\/pubDate>.*?<description>(?:.*?src="(.*?)")?.*?<\/description>/gs;
    let match;
    while ((match = regex.exec(text)) && movies.length < limit) {
      // Convert star symbols to numeric rating
      const ratingText = match[3] || "";
      let rating = 0;
      
      if (ratingText) {
        const fullStars = (ratingText.match(/★/g) || []).length;
        const hasHalf = ratingText.includes('½');
        rating = fullStars + (hasHalf ? 0.5 : 0);
      }
      
      movies.push({
        title: match[1].trim(),
        year: parseInt(match[2]),
        rating: rating,
        link: match[4],
        published: new Date(match[5]).toISOString(),
        imageUrl: match[6] || "",
        summary: match[6] ? match[0].split('"/>')[1].replace(/<[^>]*>/g, "").trim() : "",
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