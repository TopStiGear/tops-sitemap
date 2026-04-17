const fs = require("fs");
const https = require("https");

const API_KEY = process.env.YT_KEY;
const CHANNEL_ID = "UCQKYoj8mNNJw4XQ6xB2gFkA";

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";

      res.on("data", chunk => data += chunk);

      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error("Invalid JSON: " + data));
        }
      });
    }).on("error", reject);
  });
}

async function run() {
  try {
    console.log("Building sitemap...");

    const channel = await fetchJSON(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`
    );

    const uploads =
      channel.items[0].contentDetails.relatedPlaylists.uploads;

    const playlist = await fetchJSON(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploads}&maxResults=30&key=${API_KEY}`
    );

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

    console.log("Sitemap created successfully");
  } catch (err) {
    console.error("ERROR:", err.message);
    process.exit(1);
  }
}

run();
