import Trip from "../models/tripModel.js";
import logger from "../utils/logger.js";
import Driver from "../models/driverModel.js"
import Client from "../models/clientModel.js";
import DriverShift from "../models/driverShiftModel.js";
import { generateCode } from '../utils/generateCode.js';
import config from "../utils/config.js";


// request trip
export const requestTrip = async (req, res) => {
  try {
    const {
      client,
      driverShift,
      rideType,
      scheduledTime,
      notes,
      startLocation,
      endLocation,
      price,
      paymentMethod
    } = req.body;

    await Client.findById(client);
    const driverShiftDoc = await DriverShift.findById(driverShift);

    const driver = await Driver.findById(driverShiftDoc.driver);
    if (paymentMethod === "cash" && !driver.acceptCash) {
      return res.status(400).json({ 
        success: false, 
        message: "This driver does not accept cash payments" 
      });
    }

    const tripCode = generateCode();

    const trip = new Trip({
      client,
      driverShift,
      rideType,
      scheduledTime,
      notes,
      startLocation,
      endLocation,
      price,
      paymentMethod,
      tripCode
    });

    await trip.save();

    res.status(201).json({ success: true, message: "Trip requested successfully", data: trip });
  } catch (error) {
    logger.error("Error requesting trip:", error);
    res.status(500).json({ success: false, message: "Error requesting trip", error: error.message });
  }
};


