import express from "express";
const router = express.Router();
import { loginUser } from "../controllers/authController.js";
import {
  resetPassword,
  sendOTPForResetPassword,
} from "../controllers/resetPasswordController.js";

router.post("/login", loginUser);

// forgetPassword
router.post("/sendOtp", sendOTPForResetPassword);
router.put("/resetPassword", resetPassword);

export default router;
