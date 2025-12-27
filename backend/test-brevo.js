import brevo from "@getbrevo/brevo";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

console.log(
  "BREVO_API_KEY loaded:",
  process.env.BREVO_API_KEY?.startsWith("xkeysib-")
);

const client = new brevo.TransactionalEmailsApi();
client.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

const email = new brevo.SendSmtpEmail({
  sender: { name: "Stride", email: process.env.EMAIL_SENDER },
  to: [{ email: "youremail@example.com" }],
  subject: "✅ Brevo API Test",
  htmlContent: "<h2>This is a test email from Stride!</h2>",
});

try {
  const res = await client.sendTransacEmail(email);
  console.log("✅ Success:", res);
} catch (err) {
  console.error("❌ Error:", err.response?.text || err.message);
}
