import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { getAccountOverview } from "../controllers/accountController.js";

const router = express.Router();

// GET /api/account/me
router.get("/me", requireAuth, getAccountOverview);

export default router;
