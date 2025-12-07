// import axios from "axios";
// import Deposit from "../models/Deposit.js";
// import Account from "../models/Account.js";

// const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;

// export const createDeposit = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { amount } = req.body;

//     // Create NOWPayments payment
//     const payment = await axios.post(
//       "https://api.nowpayments.io/v1/payment",
//       {
//         price_amount: amount,
//         price_currency: "usd",
//         pay_currency: "usdttrc20",
//         ipn_callback_url: `${process.env.API_URL}/api/deposit/webhook`
//       },
//       {
//         headers: {
//           "x-api-key": NOWPAYMENTS_API_KEY,
//           "Content-Type": "application/json"
//         }
//       }
//     );

//     // Save deposit in DB
//     const deposit = await Deposit.create({
//       user: userId,
//       amount,
//       paymentId: payment.data.payment_id,
//       paymentUrl: payment.data.pay_url,
//     });

//     res.json({
//       message: "Deposit created",
//       paymentUrl: payment.data.pay_url,
//       deposit
//     });

//   } catch (e) {
//     console.error("CREATE DEPOSIT ERROR:", e);
//     res.status(500).json({ error: e.message });
//   }
// };
// import axios from "axios";
// import Deposit from "../models/Deposit.js";
// import Account from "../models/Account.js";

// const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;

// export const createUsdtDeposit = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { amount } = req.body;

//     // Create NOWPayments Invoice
//     const invoice = await axios.post(
//       "https://api.nowpayments.io/v1/invoice",
//       {
//         price_amount: amount,
//         price_currency: "usd",
//         pay_currency: "usdttrc20",
//         order_id: "DEP-" + Date.now(),
//         ipn_callback_url: `${process.env.API_URL}/api/deposit/webhook`,
//       },
//       {
//         headers: {
//           "x-api-key": NOWPAYMENTS_API_KEY,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const data = invoice.data;

//     // Save deposit to DB
//     const deposit = await Deposit.create({
//       user: userId,
//       amount,
//       address: data.pay_address,
//       payAmount: data.pay_amount,
//       invoiceId: data.id,
//       status: data.payment_status,
//     });

//     return res.json({
//       success: true,
//       depositId: deposit._id,
//       address: data.pay_address,
//       payAmount: data.pay_amount,
//       invoiceData: data,
//     });

//   } catch (e) {
//     console.error("CREATE DEPOSIT ERROR:", e.response?.data || e);
//     return res.status(500).json({ error: e.message });
//   }
// };
import axios from "axios";
import Deposit from "../models/Deposit.js";
import Account from "../models/Account.js";
import crypto from "crypto";

// export const createDeposit = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { amount } = req.body;

//     if (!amount || amount <= 0)
//       return res.status(400).json({ error: "Invalid amount" });

//     const payload = {
//       price_amount: amount,
//       price_currency: "usd",
//       pay_currency: "usdttrc20",
//       ipn_callback_url: process.env.NOWPAY_IPN_URL,
//       order_description: "Account Deposit",
//     };

//     const np = await axios.post(
//       `${process.env.NOWPAYMENTS_API_BASE}/payment`,
//       payload,
//       { headers: { "x-api-key": process.env.NOWPAYMENTS_API_KEY } }
//     );

//     const dep = await Deposit.create({
//       user: userId,
//       amount,
//       status: "pending",
//       paymentId: np.data.payment_id,
//       invoiceUrl: np.data.invoice_url,
//       payAddress: np.data.pay_address,
//       payAmount: np.data.pay_amount,
//       payCurrency: np.data.pay_currency,
//       raw: np.data
//     });

//     res.json({
//       success: true,
//       invoiceUrl: dep.invoiceUrl,
//       deposit: dep,
//     });

//   } catch (err) {
//     console.log("CREATE DEPOSIT ERROR:", err.response?.data || err);
//     res.status(500).json({ error: "Deposit creation failed" });
//   }
// };

export const createDepositInvoice = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const payload = {
      price_amount: amount,
      price_currency: "usd",
      pay_currency: "usdttrc20",
      order_description: "Account funding",
      ipn_callback_url: process.env.NOWPAY_IPN_URL,
      success_url: process.env.NOWPAY_SUCCESS_URL,
      cancel_url: process.env.NOWPAY_CANCEL_URL
    };

    const invoiceRes = await axios.post(
      "https://api.nowpayments.io/v1/invoice",
      payload,
      {
        headers: {
          "x-api-key": process.env.NOWPAYMENTS_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    const invoice = invoiceRes.data;

    await Deposit.create({
      user: userId,
      amount,
      invoiceId: invoice.id,
      invoiceUrl: invoice.invoice_url,
      status: "pending"
    });

    return res.json({
      message: "Invoice created",
      invoiceUrl: invoice.invoice_url,
      invoice
    });

  } catch (err) {
    console.error("CREATE INVOICE ERROR:", err.response?.data || err);
    res.status(500).json({ error: "Failed to create invoice" });
  }
};


// export const handleIPN = async (req, res) => {
//   try {
//     const signature = req.header("x-nowpayments-sig");
//     const secret = process.env.NOWPAYMENTS_IPN_SECRET;

//     const payload = JSON.stringify(req.body);
//     const expected = crypto.createHmac("sha512", secret).update(payload).digest("hex");

//     if (signature !== expected) {
//       console.log("INVALID IPN SIGNATURE");
//       return res.status(401).json({ error: "Unauthorized" });
//     }

//     const { payment_id, payment_status } = req.body;

//     const dep = await Deposit.findOne({ paymentId: payment_id });
//     if (!dep) return res.status(404).json({ error: "Deposit not found" });

//     dep.status = payment_status;
//     dep.raw = req.body;

//     // credit only once
//     if (payment_status === "finished" && !dep.credited) {
//       const acc = await Account.findOne({ user: dep.user });

//       acc.balances.usdt.available += dep.amount;
//       acc.balances.usdt.ledger += dep.amount;

//       await acc.save();

//       dep.credited = true;
//     }

//     await dep.save();

//     res.json({ success: true });
//   } catch (err) {
//     console.log("IPN ERROR:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };



export const depositIPN = async (req, res) => {
  try {
    const signature = req.headers["x-nowpayments-sig"];
    const secret = process.env.NOWPAYMENTS_IPN_SECRET;

    const rawBody = JSON.stringify(req.body);
    const expected = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");

    if (signature !== expected) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const { invoice_id, payment_status } = req.body;

    const deposit = await Deposit.findOne({ invoiceId: invoice_id });
    if (!deposit) return res.json({ ok: true });

    // Only credit once
    if (deposit.status === "finished") return res.json({ ok: true });

    deposit.status = payment_status;
    await deposit.save();

    if (payment_status === "finished") {
      const account = await Account.findOne({ user: deposit.user });
      account.balances.usdt.available += deposit.amount;
      await account.save();
    }

    return res.json({ ok: true });

  } catch (e) {
    console.error("IPN ERROR:", e);
    res.status(500).json({ error: "Server error" });
  }
};
