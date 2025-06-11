import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const apiKey = process.env.TWILIO_API_KEY;
const apiSecret = process.env.TWILIO_API_SECRET;
const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID);
console.log('TWILIO_API_KEY:', process.env.TWILIO_API_KEY);
console.log('TWILIO_API_SECRET:', process.env.TWILIO_API_SECRET);
console.log('TWILIO_VERIFY_SERVICE_SID:', process.env.TWILIO_VERIFY_SERVICE_SID);


const client = twilio(apiKey, apiSecret, { accountSid });

export const sendOTP = async (phone) => {
  try {
    const verification = await client.verify.v2.services(verifySid)
      .verifications
      .create({ to: phone, channel: 'sms' });

    return verification.status;
  } catch (error) {
    console.error('OTP sending failed:', error.message);
    throw error;
  }
};


// Verify OTP using Twilio Verify
export const verifyOTP = async (phone, code) => {
  try {
    const verification_check = await client.verify.v2
      .services(verifySid)
      .verificationChecks.create({
        to: phone,
        code,
      });

    console.log('Verification result:', verification_check.status);
    return verification_check.status === 'approved';
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw new Error('Failed to verify OTP');
  }
};
