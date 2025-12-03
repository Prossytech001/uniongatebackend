export const requireVerification = async (req, res, next) => {
  const user = await User.findById(req.user.userId);

  if (!user) return res.status(404).json({ error: "User not found" });

  if (!user.hasAcceptedTerms) {
    return res.status(403).json({ redirect: "/dashboard/verify-account" });
  }

  if (!user.kycCompleted) {
    return res.status(403).json({ redirect: "/dashboard/kyc" });
  }

  next();
};
