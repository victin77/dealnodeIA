import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import {
  listFolders,
  getFolder,
  createFolder,
  updateFolder,
  deleteFolder,
} from "../controllers/folders.controller";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(listFolders));
router.get("/:id", asyncHandler(getFolder));
router.post("/", asyncHandler(createFolder));
router.patch("/:id", asyncHandler(updateFolder));
router.delete("/:id", asyncHandler(deleteFolder));

export default router;
