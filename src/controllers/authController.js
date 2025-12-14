import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { formatValidationErrors } from "../utils/formatErrors.js";
import Account from "../models/Account.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {sendEmail} from "../utils/sendEmail.js";
import PendingUser from "../models/PendingUser.js";





// export const register = async (req, res) => {
//   // -------------------- VALIDATE INPUT --------------------
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

//     // -------------------- ACCOUNT NUMBER GENERATORS --------------------
//     function generateAccountNumber() {
//       return String(Math.floor(1000000000 + Math.random() * 9000000000));
//     }

//     function generateAccountId() {
//       return "UG-" + Date.now() + "-" + Math.floor(Math.random() * 99999);
//     }

//     // -------------------- CREATE BANK ACCOUNT --------------------
//     const account = await Account.create({
//       user: user._id,  // must match schema field name
//       accountNumber: generateAccountNumber(),
//       accountId: generateAccountId(),

//       balances: {
//         usd: { available: 0, ledger: 0 },
//         usdt: { available: 0, ledger: 0 },
//         btc: { available: 0, ledger: 0 },
//       },

//       limits: {},
//       analytics: {},
//     });

//     // -------------------- JWT TOKEN --------------------
//     const token = generateToken({ userId: user._id });

//     // -------------------- RESPONSE --------------------
//     return res.status(201).json({
//       message: "Account created (pre-KYC).",
//       token,
//       needsVerification: true,
//       user: {
//         id: user._id,
//         username: user.personalInfo.username,
//         email: user.contactDetail.email,
//         accountNumber: account.accountNumber, // NOW VALID
//         accountId: account.accountId,         // NOW VALID
//         accountType: user.accountSetup.accountType,
//       },
//     });

//   } catch (e) {
//     console.error("REGISTER ERROR:", e);
//     return res.status(500).json({ error: e.message });
//   }
// };

// export const registerStep1 = async (req, res) => {
//   try {
//     const { personalInfo, contactDetail, password } = req.body;

//     // EMAIL + PHONE UNIQUE CHECKS
//     if (await User.findOne({ "contactDetail.email": contactDetail.email.toLowerCase() }))
//       return res.status(400).json({ error: "Email already in use" });

//     if (await User.findOne({ "contactDetail.phone": contactDetail.phone }))
//       return res.status(400).json({ error: "Phone already in use" });

//     const passwordHash = await bcrypt.hash(password, 12);

//     // Generate verification token
//     const verifyToken = crypto.randomBytes(32).toString("hex");

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
//       security: {
//         passwordHash,
//         isEmailVerified: false,
//         emailVerifyToken: verifyToken,
//         emailVerifyExpires: Date.now() + 1000 * 60 * 60 * 24, // 24 hours
//       }
//     });

//     // SEND EMAIL VERIFICATION
//     const verifyURL = `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`;

//     await sendEmail({
//       to: contactDetail.email,
//       subject: "Verify your UnionGate Email",
//       html: `
//         <h3>Welcome to UnionGate</h3>
//         <p>Click the button below to verify your email:</p>
//         <a href="${verifyURL}" style="padding:10px;background:#114a43;color:white;border-radius:6px;">
//           Verify Email
//         </a>
//         <p>This link expires in 24 hours.</p>
//       `
//     });

//     res.json({
//       message: "Step 1 complete. Please verify your email.",
//       userId: user._id
//     });

//   } catch (e) {
//     console.error("REGISTER STEP1 ERROR:", e);
//     res.status(500).json({ error: e.message });
//   }
// };


// export const registerStep1 = async (req, res) => {
//   try {
//     const { personalInfo, contactDetail, password } = req.body;

//     // Check duplicates
//     if (await User.findOne({ "contactDetail.email": contactDetail.email }))
//       return res.status(400).json({ error: "Email already in use" });

//     if (await User.findOne({ "personalInfo.username": personalInfo.username.toLowerCase() }))
//       return res.status(400).json({ error: "Username already in use" });

//     // TEMP store password hash
//     const passwordHash = await bcrypt.hash(password, 12);

//     // Create user in "pending verification" mode
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
//       security: {
//         passwordHash,
//         isEmailVerified: false,
//       },
//     });

//     // Create verification token (valid 30 mins)
//     const verifyToken = jwt.sign(
//       { userId: user._id },
//       process.env.JWT_SECRET,
//       { expiresIn: "30m" }
//     );

//     const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`;

//     // Send email
//     await sendMail(
//       user.contactDetail.email,
//       "Verify your UnionGate Email",
//       `
//         <h2>Email Verification</h2>
//         <p>Click below to activate your account.</p>
//         <a href="${verifyUrl}">Verify Email</a>
//       `
//     );

//     res.json({
//       message: "Verification email sent",
//       userId: user._id,
//     });

