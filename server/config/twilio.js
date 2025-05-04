// server/config/twilio.js
require('dotenv').config();

// Debug logging
console.log('Loading Twilio config...');
console.log('Twilio credentials status:', {
  accountSid: process.env.TWILIO_ACCOUNT_SID ? 'Set (hidden)' : 'Not set',
  authToken: process.env.TWILIO_AUTH_TOKEN ? 'Set (hidden)' : 'Not set',
  verifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID ? 'Set (hidden)' : 'Not set'
});

module.exports = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  verifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID,
  otpExpiration: parseInt(process.env.OTP_EXPIRATION || '10', 10) // 10 minutes
};