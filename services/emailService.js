const axios = require("axios");

const sendVerificationEmail = async (email, verifyLink) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "PONNO",
          email: "ponno.team@gmail.com",
        },
        to: [
          {
            email: email,
          },
        ],
        subject: "Verify your email - PONNO",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; background:#f6f6f6; padding:20px;">
            <div style="max-width:520px;margin:auto;background:#ffffff;padding:24px;border-radius:10px;">
              
              <h2 style="color:#111;margin-bottom:10px;">
                Welcome to PONNO 👋
              </h2>

              <p style="color:#333;font-size:14px;line-height:1.5;">
                Thank you for registering. Please verify your email address to activate your account.
              </p>

              <a href="${verifyLink}"
                 style="display:inline-block;margin-top:16px;padding:12px 20px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">
                Verify Email
              </a>

              <p style="margin-top:20px;font-size:12px;color:#777;line-height:1.4;">
                If you did not create this account, you can safely ignore this email.
              </p>

              <hr style="margin:20px 0;border:none;border-top:1px solid #eee;" />

              <p style="font-size:11px;color:#999;">
                © ${new Date().getFullYear()} PONNO. All rights reserved.
              </p>

            </div>
          </div>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },
      },
    );
  } catch (error) {
    console.log("BREVO ERROR:", error.response?.data || error.message);
  }
};

module.exports = { sendVerificationEmail };