//   } catch (e) {
//     console.error("REGISTER STEP1 ERROR:", e);
//     res.status(500).json({ error: "Server error" });
//   }
// };
// export const registerStep1 = async (req, res) => {
//   try {
//     const { personalInfo, contactDetail, password } = req.body;

//     // Hash password now
//     const passwordHash = await bcrypt.hash(password, 12);

//     // Generate email verification code
//     const code = Math.floor(100000 + Math.random() * 900000).toString();

//     // Create TEMP TOKEN storing step1 data
//     const tempToken = jwt.sign(
//       {
//         step: "verify-email",
//         personalInfo,
//         contactDetail,
//         passwordHash,
//         code,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "10m" }
//     );

//     // Send email
//     await sendEmail(contactDetail.email, code);

//     res.json({
//       message: "Verification code sent",
//       tempToken,
//     });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
// export const registerStep1 = async (req, res) => {
//   try {
//     const { personalInfo, contactDetail, password } = req.body;

//     // Hash password now
//     const passwordHash = await bcrypt.hash(password, 12);

//     // Generate 6-digit verification code
//     const code = Math.floor(100000 + Math.random() * 900000).toString();

//     // Create TEMP TOKEN to continue registration
//     const tempToken = jwt.sign(
//       {
//         step: "verify-email",
//         personalInfo,
//         contactDetail,
//         passwordHash,
//         code,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "10m" }
//     );

//     // Build HTML email
//     const html = `
//       <div style="font-family:Arial, sans-serif; padding:22px; background:#f7f7f7;">
//         <div style="max-width:500px; margin:auto; background:white; padding:30px; border-radius:10px;">

//           <h2 style="color:#114a43; margin-bottom:10px;">Verify Your Email</h2>

//           <p style="font-size:15px; color:#333;">
//             Hello ${personalInfo.legalFirstName},<br/><br/>
//             Thank you for creating an account with <strong>UnionGate Bank</strong>.
//             Please use the verification code below to continue your registration.
//           </p>

//           <div style="
//             font-size:32px;
//             font-weight:bold;
//             letter-spacing:4px;
//             background:#d8e28c;
//             color:#114a43;
//             padding:12px 20px;
//             border-radius:8px;
//             text-align:center;
//             width:max-content;
//             margin:20px auto;
//           ">
//             ${code}
//           </div>

//           <p style="font-size:14px; color:#555; text-align:center;">
//             This code expires in <strong>10 minutes</strong>.
//           </p>

//           <br/>
//           <p style="font-size:14px; color:#555;">UnionGate Bank</p>
//         </div>
//       </div>
//     `;

//     // Send email
//     await sendEmail(contactDetail.email, "Your UnionGate Verification Code", code,html);

//     res.json({
//       message: "Verification code sent",
//       tempToken,
//     });

