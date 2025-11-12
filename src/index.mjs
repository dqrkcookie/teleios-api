import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Detection from "./mongoose/schema/schema.mjs";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGO_URI || "mongodb+srv://teleios_db:teleios_db1@cluster0.q0iubnl.mongodb.net/detection";

try {
  await mongoose.connect(mongoUri);
  console.log("Connected to Database");
} catch (err) {
  console.log(err);
}

app.get("/", (req, res) => {
  res.status(200).send({ msg: "Server is running" });
});

app.post("/detection", async (req, res) => {
  const { body } = req;
  try {
    const newDetection = await Detection.create(body);
    return res
      .status(200)
      .send({ msg: "detection created successfully", data: newDetection });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ msg: "error in creating detection" });
  }
});

app.get("/detection", async (req, res) => {
  try {
    const detections = await Detection.find().sort({ timestamp: -1 });
    res.status(200).json(detections);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching detections" });
  }
});

app.get("/video-link", async (req, res) => {
  const LINKS = {
    thermalCamera:
      "https://subsection-leading-minutes-petersburg.trycloudflare.com/stream/thermal",
    nightVisionCamera:
      "https://subsection-leading-minutes-petersburg.trycloudflare.com/stream/night_vision",
  };

  const withTimeout = (ms) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ms);
    return { controller, timeout };
  };

  async function isReachable(url) {
    try {
      const { controller, timeout } = withTimeout(2000);
      const resp = await fetch(url, {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return resp.ok;
    } catch (_err) {
      return false;
    }
  }

  try {
    const [thermalOk, nightOk] = await Promise.all([
      isReachable(LINKS.thermalCamera),
      isReachable(LINKS.nightVisionCamera),
    ]);

    res.json({
      thermalCamera: thermalOk ? LINKS.thermalCamera : "loading...",
      nightVisionCamera: nightOk ? LINKS.nightVisionCamera : "loading...",
    });
  } catch (_err) {
    res.json({ thermalCamera: "loading...", nightVisionCamera: "loading..." });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
