// import express from "express";
// import bcrypt from "bcryptjs";
// import Admin from "../models/Admin.js"; // adjust path
// import adminAuth from "../middleware/adminAuth.js";

// const router = express.Router();

// router.put("/change-password", adminAuth, async (req, res) => {

//     console.log("REQ.ADMIN:", req.admin); 
//   console.log("TOKEN:", req.headers.authorization);
//   try {
//     const adminId = req.admin.id;
//     const { currentPassword, newPassword } = req.body;

//     const admin = await Admin.findById(adminId).select("+password");
//     if (!admin) {
//       return res.status(404).json({ success: false, message: "Admin not found" });
//     }

//     // Validate current password
//     const isMatch = await bcrypt.compare(currentPassword, admin.password);
//     if (!isMatch) {
//       return res.status(400).json({
//         success: false,
//         message: "Current password is incorrect",
//       });
//     }

//     // Hash new password
//     const newHash = await bcrypt.hash(newPassword, 12);
//     admin.password = newHash;
//     await admin.save();

//     return res.json({ success: true, message: "Password updated successfully" });
//   } catch (err) {
//     console.error("CHANGE ADMIN PASSWORD ERROR:", err);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// export default router;
import express from "express";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

router.put("/change-password", adminAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.admin.adminId);

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect current password" });
    }

    admin.password = await bcrypt.hash(newPassword, 12);
    await admin.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("CHANGE ADMIN PASSWORD ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