//   } catch (err) {
//     console.error("REGISTER STEP1 ERROR:", err);
//     res.status(500).json({ error: err.message });
//   }
// };
export const registerStep1 = async (req, res) => {
  try {
    const { personalInfo, contactDetail, password } = req.body;

    const passwordHash = await bcrypt.hash(password, 12);

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const tempToken = jwt.sign(
      {
        step: "verify-email",
        personalInfo,
        contactDetail,
        passwordHash,
        code,
      },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    const html = `
      <div style="font-family:Arial; padding:25px;">
        <h2>Your UnionGate Verification Code</h2>
        <p>Hello ${personalInfo.legalFirstName}, use the code below:</p>
        <div style="font-size:32px; font-weight:bold; padding:12px; background:#d8e28c; color:#114a43; width:max-content;">
          ${code}
        </div>
      </div>
    `;

    await sendEmail(
      contactDetail.email,
      "Your UnionGate Verification Code",
      html
    );

    res.json({
      message: "Verification code sent",
      tempToken,
    });

  } catch (err) {
    console.error("REGISTER STEP1 ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// EMAIL VERIFY -------------------------------------
// export const verifyEmail = async (req, res) => {
//   try {
//     const { userId, code } = req.body;

//     const pending = await PendingUser.findById(userId);
//     if (!pending) return res.status(404).json({ error: "Invalid user" });

//     if (pending.verificationCode !== code)
//       return res.status(400).json({ error: "Invalid verification code" });

//     if (pending.verificationExpires < Date.now())
//       return res.status(400).json({ error: "Code expired" });

//     // Email verified
//     pending.verified = true;
//     await pending.save();

//     res.json({ message: "Email verified", ok: true });

//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// };
export const verifyEmailStep = async (req, res) => {
  try {
    const { tempToken, code } = req.body;

    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);

    if (decoded.code !== code) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    // Issue a new token for next step (no code needed)
    const nextToken = jwt.sign(
      {
        step: "account-setup",
        personalInfo: decoded.personalInfo,
        contactDetail: decoded.contactDetail,
        passwordHash: decoded.passwordHash,
      },
      process.env.JWT_SECRET,
      { expiresIn: "20m" }
    );

    res.json({
      message: "Email verified",
      nextToken,
    });

  } catch (e) {
    res.status(400).json({ error: "Verification expired. Restart signup." });
  }
};



// export const registerStep2 = async (req, res) => {
//   try {
//     const { userId, accountType, transactionPin } = req.body;

//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ error: "User not found" });

//     if (!user.security.isEmailVerified)
//       return res.status(403).json({ error: "Email not verified" });

//     const pinHash = await bcrypt.hash(transactionPin, 12);

//     user.accountSetup = {
//       accountType,
//       transactionPinHash: pinHash,
//     };

//     await user.save();

//     // Create real bank account now
//     const account = await Account.create({
//       user: user._id,
//       accountNumber: String(Math.floor(1000000000 + Math.random() * 9000000000)),
//       accountId: "UG-" + Date.now(),
//       balances: { usd:{available:0,ledger:0}, usdt:{available:0,ledger:0}, btc:{available:0,ledger:0} }
//     });

//     res.json({
//       message: "Account setup complete.",
//       accountNumber: account.accountNumber
//     });

//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// };



// 
export const registerStep3 = async (req, res) => {
  try {
    const { nextToken, accountType, transactionPin } = req.body;

    if (!nextToken) return res.status(400).json({ error: "Missing verification token" });
    if (!transactionPin || transactionPin.length !== 4)
      return res.status(400).json({ error: "PIN must be 4 digits" });

    // Decode previous registration step
    const decoded = jwt.verify(nextToken, process.env.JWT_SECRET);

    // Ensure this token is from step 2
    if (decoded.step !== "account-setup") {
      return res.status(400).json({ error: "Invalid registration flow" });
    }

    // Hash PIN
    const pinHash = await bcrypt.hash(transactionPin, 12);

    // Build final token for last step
    const finalToken = jwt.sign(
      {
        step: "complete-registration",
        personalInfo: decoded.personalInfo,
        contactDetail: decoded.contactDetail,
        passwordHash: decoded.passwordHash,
        accountType,
        pinHash,
      },
      process.env.JWT_SECRET,
      { expiresIn: "20m" }
    );

    res.json({
      message: "Continue to final step",
      finalToken,
    });

  } catch (e) {
    console.log("STEP 3 ERROR:", e);
    return res.status(400).json({ error: "please go back and fill up all the details" });
  }
};


// STEP 2 -------------------------------------------
export const registerStep2 = async (req, res) => {
  try {
    const { userId, accountType, transactionPin } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.security.isEmailVerified)
      return res.status(401).json({ error: "Email not verified" });

    // Hash PIN
    const pinHash = await bcrypt.hash(transactionPin, 12);

    user.accountSetup = {
      accountType,
      transactionPinHash: pinHash,
    };

    await user.save();

    res.json({ message: "Step 2 completed" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// STEP 3 FINALIZE -----------------------------------
// export const finalizeRegistration = async (req, res) => {
//   try {
//     const { userId, acceptTerms } = req.body;

//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ error: "User not found" });

//     if (!user.security.isEmailVerified)
//       return res.status(401).json({ error: "Email not verified" });

//     user.security.hasAcceptedTerms = acceptTerms;
//     await user.save();

//     // Generate account numbers
//     const accountNumber = String(Math.floor(1000000000 + Math.random() * 9000000000));
//     const accountId = "UG-" + Date.now();

//     await Account.create({
//       user: userId,
//       accountNumber,
//       accountId,
//       balances: {
//         usd: { available: 0, ledger: 0 },
//         usdt: { available: 0, ledger: 0 },
//         btc: { available: 0, ledger: 0 },
//       },
//     });

//     res.json({
//       message: "Registration completed, proceed to login",
//     });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
export const completeRegistration = async (req, res) => {
  try {
    const { finalToken } = req.body;

    const decoded = jwt.verify(finalToken, process.env.JWT_SECRET);

    // CREATE USER
    const user = await User.create({
      personalInfo: decoded.personalInfo,
      contactDetail: decoded.contactDetail,
      accountSetup: {
        accountType: decoded.accountType,
        transactionPinHash: decoded.pinHash,
      },
      security: {
        passwordHash: decoded.passwordHash,
        termsAcceptedAt: new Date(),
      }
    });

    // CREATE ACCOUNT
    const account = await Account.create({
      user: user._id,
      accountNumber: String(Math.floor(1000000000 + Math.random() * 9000000000)),
      accountId: "UG-" + Date.now(),
      balances: {
        usd: { available: 0, ledger: 0 },
        usdt: { available: 0, ledger: 0 },
        btc: { available: 0, ledger: 0 },
      }
    });

    // Issue login token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Account created",
      token,
      userId: user._id
    });

  } catch (e) {
    res.status(400).json({ error: "please go back and fill up all the details" });
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

// export const login = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ "contactDetail.email": email.toLowerCase() });
//     if (!user) return res.status(400).json({ error: "Invalid credentials" });

//     const ok = await bcrypt.compare(password, user.security.passwordHash);
//     if (!ok) return res.status(400).json({ error: "Invalid credentials" });


    

//     user.lastLoginAt = new Date();
//     await user.save();

//     const token = generateToken({ userId: user._id });
//     // res.json({
//     //   token,
//     //   user: {
//     //     id: user._id,
//     //     username: user.personalInfo.username,
//     //     email: user.contactDetail.email,
//     //     accountType: user.accountSetup.accountType
//     //   }
//     // });
//     res.json({
//   token,
//   user: {
//     id: user._id,
//     username: user.personalInfo.username,
//     email: user.contactDetail.email,
//     accountType: user.accountSetup.accountType,
//     hasAcceptedTerms: user.hasAcceptedTerms,
//     kycCompleted: user.kycCompleted
//   }
// });
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// };
// export const loginStep1 = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Normalize email
//     const user = await User.findOne({ "contactDetail.email": email.toLowerCase() })
//       .select("+security.passwordHash +accountSetup.transactionPinHash");

//     if (!user) return res.status(400).json({ error: "Invalid credentials" });

//     // Check password
//     const ok = await bcrypt.compare(password, user.security.passwordHash);
//     if (!ok) return res.status(400).json({ error: "Invalid credentials" });

//     // If needed, add email verification enforcement
//     // if (!user.security.isEmailVerified) {
//     //   return res.status(403).json({ error: "Email not verified" });
//     // }

//     // Create TEMP login token (valid 5 mins)
//     const tempToken = generateToken(
//       { userId: user._id, step: "pin" },
//       "5m" // expires in 5 minutes
//     );

//     res.json({
//       message: "Password OK. Enter your PIN.",
//       tempToken,
//       requiresPin: true
//     });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
export const loginStep1 = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ "contactDetail.email": email.toLowerCase() })
      .select("+security.passwordHash +accountSetup.transactionPinHash");

    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.security.passwordHash);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });

    // Create temporary token for PIN step
    const tempToken = jwt.sign(
      { userId: user._id, step: "pin" },
      process.env.JWT_SECRET,
      { expiresIn: "5m" } // 5 minutes only
    );

    return res.json({
      message: "Password OK. Enter your PIN.",
      requiresPin: true,
      tempToken
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};



// export const loginStep2 = async (req, res) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) return res.status(401).json({ error: "Session expired, login again" });

//     const tempToken = authHeader.split(" ")[1];
//     if (!tempToken) return res.status(401).json({ error: "Session expired, login again" });

//     let decoded;
//     try {
//       decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
//     } catch (e) {
//       return res.status(401).json({ error: "Session expired, login again" });
//     }

//     const user = await User.findById(decoded.userId);
//     if (!user)
//       return res.status(404).json({ error: "User not found" });

//     const { pin } = req.body;

//     const ok = await bcrypt.compare(pin, user.accountSetup.transactionPinHash);
//     if (!ok) {
//       return res.status(400).json({ error: "Invalid PIN" });
//     }

//     // Create final JWT
//     const finalToken = jwt.sign(
//       { userId: user._id },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     return res.json({
//       message: "Login successful",
//       token: finalToken
//     });

//   } catch (e) {
//     console.error("LOGIN STEP2 ERROR:", e);
//     return res.status(500).json({ error: "Server error" });
//   }
// };
export const loginStep2 = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "Session expired, login again" });

    const tempToken = authHeader.split(" ")[1];
    if (!tempToken)
      return res.status(401).json({ error: "Session expired, login again" });

    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Session expired, login again" });
    }

    // 🔥 Ensure this token is ONLY for PIN verification
    if (decoded.step !== "pin") {
      return res.status(401).json({ error: "Invalid login session" });
    }

    const user = await User.findById(decoded.userId).select(
      "+accountSetup.transactionPinHash"
    );

    if (!user)
      return res.status(404).json({ error: "User not found" });

    const { pin } = req.body;

    const ok = await bcrypt.compare(pin, user.accountSetup.transactionPinHash);
    if (!ok) {
      return res.status(400).json({ error: "Invalid PIN" });
    }

    // Generate REAL login token
    const finalToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token: finalToken
    });

  } catch (err) {
    console.error("LOGIN STEP2 ERROR:", err);
    return res.status(500).json({ error: "Something went wrong" });
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
