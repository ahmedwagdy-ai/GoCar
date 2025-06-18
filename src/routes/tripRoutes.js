import express from "express";
import {
  requestTrip,
  getNewTrips,
  acceptTrip,
  rejectTrip,
  inLocation,
  startTrip,
  endTrip,
  cancelTrip,
  getAllTrips,
  getTripById,
  updateTrip,
  deleteTrip
} from "../controllers/tripController.js";

const router = express.Router();

router.post("/request", requestTrip);

router.get("/newTrips", getNewTrips);

router.patch("/accept/:id", acceptTrip);

router.patch("/reject/:id", rejectTrip);

router.patch("/arrived/:id", inLocation);

router.patch("/start/:id", startTrip);

router.patch("/end/:id", endTrip);

router.patch("/cancel/:id", cancelTrip);

router.get("/allTrips", getAllTrips);

router.get("/getTrip/:id", getTripById);

router.patch("/update/:id", updateTrip);

router.delete("/delete/:id", deleteTrip);

export default router;
