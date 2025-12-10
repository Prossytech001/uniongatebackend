
import axios from "axios";

export async function sendEmail(to, subject, html) {
  try {
    const res = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "UnionGate Bank",
          email: "support@priyonconcept.com",
        },
        to: [{ email: to }],
        htmlContent: html,
        subject,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 5000,
      }
    );

    console.log("BREVO SENT:", res.data);
    return true;
  } catch (err) {
    console.error("BREVO API ERROR:", err);
    throw err;
  }
}
