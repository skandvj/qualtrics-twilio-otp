// server/middleware/validator.js
const Joi = require('joi');

// Phone number validation schema
const phoneSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^\+[1-9]\d{1,14}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be in E.164 format (e.g., +12125551234)',
      'string.empty': 'Phone number is required',
      'any.required': 'Phone number is required'
    })
});

// OTP verification schema
const verifySchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^\+[1-9]\d{1,14}$/)
    .required(),
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      'string.length': 'OTP must be 6 digits',
      'string.pattern.base': 'OTP must contain only numbers',
      'string.empty': 'OTP is required',
      'any.required': 'OTP is required'
    })
});

exports.validatePhone = (req, res, next) => {
  const { error } = phoneSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message
    });
  }
  next();
};

exports.validateVerify = (req, res, next) => {
  const { error } = verifySchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message
    });
  }
  next();
};