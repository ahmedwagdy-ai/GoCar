import bcrypt from "bcryptjs";
import Driver from "../models/driverModel.js"
import Client from "../models/clientModel.js";
import { sendOTP, verifyOTP } from "../services/otpMessage.js";

// إرسال OTP لإعادة تعيين كلمة المرور
export const sendOTPForResetPassword = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    // البحث عن المستخدم برقم الهاتف
    let user = await Driver.findOne({ phoneNumber });
    if (!user) {
      user = await Client.findOne({ phoneNumber });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // إرسال OTP لرقم الهاتف
    await sendOTP(phoneNumber);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("OTP send error:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

// إعادة تعيين كلمة المرور بعد التحقق من OTP
export const resetPassword = async (req, res) => {
  const { phoneNumber, otp, newPassword } = req.body;

  try {
    // التحقق من صحة OTP
    const isOTPValid = await verifyOTP(phoneNumber, otp);
    if (!isOTPValid) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // البحث عن المستخدم برقم الهاتف
    let user = await Driver.findOne({ phoneNumber});
    if (!user) {
      user = await Client.findOne({ phoneNumber });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // تحديث كلمة المرور
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
};
