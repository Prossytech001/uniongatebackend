import mongoose from "mongoose";

const PendingUserSchema = new mongoose.Schema({
  personalInfo: {
    legalFirstName: String,
    middleName: String,
    legalLastName: String,
    username: String,
  },

  contactDetail: {
    email: String,
    phone: String,
    country: String,
  },

  passwordHash: String,

  verified: { type: Boolean, default: false },

  verificationCode: String,
  verificationExpires: Date,

}, { timestamps: true });

export default mongoose.model("PendingUser", PendingUserSchema);
