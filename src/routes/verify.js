import express from "express";
import User from "../models/User.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/accept-terms", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    user.hasAcceptedTerms = true;
    await user.save();

    res.json({ message: "Terms accepted. Proceed to KYC.", kycRequired: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
