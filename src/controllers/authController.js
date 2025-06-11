import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import logger from "../utils/logger.js";
import { generateToken } from "../middlewares/authMiddleware.js";

// Login
export const loginUser = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    const user = await User.findOne({ phoneNumber });

    if (!user) {
      logger.warn("User Not Found Try Again !");
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Invalid password attempt for phone: ${phoneNumber}`);
      return res
        .status(401)
        .json({ message: "Invalid Phone Number or Password." });
    }

    const token = generateToken(user);

    logger.info(`User logged in successfully: ${phoneNumber}`);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
