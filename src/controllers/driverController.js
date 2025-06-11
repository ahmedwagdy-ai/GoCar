import bcrypt from "bcryptjs";
import uploadToCloudinary from "../middlewares/uploadToCloudinary.js";
import logger from "../utils/logger.js";
import User from "../models/userModel.js"

export const register = async (req, res) => {
    try {
        const { fullName, password, role, phoneNumber, companyNumber, invitationCode } = req.body;
        
        await User.findOne({ phoneNumber });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let licenseImage = "";
        if (req.file) {
            try {
                // console.log(req.file.originalname);
                licenseImage = await uploadToCloudinary(req.file.buffer);
                // console.log(licenseImageUrl);
            } catch (error) {
                return res.status(500).json({ success: false, message: "licenseImage upload failed" });
            }
        }

        const newDriver = new User({
            fullName, 
            password: hashedPassword,
            role,
            phoneNumber, 
            licenseImage,
            companyNumber,
            invitationCode
        });
        
        await newDriver.save();
        res.status(201).json({ success: true, message: 'Driver registered successfully', data: newDriver });
    }
    catch (error) {
        logger.error(`Error registering Driver: ${error.message}`);
        res.status(500).json({ success: false, message: error.message})
    }
}

export const getAllDrivers = async (req, res) => {
    try {
        const Drivers = await User.find({}, { "password": 0, "__v": 0 });
        res.status(200).json({ success: true, data: Drivers });
    }
    catch (error) {
        logger.error(`Error getting all Drivers: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getDriverById = async (req, res) => {
    try {
        const { id } = req.params;
        const Driver = await User.findById(id, { password: 0, __v: 0 });

        res.status(200).json({ success: true, data: Driver });
    } catch (error) {
        logger.error(`Error getting Driver by ID: ${error.message}`);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const updateDriver = async (req, res) => {
    try {
        const { id } = req.params;

        let updateData = { ...req.body };

        if (req.file) {
            try {
                const uploadedImage = await uploadToCloudinary(req.file.buffer);
                updateData.licenseImage = uploadedImage;
        } catch (error) {
                return res.status(500).json({ success: false, message: "Image upload failed" });
        }
    }

        const updateDriver = await User.findByIdAndUpdate(id, updateData, { new: true });

        res.status(200).json({ success: true, message: 'Driver updated successfully', data: updateDriver });
    }
    catch (error) {
        logger.error(`Error updating Driver: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};


export const deleteDriver = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: 'Driver deleted successfully' });
    }
    catch (error) {
        logger.error(`Error deleting Driver: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};