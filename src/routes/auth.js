import express from "express";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import {sendEmail} from "../utils/sendEmail.js"; // your existing email function
import crypto from "crypto";

const router = express.Router();

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ "contactDetail.email": email });
    if (!user)
      return res.status(404).json({ success: false, message: "Email not found" });

    const otp = crypto.randomInt(100000, 999999).toString();

    await Otp.create({
      email,
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    await sendEmail(email, "Your Password Reset OTP", `Your OTP is: ${otp}`);

    return res.json({ success: true, message: "OTP sent successfully" });
  } catch (e) {
    console.error("FORGOT PASSWORD ERROR:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
});




import bcrypt from "bcryptjs";

router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const otpRecord = await Otp.findOne({ email, code: otp });
    if (!otpRecord)
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

    // Update password
    const hash = await bcrypt.hash(newPassword, 12);

    await User.findOneAndUpdate(
      { "contactDetail.email": email },
      { "security.passwordHash": hash }
    );

    // Remove OTP after use
    await Otp.deleteMany({ email });

    return res.json({ success: true, message: "Password reset successful" });
  } catch (e) {
    console.error("RESET PASSWORD ERROR:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



export default router;
