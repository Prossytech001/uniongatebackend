// import mongoose from "mongoose";

// const BalanceSchema = new mongoose.Schema({
//   available: { type: Number, default: 0 },   // money user can spend
//   ledger: { type: Number, default: 0 },      // pending + available
//   currency: { type: String, required: true } // USD or USDT
// }, { _id: false });

// const LimitSchema = new mongoose.Schema({
//   dailyTransferLimit: { type: Number, default: 5000 },  // daily outgoing cap
//   monthlyTransferLimit: { type: Number, default: 30000 },
//   dailyWithdrawalLimit: { type: Number, default: 2000 },
//   maxSingleTransaction: { type: Number, default: 5000 }
// }, { _id: false });

// const AnalyticsSchema = new mongoose.Schema({
//   monthlyIncome: { type: Number, default: 0 },
//   monthlySpending: { type: Number, default: 0 },
//   lastMonthIncome: { type: Number, default: 0 },
//   lastMonthSpending: { type: Number, default: 0 }
// }, { _id: false });

// const AccountSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

//   accountNumber: { type: String, unique: true, required: true },
//   accountId: { type: String, unique: true, required: true },     // internal unique bank ID

//   balances: {
//     usd: { type: BalanceSchema, default: () => ({ currency: "USD" }) },
//     usdt: { type: BalanceSchema, default: () => ({ currency: "USDT" }) }
//   },

//   limits: { type: LimitSchema, default: () => ({}) },

//   analytics: { type: AnalyticsSchema, default: () => ({}) },

//   status: {
//     isActive: { type: Boolean, default: true },
//     isFrozen: { type: Boolean, default: false },
//     freezeReason: { type: String, default: null }
//   },

//   createdAt: { type: Date, default: Date.now }
// });

// export default mongoose.model("Account", AccountSchema);
import mongoose from "mongoose";

const BalanceSchema = new mongoose.Schema(
  {
    available: { type: Number, default: 0 },
    ledger: { type: Number, default: 0 },
    currency: { type: String, default: null }, // no longer required
  },
  { _id: false }
);

const LimitSchema = new mongoose.Schema(
  {
    dailyTransferLimit: { type: Number, default: 200000 },
    monthlyTransferLimit: { type: Number, default: 3000000 },
    dailyWithdrawalLimit: { type: Number, default: 100000 },
    maxSingleTransaction: { type: Number, default: 10000 },
  },
  { _id: false }
);

const AnalyticsSchema = new mongoose.Schema(
  {
    monthlyIncome: { type: Number, default: 0 },
    monthlySpending: { type: Number, default: 0 },
    lastMonthIncome: { type: Number, default: 0 },
    lastMonthSpending: { type: Number, default: 0 },
  },
  { _id: false }
);

const AccountSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

  accountNumber: { type: String, unique: true, required: true },
  accountId: { type: String, unique: true, required: true },

  balances: {
    usd: { type: BalanceSchema, default: () => ({ available: 0, ledger: 0 }) },
    usdt: { type: BalanceSchema, default: () => ({ available: 0, ledger: 0 }) },
    btc: { type: BalanceSchema, default: () => ({ available: 0, ledger: 0 }) }, // add BTC support
  },

  limits: { type: LimitSchema, default: () => ({}) },

  analytics: { type: AnalyticsSchema, default: () => ({}) },

  status: {
    isActive: { type: Boolean, default: true },
    isFrozen: { type: Boolean, default: false },
    freezeReason: { type: String, default: null },
  },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Account", AccountSchema);
