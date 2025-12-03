// export const acceptKycTerms = async (req, res) => {
//   try {
//     const userId = req.user.userId;

//     const user = await User.findByIdAndUpdate(
//       userId,
//       { kycTermsAccepted: true },
//       { new: true }
//     );

//     return res.json({
//       message: "Terms accepted. Proceed to verification.",
//       user
//     });

//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// };
import User from "../models/User.js";

export const acceptKycTerms = async (req, res) => {
  try {
    const userId = req.user.userId;  // this comes from requireAuth

    const user = await User.findByIdAndUpdate(
      userId,
      { kycTermsAccepted: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      message: "Terms accepted. Proceed to verification.",
      user
    });

  } catch (e) {
    console.log("KYC ERROR:", e);
    res.status(500).json({ error: e.message });
  }
};
