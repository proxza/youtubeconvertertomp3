const express = require("express");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const ffmpegPath = require("ffmpeg-static");
const { slugify } = require("transliteration"); // Импортируем функцию slugify из библиотеки transliteration

const app = express();
const PORT = process.env.PORT || 5000;

ffmpeg.setFfmpegPath(ffmpegPath);

app.use(express.json());
app.use(express.static(path.join(__dirname, "client", "build")));

app.get("/download", async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send("URL is required");
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = slugify(info.videoDetails.title); // Используем slugify для обработки названия
    const tempOutputPath = path.join(__dirname, `${title}.mp3`);

    const videoReadableStream = ytdl(url, { quality: "highestaudio", filter: "audioonly" });

    ffmpeg(videoReadableStream)
      .audioBitrate(128)
      .save(tempOutputPath)
      .on("end", () => {
        res.json({ title: `${title}.mp3`, path: tempOutputPath });
      })
      .on("error", (error) => {
        console.error("FFmpeg error:", error);
        res.status(500).send("Failed to convert video to audio");
      });
  } catch (error) {
    console.error("Error retrieving video information:", error);
    res.status(500).send("Failed to retrieve video information");
  }
});

app.get("/download-file", (req, res) => {
  const filePath = req.query.path;
  const title = req.query.title;
  res.download(filePath, title, (err) => {
    if (err) {
      console.error("Error during download:", err);
      res.status(500).send("Error during download");
    }
    fs.unlink(filePath, (err) => {
      if (err) console.error("Failed to delete temp file", err);
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
