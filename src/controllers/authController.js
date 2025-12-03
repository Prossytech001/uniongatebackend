import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { formatValidationErrors } from "../utils/formatErrors.js";
import Account from "../models/Account.js";




export const register = async (req, res) => {
  // -------------------- VALIDATE INPUT --------------------
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const friendly = errors.array().map(e => e.msg);
    return res.status(400).json({ error: friendly[0] });
  }

  console.log("REGISTER BODY:", req.body);

  const { personalInfo, contactDetail, accountSetup, security } = req.body;

  try {
    // -------------------- UNIQUENESS CHECKS --------------------
    if (await User.findOne({ "contactDetail.email": contactDetail.email }))
      return res.status(400).json({ error: "Email already in use" });

    if (await User.findOne({ "contactDetail.phone": contactDetail.phone }))
      return res.status(400).json({ error: "Phone already in use" });

    if (await User.findOne({ "personalInfo.username": personalInfo.username.toLowerCase() }))
      return res.status(400).json({ error: "Username already in use" });

    // -------------------- HASH PASSWORD + PIN --------------------
    if (!accountSetup.transactionPin)
      return res.status(400).json({ error: "Transaction PIN is required" });

    const passwordHash = await bcrypt.hash(security.password, 12);
    const pinHash = await bcrypt.hash(accountSetup.transactionPin, 12);

    // -------------------- CREATE USER --------------------
    const user = await User.create({
      personalInfo: {
        legalFirstName: personalInfo.legalFirstName,
        middleName: personalInfo.middleName,
        legalLastName: personalInfo.legalLastName,
        username: personalInfo.username.toLowerCase(),
      },
      contactDetail: {
        email: contactDetail.email.toLowerCase(),
        phone: contactDetail.phone,
        country: contactDetail.country,
      },
      accountSetup: {
        accountType: accountSetup.accountType,
        transactionPinHash: pinHash,
      },
      security: {
        passwordHash,
        termsAcceptedAt: new Date(),
      },
    });

    // -------------------- ACCOUNT NUMBER GENERATORS --------------------
    function generateAccountNumber() {
      return String(Math.floor(1000000000 + Math.random() * 9000000000));
    }

    function generateAccountId() {
      return "UG-" + Date.now() + "-" + Math.floor(Math.random() * 99999);
    }

    // -------------------- CREATE BANK ACCOUNT --------------------
    const account = await Account.create({
      user: user._id,  // must match schema field name
      accountNumber: generateAccountNumber(),
      accountId: generateAccountId(),

      balances: {
        usd: { available: 0, ledger: 0 },
        usdt: { available: 0, ledger: 0 },
        btc: { available: 0, ledger: 0 },
      },

      limits: {},
      analytics: {},
    });

    // -------------------- JWT TOKEN --------------------
    const token = generateToken({ userId: user._id });

    // -------------------- RESPONSE --------------------
    return res.status(201).json({
      message: "Account created (pre-KYC).",
      token,
      needsVerification: true,
      user: {
        id: user._id,
        username: user.personalInfo.username,
        email: user.contactDetail.email,
        accountNumber: account.accountNumber, // NOW VALID
        accountId: account.accountId,         // NOW VALID
        accountType: user.accountSetup.accountType,
      },
    });

  } catch (e) {
    console.error("REGISTER ERROR:", e);
    return res.status(500).json({ error: e.message });
  }
};
// export const register = async (req, res) => {
//   // -------------------- VALIDATE INPUT ONCE --------------------
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const friendly = errors.array().map(e => e.msg);
//     return res.status(400).json({ error: friendly[0] });
//   }

//   console.log("REGISTER BODY:", req.body);

//   const { personalInfo, contactDetail, accountSetup, security } = req.body;

//   try {
//     // -------------------- UNIQUENESS CHECKS --------------------
//     if (await User.findOne({ "contactDetail.email": contactDetail.email }))
//       return res.status(400).json({ error: "Email already in use" });

//     if (await User.findOne({ "contactDetail.phone": contactDetail.phone }))
//       return res.status(400).json({ error: "Phone already in use" });

//     if (await User.findOne({ "personalInfo.username": personalInfo.username.toLowerCase() }))
//       return res.status(400).json({ error: "Username already in use" });

//     // -------------------- HASH PASSWORD + PIN --------------------
//     if (!accountSetup.transactionPin)
//       return res.status(400).json({ error: "Transaction PIN is required" });

//     const passwordHash = await bcrypt.hash(security.password, 12);
//     const pinHash = await bcrypt.hash(accountSetup.transactionPin, 12);

//     // -------------------- CREATE USER --------------------
//     const user = await User.create({
//       personalInfo: {
//         legalFirstName: personalInfo.legalFirstName,
//         middleName: personalInfo.middleName,
//         legalLastName: personalInfo.legalLastName,
//         username: personalInfo.username.toLowerCase(),
//       },
//       contactDetail: {
//         email: contactDetail.email.toLowerCase(),
//         phone: contactDetail.phone,
//         country: contactDetail.country,
//       },
//       accountSetup: {
//         accountType: accountSetup.accountType,
//         transactionPinHash: pinHash,
//       },
//       security: {
//         passwordHash,
//         termsAcceptedAt: new Date(),
//       },
//     });

//     // -------------------- CREATE BANK ACCOUNT --------------------
//     function generateAccountNumber() {
//       return String(Math.floor(1000000000 + Math.random() * 9000000000)); // 10 digits
//     }

//     function generateAccountId() {
//       return "UG-" + Date.now() + "-" + Math.floor(Math.random() * 99999);
//     }

//    await Account.create({
//       user: user._id,  // ✅ correct
//       accountNumber: generateAccountNumber(),
//       accountId: generateAccountId(),

//       balances: {
//         usd: { available: 0, ledger: 0 },
//         usdt: { available: 0, ledger: 0 },
//         btc: { available: 0, ledger: 0 }
//       },

//       limits: {},
//       analytics: {},
//     });


//     // -------------------- JWT TOKEN --------------------
//     const token = generateToken({ userId: user._id });

//     return res.status(201).json({
//       message: "Account created (pre-KYC).",
//       token,
//       needsVerification: true,
//       user: {
//         id: user._id,
//         username: user.personalInfo.username,
//         email: user.contactDetail.email,
//         accountNumber: account.accountNumber, // return account number
//         accountId: account.accountId,
//         accountType: user.accountSetup.accountType,
//       },
//     });

//   } catch (e) {
//     console.error("REGISTER ERROR:", e);
//     return res.status(500).json({ error: e.message });
//   }
// };

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ "contactDetail.email": email.toLowerCase() });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.security.passwordHash);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });


    

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken({ userId: user._id });
    // res.json({
    //   token,
    //   user: {
    //     id: user._id,
    //     username: user.personalInfo.username,
    //     email: user.contactDetail.email,
    //     accountType: user.accountSetup.accountType
    //   }
    // });
    res.json({
  token,
  user: {
    id: user._id,
    username: user.personalInfo.username,
    email: user.contactDetail.email,
    accountType: user.accountSetup.accountType,
    hasAcceptedTerms: user.hasAcceptedTerms,
    kycCompleted: user.kycCompleted
  }
});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-security.passwordHash -accountSetup.transactionPinHash");
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const logout = async (_req, res) => {
  // If you're storing tokens client-side, the client can just delete it.
  // If using cookies, you can clear the cookie here.
  res.json({ message: "Logged out" });
};