// get new trips
export const getNewTrips = async (req, res) => {
  try {
     const trips = await Trip.find({ status: "pending" })
      .populate({
        path: "client",
        select: "fullName email phoneNumber isActive", 
      })
      .populate({
        path: "driverShift",
        select: "carType status startTime",
        populate: {
          path: "driver",
          select: "fullName email phoneNumber status acceptCash",
        }, });
    res.status(200).json({ success: true, data: trips });
  } catch (error) {
    logger.error(`Error getting trips: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

// accept trip
export const acceptTrip = async (req, res) => {
  try {
    const { id } = req.params; 
    const trip = await Trip.findById(id);
    
    if (trip.status !== "pending") {
      return res.status(400).json({ success: false, message: "Trip is not pending" });
    }

    trip.status = "accepted";
    await trip.save();

    await DriverShift.findByIdAndUpdate(
    trip.driverShift,
    { $push: { trips: trip._id } }
);
    await Driver.findByIdAndUpdate(
    trip.driver,
    { $push: { trips: trip._id } }
);
    res.status(200).json({ success: true, message: "Trip accepted", data: trip });
  } catch (error) {
    logger.error(`Error accepting trip: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

// reject trip
export const rejectTrip = async (req, res) => {
  try {
    const { id } = req.params; 
    const trip = await Trip.findById(id);

    if (trip.status !== "pending") {
      return res.status(400).json({ success: false, message: "Trip is not pending" });
    }

    trip.status = "rejected";
    await trip.save();

    res.status(200).json({ success: true, message: "Trip rejected", data: trip });
  } catch (error) {
    logger.error(`Error rejecting trip: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

// driver in location
export const inLocation = async (req, res) => {
  try {
    const { id } = req.params; 
    const trip = await Trip.findById(id);

    if (trip.status !== "accepted") {
      return res.status(400).json({ success: false, message: "Trip is not accepted" });
    }

    trip.status = "arrived";
    await trip.save();

    res.status(200).json({ success: true, message: "Now! Driver is in location", data: trip });
  } catch (error) {
    logger.error(`Error rejecting trip: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

// start trip
export const startTrip = async (req, res) => {
  try {
    const { id } = req.params; 
    const trip = await Trip.findById(id);

    if (trip.status !== "arrived") {
      return res.status(400).json({ success: false, message: "trip not arrived yet" });
    }

    trip.status = "ongoing";
    trip.startTime = new Date();
    await trip.save();

    res.status(200).json({ success: true, message: "trip started", data: trip });
  } catch (error) {
    logger.error(`Error starting trip: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

// end trip
export const endTrip = async (req, res) => {
  try {
    const { id } = req.params; 
    const trip = await Trip.findById(id);

    if (trip.status !== "ongoing") {
      return res.status(400).json({ success: false, message: "Trip is not ongoing" });
    }

    trip.status = "completed";
    trip.endTime = new Date();
    await trip.save();

    res.status(200).json({ success: true, message: "Trip ended", data: trip });
  } catch (error) {
    logger.error(`Error ending trip: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};


// cancel trip
export const cancelTrip = async (req, res) => {
  try {
    const { id } = req.params; 
    const { cancelReason } = req.body;
    const trip = await Trip.findById(id);

    if (["completed", "cancelled"].includes(trip.status)) {
      return res.status(400).json({ success: false, message: "Trip already completed or cancelled" });
    }

    trip.status = "cancelled";
    trip.cancelReason = cancelReason || "";
    trip.endTime = new Date();
    await trip.save();

    res.status(200).json({ success: true, message: "Trip cancelled", data: trip });
  } catch (error) {
    logger.error(`Error cancelling trip: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};


// get all trips
export const getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find().populate("client driverShift");
    res.status(200).json({ success: true, data: trips });
  } catch (error) {
    logger.error(`Error getting all Trips: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

// get normal trips
export const getNormalTrips = async (req, res) => {
  try {
    const trips = await Trip.find( { rideType: "normal" } ).populate("client driverShift");
    res.status(200).json({ success: true, data: trips });
  } catch (error) {
    logger.error(`Error getting normal Trips: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

// get scheduled trips
export const getScheduledTrips = async (req, res) => {
  try {
    const trips = await Trip.find( { rideType: "scheduled" } ).populate("client driverShift");
    res.status(200).json({ success: true, data: trips });
  } catch (error) {
    logger.error(`Error getting scheduled Trips: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

// get scheduled trips for today
export const getScheduledTripsToday = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const trips = await Trip.find({
      rideType: "scheduled",
      scheduledTime: { $gte: startOfDay, $lt: endOfDay }
    }).populate("client driverShift");

    res.status(200).json({ success: true, data: trips });
  } catch (error) {
    logger.error(`Error getting scheduled Trips: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};


// get scheduled trips for tomorrow
export const getScheduledTripsTomorrow = async (req, res) => {
  try {
    const startOfTomorrow = new Date();
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    startOfTomorrow.setHours(0, 0, 0, 0);

    const endOfTomorrow = new Date();
    endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);
    endOfTomorrow.setHours(23, 59, 59, 999);

    const trips = await Trip.find({
      rideType: "scheduled",
      scheduledTime: { $gte: startOfTomorrow, $lt: endOfTomorrow }
    }).populate("client driverShift");

    res.status(200).json({ success: true, data: trips });
  } catch (error) {
    logger.error(`Error getting scheduled Trips: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

// get scheduled trips after tomorrow
export const getScheduledTripsAfterTomorrow = async (req, res) => {
  try {
    const endOfTomorrow = new Date();
    endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);
    endOfTomorrow.setHours(23, 59, 59, 999);

    const trips = await Trip.find({
      rideType: "scheduled",
      scheduledTime: { $gt: endOfTomorrow }
    }).populate("client driverShift");

    res.status(200).json({ success: true, data: trips });
  } catch (error) {
    logger.error(`Error getting scheduled Trips: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};


// get trip by id
export const getTripById = async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await Trip.findById(id).populate("client driverShift");
  
    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    logger.error(`Error getting Trip by ID: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};


// update
export const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    const updatedTrip = await Trip.findByIdAndUpdate(id, updateData, { new: true });
  
    res.status(200).json({ success: true, message: "Trip updated successfully", data: updatedTrip });
  } catch (error) {
    logger.error(`Error updating Trip: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};


// delete
export const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;
    await Trip.findByIdAndDelete(id);
    
    res.status(200).json({ success: true, message: "Trip deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting Trip: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};


// passenger rating
export const ratePassenger = async (req, res) => {
  try {
    const { id } = req.params; 
    const { rating } = req.body; 

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }
    const trip = await Trip.findById(id);

    trip.passengerRating = rating;
    await trip.save();

    res.status(200).json({ success: true, message: "Passenger rated successfully", data: trip });
  } catch (error) {
    logger.error(`Error rating passenger: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};


