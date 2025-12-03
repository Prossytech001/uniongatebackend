import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { kycSaveRules, kycDocRules } from "../validation/kycValidators.js";
import { saveKyc, uploadKycDocs, finalizeKyc, getKyc } from "../controllers/kycController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// Save all JSON sections (personal, employment, nextOfKin)
router.patch("/save", requireAuth, kycSaveRules, saveKyc);

// Upload documents (multipart): fields 'front', 'back', body 'docType'
router.post(
  "/upload-docs",
  requireAuth,
  upload.fields([{ name: "front", maxCount: 1 }, { name: "back", maxCount: 1 }]),
  kycDocRules,
  uploadKycDocs
);

// Finalize/submit KYC
router.post("/submit", requireAuth, finalizeKyc);

// Get current KYC state
router.get("/", requireAuth, getKyc);

export default router;
