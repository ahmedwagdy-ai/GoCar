import express from "express";
const router = express.Router();

import driverRoutes from "./driverRoutes.js";
import clientRoutes from "./clientRoutes.js"
import authRoutes from "./authRoutes.js"

router.use("/driver", driverRoutes);
router.use("/client", clientRoutes);
router.use("/auth", authRoutes);

export default router;
