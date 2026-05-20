import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import {
  register,
  login,
  me,
  changePassword,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/me", requireAuth, asyncHandler(me));
router.put("/password", requireAuth, asyncHandler(changePassword));

export default router;
