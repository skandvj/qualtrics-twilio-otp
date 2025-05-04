// server/controllers/authController.js
const twilio = require('twilio');
const uuid = require('uuid');
const twilioConfig = require('../config/twilio');

// Initialize Twilio client with better error handling
let client;
try {
  console.log('Initializing Twilio client...');
  
  if (!twilioConfig.accountSid || !twilioConfig.authToken) {
    console.error('Twilio credentials missing. Please check your .env file.');
    throw new Error('Twilio credentials missing. Please check your .env file.');
  } else {
    client = twilio(twilioConfig.accountSid, twilioConfig.authToken);
    console.log('Twilio client initialized successfully.');
  }
} catch (error) {
  console.error('Error initializing Twilio client:', error);
  console.error('Server will start, but OTP functionality will not work.');
}

// Store for session tokens (in production, use Redis or another persistent store)
const sessionStore = new Map();

/**
 * Send OTP via Twilio Verify
 */
exports.sendOTP = async (req, res) => {
  const { phoneNumber } = req.body;
  
  console.log('Request received to send OTP:');
  console.log('Phone Number:', phoneNumber);
  
  try {
    if (!client) {
      console.error('Twilio client not initialized');
      return res.status(500).json({
        status: 'error',
        message: 'Twilio client not initialized. Check your credentials.'
      });
    }
    
    console.log('About to send verification via Twilio to:', phoneNumber);
    
    // Send verification code
    const verification = await client.verify.v2
      .services(twilioConfig.verifyServiceSid)
      .verifications.create({
        to: phoneNumber,
        channel: 'sms'
      });
    
    console.log('Twilio verification response:', verification);
    
    return res.status(200).json({
      status: 'success',
      message: 'OTP sent successfully',
      data: {
        sid: verification.sid,
        status: verification.status
      }
    });
  } catch (error) {
    console.error('Detailed Twilio Error:', error);
    // Return a clean error response
    return res.status(500).json({
      status: 'error',
      message: 'Failed to send OTP: ' + error.message
    });
  }
};
/**
 * Verify OTP sent via Twilio
 */
exports.verifyOTP = async (req, res) => {
  const { phoneNumber, otp } = req.body;
  
  try {
    if (!client) {
      throw new Error('Twilio client not initialized. Check your credentials.');
    }
    
    // Verify the code
    const verificationCheck = await client.verify.v2
      .services(twilioConfig.verifyServiceSid)
      .verificationChecks.create({
        to: phoneNumber,
        code: otp
      });
    
    if (verificationCheck.status === 'approved') {
      // Generate a session token
      const sessionToken = uuid.v4();
      
      // Store the token with expiration
      const expiresAt = new Date(Date.now() + twilioConfig.otpExpiration * 60 * 1000);
      sessionStore.set(sessionToken, {
        phoneNumber,
        expiresAt
      });
      
      // Schedule cleanup of expired token
      setTimeout(() => {
        sessionStore.delete(sessionToken);
      }, twilioConfig.otpExpiration * 60 * 1000);
      
      return res.status(200).json({
        status: 'success',
        message: 'OTP verified successfully',
        data: {
          sessionToken,
          expiresAt
        }
      });
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid OTP',
        data: {
          status: verificationCheck.status
        }
      });
    }
  } catch (error) {
    console.error('Twilio Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to verify OTP',
      error: error.message
    });
  }
};

/**
 * Validate a session token
 */
exports.validateSession = async (req, res) => {
  const { sessionToken } = req.body;
  
  if (!sessionToken) {
    return res.status(400).json({
      status: 'error',
      message: 'Session token is required'
    });
  }
  
  const session = sessionStore.get(sessionToken);
  
  if (!session) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid session token'
    });
  }
  
  if (new Date() > session.expiresAt) {
    sessionStore.delete(sessionToken);
    return res.status(401).json({
      status: 'error',
      message: 'Session expired'
    });
  }
  
  return res.status(200).json({
    status: 'success',
    message: 'Session is valid',
    data: {
      phoneNumber: session.phoneNumber,
      expiresAt: session.expiresAt
    }
  });
};