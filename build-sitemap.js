const fs = require("fs");

const API_KEY = process.env.YT_KEY;
const CHANNEL_ID = "UCQKYoj8mNNJw4XQ6xB2gFkA";

async function run() {
  const channel = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`
  ).then(r => r.json());

  const uploads = channel.items[0].contentDetails.relatedPlaylists.uploads;

  const playlist = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploads}&maxResults=30&key=${API_KEY}`
  ).then(r => r.json());

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
}

run();
