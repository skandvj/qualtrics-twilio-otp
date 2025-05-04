// qualtrics/embedded-js/entry-page.js
/**
 * This JavaScript should be placed in a Qualtrics "JavaScript" question type
 * on the first page of your survey to collect and validate the phone number.
 * 
 * Configuration:
 * - Replace API_ENDPOINT with your server's URL
 * - Make sure to enable the JavaScript question type in Qualtrics
 * - Set up "Embedded Data" fields in Qualtrics: phoneNumber, sessionToken
 */

Qualtrics.SurveyEngine.addOnload(function() {
  // Configuration - UPDATE THIS WITH YOUR SERVER URL
  const API_ENDPOINT = 'http://localhost:3000/api/auth';
  
  // Create container for the phone input UI
  const container = document.createElement('div');
  container.innerHTML = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="margin-bottom: 20px;">
        <label for="phone-input" style="display: block; margin-bottom: 8px; font-weight: bold;">Enter your phone number:</label>
        <input 
          id="phone-input" 
          type="tel" 
          placeholder="+1 (555) 555-5555" 
          style="width: 100%; padding: 10px; font-size: 16px; border: 1px solid #ccc; border-radius: 4px;"
        >
        <p id="phone-error" style="color: red; margin-top: 5px; display: none;"></p>
      </div>
      
      <div id="otp-section" style="display: none; margin-bottom: 20px;">
        <label for="otp-input" style="display: block; margin-bottom: 8px; font-weight: bold;">Enter the verification code sent to your phone:</label>
        <input 
          id="otp-input" 
          type="text" 
          maxlength="6" 
          placeholder="6-digit code" 
          style="width: 100%; padding: 10px; font-size: 16px; border: 1px solid #ccc; border-radius: 4px;"
        >
        <p id="otp-error" style="color: red; margin-top: 5px; display: none;"></p>
      </div>
      
      <div>
        <button 
          id="send-otp-btn" 
          style="background-color: #0077CC; color: white; border: none; padding: 10px 20px; font-size: 16px; cursor: pointer; border-radius: 4px;"
        >
          Send Verification Code
        </button>
        
        <button 
          id="verify-otp-btn" 
          style="display: none; background-color: #28a745; color: white; border: none; padding: 10px 20px; font-size: 16px; cursor: pointer; border-radius: 4px;"
        >
          Verify Code
        </button>
      </div>
      
      <div id="status-message" style="margin-top: 20px; padding: 10px; border-radius: 4px; display: none;"></div>
    </div>
  `;
  
  // Add to the question
  this.getQuestionContainer().appendChild(container);
  
  // Hide the default "Next" button until verification is complete
  this.hideNextButton();
  
  // Get references to the DOM elements
  const phoneInput = document.getElementById('phone-input');
  const phoneError = document.getElementById('phone-error');
  const otpSection = document.getElementById('otp-section');
  const otpInput = document.getElementById('otp-input');
  const otpError = document.getElementById('otp-error');
  const sendOtpBtn = document.getElementById('send-otp-btn');
  const verifyOtpBtn = document.getElementById('verify-otp-btn');
  const statusMessage = document.getElementById('status-message');
  
  // Format phone number to E.164 format
  function formatPhoneNumber(phone) {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Check if the number already has a country code
    if (phone.startsWith('+')) {
      return '+' + digitsOnly;
    }
    
    // Default to US/Canada (+1) if no country code
    return '+1' + digitsOnly;
  }
  
  // Show a status message
  function showStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.style.display = 'block';
    statusMessage.style.backgroundColor = isError ? '#f8d7da' : '#d4edda';
    statusMessage.style.color = isError ? '#721c24' : '#155724';
    statusMessage.style.borderColor = isError ? '#f5c6cb' : '#c3e6cb';
  }
  
  // Send OTP API call
  // Replace your sendOTP function with this enhanced version:
async function sendOTP() {
  const phone = formatPhoneNumber(phoneInput.value);
  console.log('Formatted phone number:', phone);
  
  if (!phone.match(/^\+[1-9]\d{1,14}$/)) {
    phoneError.textContent = 'Please enter a valid phone number with country code (e.g., +12125551234)';
    phoneError.style.display = 'block';
    return;
  }
  
  try {
    sendOtpBtn.disabled = true;
    sendOtpBtn.textContent = 'Sending...';
    
    const apiUrl = `${API_ENDPOINT}/send-otp`;
    console.log('Making request to:', apiUrl);
    
    const requestData = { phoneNumber: phone };
    console.log('Request data:', requestData);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Server responded with ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (data.status === 'success') {
      // Store the phone number for later use
      Qualtrics.SurveyEngine.setEmbeddedData('phoneNumber', phone);
      
      // Show OTP input section
      otpSection.style.display = 'block';
      verifyOtpBtn.style.display = 'inline-block';
      sendOtpBtn.textContent = 'Resend Code';
      
      showStatus('Verification code sent to your phone. Please enter it below.', false);
    } else {
      showStatus(`Error: ${data.message}`, true);
    }
  } catch (error) {
    console.error('Detailed error:', error);
    showStatus(`Network error: ${error.message}. Please try again.`, true);
  } finally {
    sendOtpBtn.disabled = false;
    if (sendOtpBtn.textContent === 'Sending...') {
      sendOtpBtn.textContent = 'Send Verification Code';
    }
  }
}
  
  // Verify OTP API call
  async function verifyOTP() {
    const phone = formatPhoneNumber(phoneInput.value);
    const otp = otpInput.value.trim();
    
    if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
      otpError.textContent = 'Please enter a valid 6-digit code';
      otpError.style.display = 'block';
      return;
    }
    
    try {
      verifyOtpBtn.disabled = true;
      verifyOtpBtn.textContent = 'Verifying...';
      
      const response = await fetch(`${API_ENDPOINT}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          phoneNumber: phone,
          otp: otp
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        // Store the session token for subsequent pages
        Qualtrics.SurveyEngine.setEmbeddedData('sessionToken', data.data.sessionToken);
        
        showStatus('Phone verified successfully! Proceeding to survey...', false);
        
        // Wait a moment before proceeding to next page
        setTimeout(() => {
          // Show and click the next button
          that.showNextButton();
          document.querySelector('#NextButton').click();
        }, 1500);
      } else {
        showStatus(`Error: ${data.message}`, true);
      }
    } catch (error) {
      showStatus('Network error. Please try again.', true);
      console.error('Error verifying OTP:', error);
    } finally {
      verifyOtpBtn.disabled = false;
      verifyOtpBtn.textContent = 'Verify Code';
    }
  }
  
  // Set up event listeners
  sendOtpBtn.addEventListener('click', sendOTP);
  verifyOtpBtn.addEventListener('click', verifyOTP);
  
  // Reset error messages when user starts typing
  phoneInput.addEventListener('input', () => {
    phoneError.style.display = 'none';
  });
  
  otpInput.addEventListener('input', () => {
    otpError.style.display = 'none';
  });
});