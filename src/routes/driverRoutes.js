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

const router = express.Router();

router.post("/register", userMiddleware, upload.single("licenseImage"), register);

router.get("/getAll", getAllDrivers);

router.get("/getDriver/:id", userMiddleware, getDriverById);

router.put("/update/:id", userMiddleware, updateDriver);

router.delete("/delete/:id", userMiddleware, deleteDriver);

export default router;
