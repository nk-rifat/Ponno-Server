const resend = require("../config/resend");

exports.sendVerificationEmail = async (email, verificationLink) => {
  try {
    await resend.emails.send({
      from: "PONNO <onboarding@resend.dev>",
      to: email,
      subject: "Verify your email - PONNO",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Verify Your Email</h2>
          <p>Click the button below to verify your account:</p>

          <a href="${verificationLink}" 
             style="
              display:inline-block;
              padding:10px 20px;
              background:#000;
              color:#fff;
              text-decoration:none;
              border-radius:6px;
             ">
            Verify Email
          </a>

          <p style="margin-top:20px;">
            This link will expire in 24 hours.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Resend email error:", error);
    throw new Error("Email sending failed");
  }
};
