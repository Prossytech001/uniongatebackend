import { body } from "express-validator";

export const kycSaveRules = [
  // personal
  body("personal.fullName").trim().notEmpty().withMessage("Full name is required"),
  body("personal.phone").trim().notEmpty().withMessage("Phone is required"),
  body("personal.email").isEmail().withMessage("Valid email required"),
  body("personal.title").optional().isIn(["Mr","Mrs","Miss","Ms","Dr","Prof","Other"]),
  body("personal.gender").optional().isIn(["Male","Female","Other"]),
  body("personal.zipcode").trim().notEmpty().withMessage("Zip/Postal code is required"),
  body("personal.dob").trim().notEmpty().withMessage("Date of birth is required"),

  // employment
  body("employment.idType").isIn(["SSN","NIN","SIN","BVN","Other"]).withMessage("Invalid ID type"),
  body("employment.idNumber").trim().notEmpty().withMessage("ID/SSN number is required"),
  body("employment.accountType").notEmpty().withMessage("Account Type is required"),
  body("employment.employmentType").isIn(["Employed","Self Employed","Student","Unemployed","Retired","Other"]),
  body("employment.salaryRange").trim().notEmpty().withMessage("Salary range is required"),

  // next of kin
  body("nextOfKin.beneficiaryLegalName").trim().notEmpty().withMessage("Beneficiary name is required"),
  body("nextOfKin.address").trim().notEmpty().withMessage("Next of kin address is required"),
  body("nextOfKin.age").isInt({ min: 0, max: 150 }).withMessage("Invalid age"),
  body("nextOfKin.relationship").trim().notEmpty().withMessage("Relationship is required"),
];

export const kycDocRules = [
  body("docType").isIn(["International Passport","National ID","Driver License"]).withMessage("Invalid document type"),
  // files are validated by multer presence
];
