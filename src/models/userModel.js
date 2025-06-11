import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: { 
    type: String, 
    required: true 
  },
  phoneNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  companyNumber: { 
    type: String 
  },
  invitationCode: { 
    type: String, 
    required: true 
  },
  licenseImage: { 
    type: String 
  },
  role: {
    type: String,
    enum: ["client", "driver"],
    required: true
  },
  otp: { 
    type: String 
  },
  isActive: { 
    type: Boolean, 
    default: false 
  },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
