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
          <div style="font-family: Arial;">
            <h2>Verify Your Email</h2>
            <p>Click the link below to verify your account:</p>
            <a href="${verifyLink}" 
               style="display:inline-block;padding:10px 15px;background:#000;color:#fff;text-decoration:none;">
              Verify Email
            </a>
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
