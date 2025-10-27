import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {
  try {
    //Setup transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER, // Gmail address
        pass: process.env.SMTP_PASS,  // App password (not normal password)
      },
    });

    //Email content
    const mailOptions = {
      from: `"NITC Job Portal" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    };

    //Send email
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent successfully to: ${to}`);
  } catch (err) {
    console.error("❌ Error sending email:", err.message);
  }
};
