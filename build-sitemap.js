const fs = require("fs");

const API_KEY = process.env.YT_KEY;
const CHANNEL_ID = "UCQKYoj8mNNJw4XQ6xB2gFkA";

async function fetchJSON(url) {
  const res = await fetch(url);

  const text = await res.text();

  // 🔥 THIS IS THE IMPORTANT PART
  if (!res.ok) {
    throw new Error("HTTP " + res.status + " - " + text);
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error("Invalid JSON: " + text);
  }
}

async function run() {
  try {
    console.log("Starting sitemap build...");

    if (!API_KEY) {
      throw new Error("Missing YT_KEY environment variable");
    }

    const channel = await fetchJSON(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`
    );

    const uploads =
      channel.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploads) {
      throw new Error("Could not find uploads playlist");
    }

    const playlist = await fetchJSON(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploads}&maxResults=30&key=${API_KEY}`
    );

    if (!playlist.items) {
      throw new Error("No playlist items returned");
    }

    const urls = playlist.items.map(item => {
      const id = item.snippet.resourceId.videoId;

      return `
  <url>
    <loc>https://tops.stream/videos.html?v=${id}</loc>
    <changefreq>weekly</changefreq>
  </url>`;
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://tops.stream/</loc>
    <changefreq>daily</changefreq>
  </url>
${urls.join("\n")}
</urlset>`;

    fs.writeFileSync("sitemap.xml", sitemap);

    console.log("Sitemap generated successfully");
  } catch (err) {
    console.error("🔥 ERROR:", err.message);
    process.exit(1);
  }
}

run();
