# Qualtrics-Twilio OTP Integration

This project implements a secure phone verification system using Twilio's Verify API to protect Qualtrics surveys with OTP (One-Time Password) verification.

## Project Structure
qualtrics-twilio-otp/
├── server/
│   ├── app.js                 # Express application entry point
│   ├── config/
│   │   ├── twilio.js          # Twilio configuration
│   │   └── index.js           # Main configuration
│   ├── controllers/
│   │   └── authController.js  # OTP generation and verification
│   ├── middleware/
│   │   └── validator.js       # Input validation
│   ├── routes/
│   │   └── auth.js            # API routes
│   └── package.json           # Dependencies
├── qualtrics/
│   └── embedded-js/           # JavaScript for Qualtrics integration
│       ├── entry-page.js      # First page with phone number input
│       └── verification.js    # OTP verification logic
└── README.md                  # Documentation

    See full documentation for setup and deployment instructions.
