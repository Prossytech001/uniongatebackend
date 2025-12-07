import mongoose from "mongoose";

const DepositSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: "pending" }, // pending | finished | failed
  paymentId: String,
  payAddress: String,
  invoiceUrl: String,
  payAmount: Number,
  payCurrency: String,
  credited: { type: Boolean, default: false },
  raw: Object,
}, { timestamps: true });

export default mongoose.model("Deposit", DepositSchema);
