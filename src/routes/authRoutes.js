import express from "express";
import { registerStep1, verifyEmailStep,registerStep3, completeRegistration,loginStep1,loginStep2 , me, logout } from "../controllers/authController.js";
import { registerRules, loginRules } from "../validation/authValidation.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register/step1", registerStep1);
router.post("/register/verify", verifyEmailStep);
router.post("/register/step3", registerStep3);
router.post("/register/complete", completeRegistration);
router.post("/login-step1",    loginRules,    loginStep1);
router.post("/login-step2",    loginRules,    loginStep2);
router.get("/me",        requireAuth,   me);
router.post("/logout",   requireAuth,   logout);

export default router;
