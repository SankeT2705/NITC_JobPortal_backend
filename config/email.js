// config/email.js
import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

// ✅ Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ Generic sendMail function
export const sendMail = async ({ to, subject, text }) => {
  try {
    const data = await resend.emails.send({
      from: "NITC Job Portal <noreply@resend.dev>", // You can replace with verified domain later
      to,
      subject,
      text,
    });

    console.log(`✅ Email sent to ${to}: ${data.id || "Success"}`);
  } catch (error) {
    console.error(`❌ Email sending failed: ${error.message}`);
    throw error;
  }
};
