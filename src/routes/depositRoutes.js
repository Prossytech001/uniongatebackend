// import express from "express";
// import { createDeposit } from "../controllers/depositController.js";
// import { depositWebhook } from "../controllers/depositWebhook.js";
// import {requireAuth} from "../middleware/authMiddleware.js";

// const router = express.Router();

// router.post("/create", requireAuth, createDeposit);
// router.post("/webhook", depositWebhook); // public

// export default router;
// import express from "express";
// import {requireAuth} from "../middleware/authMiddleware.js";
// import { createUsdtDeposit } from "../controllers/depositController.js";
// import { nowpaymentsWebhook } from "../controllers/depositWebhook.js";

// const router = express.Router();

// router.post("/create", requireAuth , createUsdtDeposit);
// router.post("/webhook", nowpaymentsWebhook);

// export default router;
// import express from "express";
// import crypto from "crypto";
// import Payment from "../models/Deposit.js";
// import Account from "../models/Account.js";
// import { createPayment } from "../utils/nowpayments.js";
// import {requireAuth} from "../middleware/authMiddleware.js";

// const router = express.Router();

// /**
//  * POST /api/deposit/create
//  * Body: { amount }
//  * -> returns { success, paymentUrl }
//  */
// router.post("/create", requireAuth, async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const amount = Number(req.body.amount);
//     if (!Number.isFinite(amount) || amount <= 0) {
//       return res.status(400).json({ success: false, message: "Invalid amount" });
//     }

//     const np = await createPayment(amount, userId /*, { sandboxCase: 'success' } */);

//     const payment = await Payment.create({
//       user: userId,
//       amount,
//       currency: (process.env.NOWPAY_PAY_CURRENCY || "usdttrc20").includes("usdt") ? "usdt" : "crypto",
//       status: "waiting",
//       paymentId: np.payment_id,
//       payAddress: np.pay_address || null,
//       invoiceUrl: np.pay_url || np.invoice_url || null,
//       transactionDetails: {
//         provider: "NOWPayments",
//         orderId: np.order_id,
//         price_amount: amount,
//         price_currency: process.env.NOWPAY_BASE_CURRENCY || "usd",
//         pay_currency: process.env.NOWPAY_PAY_CURRENCY || "usdttrc20",
//         raw: np,
//       },
//     });

//     console.log("NOWPAY_IPN_URL =>", process.env.NOWPAY_IPN_URL);
// console.log("NOWPAYMENTS_API_KEY =>", process.env.NOWPAYMENTS_API_KEY);
// console.log("NOWPAY_SUCCESS_URL =>", process.env.NOWPAY_SUCCESS_URL);


//     return res.status(201).json({
//       success: true,
//       paymentId: payment.paymentId,
//       amount: payment.amount,
//       currency: payment.currency,
//       paymentUrl: payment.invoiceUrl, // redirect user here
//     });
//   } catch (e) {
//   console.error("NOWPayments ERROR FULL RESPONSE:", e?.response?.data || e.message);
//   return res.status(500).json({
//     success: false,
//     message: e?.response?.data || e.message
//   });
// }

// });

// /**
//  * POST /api/deposit/ipn  (NOWPayments IPN)
//  * Validates HMAC and credits balance on 'finished'
//  */
// router.post("/ipn", async (req, res) => {
//   try {
//     const signature = req.header("x-nowpayments-sig") || "";
//     const secret = process.env.NOWPAYMENTS_IPN_SECRET || "";

//     const raw = req.rawBody || JSON.stringify(req.body || {});
//     const expectedSig = crypto.createHmac("sha512", secret).update(raw).digest("hex");
//     if (signature !== expectedSig) {
//       console.warn("Invalid IPN signature");
//       return res.status(401).json({ message: "Unauthorized IPN call" });
//     }

//     const { payment_id, payment_status, pay_amount, actually_paid, pay_currency } = req.body;
//     if (!payment_id || !payment_status) {
//       return res.status(400).json({ message: "Invalid IPN payload" });
//     }

//     const payment = await Payment.findOne({ paymentId: payment_id });
//     if (!payment) return res.status(404).json({ message: "Payment not found" });

//     // Save payload for audit
//     payment.transactionDetails = req.body;

//     // Idempotency
//     if (["finished", "failed", "refunded", "expired"].includes(payment.status)) {
//       await payment.save();
//       return res.json({ ok: true, message: "Already finalized" });
//     }

//     // Update info
//     payment.status = payment_status;
//     if (pay_currency) payment.payCurrency = pay_currency;
//     if (pay_amount != null) payment.payAmount = Number(pay_amount);
//     if (actually_paid != null) payment.actuallyPaid = Number(actually_paid);

//     // Credit once on 'finished'
//     if (payment_status === "finished" && !payment.creditedAt) {
//       await Account.updateOne(
//         { user: payment.user },
//         {
//           $inc: {
//             "balances.usdt.available": payment.amount,
//             "balances.usdt.ledger": payment.amount,
//           },
//         }
//       );
//       payment.creditedAt = new Date();
//     }

//     await payment.save();
//     return res.json({ ok: true, status: payment.status });
//   } catch (err) {
//     console.error("IPN Error:", err);
//     return res.status(500).json({ message: "Server error processing IPN" });
//   }
// });

// export default router;
import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { createDepositInvoice, depositIPN } from "../controllers/depositController.js";

const router = express.Router();

router.post("/create", requireAuth, createDepositInvoice);
router.post("/ipn", express.json({ verify: (req, _, buf) => req.rawBody = buf }), depositIPN);

export default router;
