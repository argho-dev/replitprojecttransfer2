import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const MUSIC_DIR = path.resolve("artifacts/birthday-surprise/public/music");

// Ensure folder exists
fs.mkdirSync(MUSIC_DIR, { recursive: true });

const ALLOWED = ["01","02","03","04","05","06","07","08","09","10"];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, MUSIC_DIR),
  filename: (req, _file, cb) => {
    const track = (req.body?.track || req.query?.track || "").toString().padStart(2, "0");
    if (!ALLOWED.includes(track)) return cb(new Error("Invalid track number"), "");
    cb(null, `${track}.mp3`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("audio/") || file.originalname.endsWith(".mp3")) {
      cb(null, true);
    } else {
      cb(new Error("Only MP3 files allowed"));
    }
  },
});

const router = Router();

router.post("/upload-music", upload.single("file"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file received" });
    return;
  }
  res.json({ ok: true, saved: req.file.filename, size: req.file.size });
});

router.get("/music-status", (_req, res) => {
  const files = fs.readdirSync(MUSIC_DIR).filter(f => f.endsWith(".mp3"));
  const status = ALLOWED.map(n => ({
    track: n,
    uploaded: files.includes(`${n}.mp3`),
  }));
  res.json({ status });
});

export default router;
