import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import {
  register,
  login,
  googleLogin,
  me,
  changePassword,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/google", asyncHandler(googleLogin));
router.get("/me", requireAuth, asyncHandler(me));
router.put("/password", requireAuth, asyncHandler(changePassword));

export default router;
