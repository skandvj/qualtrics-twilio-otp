# Qualtrics-Twilio OTP Verification System

A secure phone verification system for Qualtrics surveys using Twilio's Verify API.

## Overview

This project implements a system that requires users to verify their phone numbers via a one-time password (OTP) before proceeding with a Qualtrics survey. It enhances security, ensures data quality, and prevents fraudulent survey submissions.

The system consists of:
- Custom JavaScript integration with Qualtrics surveys
- Twilio Verify API for secure OTP delivery and validation
- File-based session management system

## Features

- Phone number verification via SMS
- Session management for continuous authentication
- Rate limiting to prevent abuse
- Cross-origin resource sharing (CORS) protection
- Automatic session expiration and cleanup
- Qualtrics integration via JavaScript and Embedded Data

## Architecture

The system follows a client-server architecture:

1. **User Interface**: Qualtrics survey with custom JavaScript
2. **Backend**: Node.js/Express application on CMU Sparkle 
3. **External API**: Twilio Verify service
4. **Session Storage**: File-based persistence on Sparkle server

## Prerequisites

- Node.js (v14+) and npm
- Twilio account with Verify API access
- Qualtrics survey account
- CMU Sparkle server access

## Installation

### Backend Server Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/skandvj/qualtrics-twilio-otp.git
   cd qualtrics-twilio-otp/server
