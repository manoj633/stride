// utils/emailService.js
import brevo from "@getbrevo/brevo";
import SystemHealthLog from "../models/systemHealthLogModel.js";

const sendEmail = async (options) => {
  console.log("📨 Sending via Brevo API:", options.subject);

  const client = new brevo.TransactionalEmailsApi();
  client.setApiKey(
    brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
  );

  const email = new brevo.SendSmtpEmail();

  email.sender = { name: "Stride", email: process.env.EMAIL_SENDER };
  email.to = [{ email: options.email }];
  email.subject = options.subject;
  email.htmlContent = options.html;

  if (options.attachments?.length) {
    email.attachment = options.attachments.map((a) => ({
      name: a.filename,
      content: a.content.toString("base64"), // Base64 required for Brevo API
    }));
  }

  try {
    const response = await client.sendTransacEmail(email);
    console.log("✅ Brevo API email sent:", response.messageId);
    return response;
  } catch (err) {
    console.error("❌ Brevo API send failed:", err.message);
    await SystemHealthLog.create({
      component: "email_delivery",
      status: "failed",
      errorMessage: err.message,
      metadata: {
        recipientEmail: options.email,
        subject: options.subject,
      },
    }).catch((e) =>
      console.error(
        "Failed to log email failure to SystemHealthLog:",
        e.message
      )
    );
    throw err;
  }
};

export default sendEmail;
