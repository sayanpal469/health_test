import nodemailer from "nodemailer";
import ApiResponse from "../utils/ApiResponse.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Registration OTP",
      text: `Your OTP is: ${otp}`,
      html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
    });
  } catch (error) {
    throw new ApiResponse(500, null, "Failed to send OTP email");
  }
};

const sendVerificationEmail = async (email, token) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

    await transporter.sendMail({
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email",
      html: `
                <p>Please click the link below to verify your email:</p>
                <a href="${verificationUrl}">Verify Email</a>
                <p>Or copy this link: ${verificationUrl}</p>
            `,
    });
  } catch (error) {
    throw new ApiResponse(500, null, "Failed to send verification email");
  }
};

export { sendOtpEmail, sendVerificationEmail };
