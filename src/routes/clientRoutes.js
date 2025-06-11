import express from "express";
import {
  register,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
} from "../controllers/clientController.js";
import userMiddleware from "../middlewares/userMiddleware.js";

const router = express.Router();

router.post("/register", userMiddleware, register);

router.get("/getAll", getAllClients);

router.get("/getClient/:id", userMiddleware, getClientById);

router.patch("/update/:id", userMiddleware, updateClient);

router.delete("/delete/:id", userMiddleware, deleteClient);

export default router;