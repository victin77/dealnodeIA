import path from "path";
import { Router } from "express";
import multer from "multer";
import { asyncHandler, HttpError } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import {
  listMeetings,
  getStats,
  getInsights,
  getMeeting,
  createMeeting,
  updateMeeting,
  deleteMeeting,
} from "../controllers/meetings.controller";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".dat";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const ALLOWED = /audio\/|video\/|application\/octet-stream/;

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.test(file.mimetype)) return cb(null, true);
    cb(new HttpError(400, "Formato nao suportado. Envie audio ou video."));
  },
});

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(listMeetings));
router.get("/stats", asyncHandler(getStats));
router.get("/insights", asyncHandler(getInsights));
router.get("/:id", asyncHandler(getMeeting));
router.post("/", upload.single("file"), asyncHandler(createMeeting));
router.patch("/:id", asyncHandler(updateMeeting));
router.delete("/:id", asyncHandler(deleteMeeting));

export default router;
