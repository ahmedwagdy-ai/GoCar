import express from "express";
import {
  register,
  getAllDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
} from "../controllers/driverController.js";
import upload from "../middlewares/uploadImage.js";
import userMiddleware from "../middlewares/userMiddleware.js";
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post("/register", upload.single("licenseImage"), userMiddleware, register);

router.get("/getAll", getAllDrivers);

router.get("/getDriver/:id", userMiddleware, getDriverById);

router.patch("/update/:id", upload.single("licenseImage"), userMiddleware, updateDriver);

router.delete("/delete/:id", userMiddleware, deleteDriver);

export default router;
