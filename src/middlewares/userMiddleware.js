import mongoose from "mongoose";
import User from "../models/userModel.js";
import logger from "../utils/logger.js";

const userMiddleware = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { phoneNumber } = req.body;

        if (phoneNumber) {
            const existingPhone = await User.findOne({ phoneNumber });
            if (existingPhone) {
                return res.status(400).json({ success: false, message: "Phone number already exists" });
            }
        }

        if (id) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ success: false, message: "Invalid User ID format" });
            }

            const user = await User.findById(id, { password: 0, __v: 0 });

            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            req.document = user;
        }

        next();
    } catch (error) {
        logger.error("Error in UserMiddleware:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export default userMiddleware;
