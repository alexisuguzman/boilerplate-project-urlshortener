require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const dns = require("dns");
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
let urlDatabase = {};
let idCounter = 1;

app.use(bodyParser.urlencoded({ extended: false }));

// Verify valid url and create a new urlDatabase object
app.post("/api/shorturl", (req, res) => {
  const originalUrl = req.body.url;
  const urlPattern = /^(http|https):\/\/[^ "]+$/;

  if (!urlPattern.test(originalUrl)) {
    return res.json({ error: "invalid url" });
  }

  const hostname = new URL(originalUrl).hostname;

  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: "Invalid url" });
    }
  });

  const shortUrl = idCounter++;
  urlDatabase[shortUrl] = originalUrl;

  res.json({ original_url: originalUrl, short_url: shortUrl });
});

//Redirect short URLs
app.get("/api/shorturl/:shortUrl", (req, res) => {
  const shortUrl = parseInt(req.params.shortUrl, 10);
  const originalUrl = urlDatabase[shortUrl];
  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: "Invalid url" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
