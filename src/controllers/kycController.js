import { validationResult } from "express-validator";
import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";

export const saveKyc = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const userId = req.user.userId;
  const { personal, employment, nextOfKin } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "kyc.personal": personal,
          "kyc.employment": employment,
          "kyc.nextOfKin": nextOfKin,
          "kyc.status.submitted": false // not submitted until docs uploaded & finalized
        }
      },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({ message: "KYC details saved", kyc: user.kyc });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
export const uploadKycDocs = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { docType } = req.body;

    // helper function
    const uploadBuffer = (buffer, filename) =>
      new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: "uniongate/kyc",
            public_id: filename,
            resource_type: "image"
          },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        ).end(buffer);
      });

    let frontUrl, backUrl;

    if (req.files?.front?.[0]) {
      const result = await uploadBuffer(
        req.files.front[0].buffer,
        `${userId}_front`
      );
      frontUrl = result.secure_url;
    }

    if (req.files?.back?.[0]) {
      const result = await uploadBuffer(
        req.files.back[0].buffer,
        `${userId}_back`
      );
      backUrl = result.secure_url;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "kyc.documents.docType": docType,
          ...(frontUrl && { "kyc.documents.frontUrl": frontUrl }),
          ...(backUrl && { "kyc.documents.backUrl": backUrl })
        }
      },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      message: "Documents uploaded successfully",
      documents: user.kyc.documents
    });

  } catch (e) {
    console.error("UPLOAD ERROR:", e);
    res.status(500).json({ error: e.message });
  }
};


// export const uploadKycDocs = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

//   const userId = req.user.userId;
//   const { docType } = req.body;

//   try {
//     // Expecting fields: front (file), back (file)
//     const uploads = {};

//     // if (req.files?.front?.[0]) {
//     //   const r = await cloudinary.uploader.upload_stream(
//     //     { folder: "uniongate/kyc", resource_type: "image" },
//     //     (err, result) => {}
//     //   );
//     // }

//     // Helper to wrap upload_stream
//     const uploadBuffer = (buf, filename) =>
//       new Promise((resolve, reject) => {
//         const stream = cloudinary.uploader.upload_stream(
//           { folder: "uniongate/kyc", public_id: filename, resource_type: "image" },
//           (err, result) => (err ? reject(err) : resolve(result))
//         );
//         stream.end(buf);
//       });

//     let frontUrl, backUrl;
//     if (req.files?.front?.[0]) {
//       const up = await uploadBuffer(req.files.front[0].buffer, `${userId}_front`);
//       frontUrl = up.secure_url;
//     }
//     if (req.files?.back?.[0]) {
//       const up = await uploadBuffer(req.files.back[0].buffer, `${userId}_back`);
//       backUrl = up.secure_url;
//     }

//     const user = await User.findByIdAndUpdate(
//       userId,
//       {
//         $set: {
//           "kyc.documents.docType": docType,
//           ...(frontUrl ? { "kyc.documents.frontUrl": frontUrl } : {}),
//           ...(backUrl ? { "kyc.documents.backUrl": backUrl } : {})
//         }
//       },
//       { new: true }
//     );

//     if (!user) return res.status(404).json({ error: "User not found" });

//     return res.json({
//       message: "Documents uploaded",
//       documents: user.kyc.documents
//     });
//   } catch (e) {
//     return res.status(500).json({ error: e.message });
//   }
// };

export const finalizeKyc = async (req, res) => {
  const userId = req.user.userId;
  try {
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    // Minimal completeness check
    const p = user.kyc?.personal;
    const e = user.kyc?.employment;
    const k = user.kyc?.nextOfKin;
    const d = user.kyc?.documents;

    if (!p?.fullName || !p?.dob || !e?.idNumber || !k?.beneficiaryLegalName || !d?.frontUrl) {
      return res.status(400).json({ error: "KYC is incomplete. Fill all required fields and upload documents." });
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "kyc.status.submitted": true,
          "kyc.status.approved": false,
          "kyc.status.reviewedAt": null,
          kycCompleted: true // gate to allow dashboard (you can set to false until admin approves)
        }
      },
      { new: true }
    );

    return res.json({ message: "KYC submitted successfully", kyc: updated.kyc });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

export const getKyc = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("kyc hasAcceptedTerms kycCompleted");
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
