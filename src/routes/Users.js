import express from "express";
import { acceptKycTerms } from "../controllers/userController.js";
import { requireAuth} from "../middleware/authMiddleware.js";

const router = express.Router();

router.patch("/accept-kyc-terms", requireAuth, acceptKycTerms);

export default router;
