// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

// export default async function sendEmail({ to, subject, html }) {
//   await transporter.sendMail({
//     from: `"UnionGate Bank" <${process.env.EMAIL_USER}>`,
//     to,
//     subject,
//     html
//   });
// }
// import { Resend } from "resend";

// export async function sendEmail(to, subject, html) {
//   // Load API key at run-time (after dotenv has loaded)
//   const apiKey = process.env.RESEND_API_KEY;

//   if (!apiKey) {
//     console.error("❌ RESEND_API_KEY missing");
//     throw new Error("Email service misconfigured");
//   }

//   const resend = new Resend(apiKey);

//   try {
//     const result = await resend.emails.send({
//       from: process.env.EMAIL_FROM,
//       to,
//       subject,
//       html,
//     });

//     console.log("Email sent:", result);
//     return result;
//   } catch (err) {
//     console.error("Email send error:", err);
//     throw err;
//   }
// }
// import { Resend } from "resend";

// export async function sendEmail(to, subject, html) {
//   const apiKey = process.env.RESEND_API_KEY;

//   if (!apiKey) throw new Error("RESEND_API_KEY missing");

//   if (!html || html.trim().length === 0) {
//     throw new Error("Email HTML body is required");
//   }

//   const resend = new Resend(apiKey);

//   return await resend.emails.send({
//     from: process.env.EMAIL_FROM,
//     to,
//     subject,
//     html
//   });
// }
// import nodemailer from "nodemailer";

// export const sendEmail = async (to, code) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       port: Number(process.env.SMTP_PORT),
//       secure: false, // <-- MUST be false for port 587
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//       },
//     });

//     const info = await transporter.sendMail({
//       from: process.env.EMAIL_FROM,
//       to,
//       subject: "UnionGate Email Verification Code",
//       html: `
//         <p>Your verification code:</p>
//         <h2 style="font-size: 24px; letter-spacing: 3px;">${code}</h2>
//       `,
//     });

//     console.log("Email sent:", info);
//   } catch (error) {
//     console.error("SMTP EMAIL ERROR:", error);
//     throw error;
//   }
// };
// import nodemailer from "nodemailer";

// export const sendEmail = async (to, code) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       port: Number(process.env.SMTP_PORT),
//       secure: false,
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//       },
//       tls: {
//         rejectUnauthorized: false, // IMPORTANT FIX
//       },
//     });

//     const info = await transporter.sendMail({
//       from: process.env.EMAIL_FROM,
//       to,
//       subject: "UnionGate Email Verification Code",
//       html: `
//         <p style="font-size:16px">Your verification code:</p>
//         <h2 style="font-size:28px; letter-spacing:4px">${code}</h2>
//       `,
//     });

//     console.log("EMAIL SENT:", info);
//   } catch (error) {
//     console.error("SMTP EMAIL ERROR:", error);
//     throw error;
//   }
// };
// import nodemailer from "nodemailer";

// export const sendEmail = async (to, code) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       port: process.env.SMTP_PORT,
//       secure: false, // Bravo uses TLS upgrade
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//       },
//       tls: {
//         rejectUnauthorized: false,
//       },
//     });

//     const html = `
//       <div style="font-family: Arial; padding: 20px;">
//         <h2 style="color:#114a43;">Your UnionGate Verification Code</h2>
//         <p>Your verification code is:</p>
//         <div style="
//           font-size: 32px; 
//           font-weight: bold; 
//           letter-spacing: 4px;
//           background:#f3f3f3;
//           padding: 12px 20px;
//           display:inline-block;
//           border-radius: 8px;">
//           ${code}
//         </div>
//         <p>This code expires in 10 minutes.</p>
//       </div>
//     `;
// console.log("EMAIL SENDING WITH CODE:", code);

//     const info = await transporter.sendMail({
//       from: process.env.EMAIL_FROM,
//       to,
//       subject: "Your UnionGate Verification Code",
//       html, // <-- IMPORTANT
//     });

//     console.log("EMAIL SENT:", info);
//   } catch (err) {
//     console.error("SMTP EMAIL ERROR:", err);
//   }
// };
// import nodemailer from "nodemailer";

// export const sendEmail = async (to, subject, text, html) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       port: Number(process.env.SMTP_PORT),
//       secure: false, // for port 587
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS
//       },
//       tls: {
//         rejectUnauthorized: false
//       }
//     });

//     const info = await transporter.sendMail({
//       from: `"UnionGate Bank" <${process.env.SMTP_USER}>`,
//       to,
//       subject,
//       text,
//       html
//     });

//     console.log("EMAIL SENT:", info);
//     return info;

//   } catch (err) {
//     console.error("SMTP EMAIL ERROR:", err);
//     throw err;
//   }
// };
import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,      // support@priyonconcept.com
        pass: process.env.SMTP_PASS,      // your brevo SMTP key
      },
      tls: {
        rejectUnauthorized: false,
      }
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,       // "UnionGate Bank <support@priyonconcept.com>"
      to,
      subject,
      html,
    });

    console.log("EMAIL SENT:", info);
    return info;

  } catch (err) {
    console.error("SMTP EMAIL ERROR:", err);
    throw err;
  }
};
