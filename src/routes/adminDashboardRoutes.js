import User from "../models/User.js";
import express from "express";
import Transaction from "../models/Transaction.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

router.get("/overview", adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: "active" });
    const suspendedUsers = await User.countDocuments({ status: "suspended" });

    const totalTx = await Transaction.countDocuments();

    const totalDeposits = await Transaction.aggregate([
      { $match: { direction: "credit" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalWithdrawals = await Transaction.aggregate([
      { $match: { direction: "debit" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const recentTx = await Transaction.find()
      .populate("user", "personalInfo.username contactDetail.email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          suspended: suspendedUsers,
        },
        transactions: {
          total: totalTx,
          deposits: totalDeposits[0]?.total || 0,
          withdrawals: totalWithdrawals[0]?.total || 0,
        },
      },
      recent: {
        users: recentUsers,
        transactions: recentTx,
      },
    });
  } catch (e) {
    console.error("ADMIN OVERVIEW ERROR:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


export default router;