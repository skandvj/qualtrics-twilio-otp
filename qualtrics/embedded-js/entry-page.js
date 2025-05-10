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
  // Save reference to 'that' for use inside event handlers
  const that = this;
  
  // Configuration
  const API_ENDPOINT = 'https://1055-2401-4900-1c7a-e2d1-64d4-d236-4c89-1ae0.ngrok-free.app/api/auth';
  
  // Create container for the phone input UI
  const container = document.createElement('div');
  container.innerHTML = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="margin-bottom: 20px;">
        <label for="phone-input" style="display: block; margin-bottom: 8px; font-weight: bold;">Enter your phone number:</label>
        <input 
          id="phone-input" 
          type="tel" 
          placeholder="+1234567864" 
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
  
  // Show a status message
  function showStatus(message, isError = false) {
    const statusMessage = document.getElementById('status-message');
    if (statusMessage) {
      statusMessage.textContent = message;
      statusMessage.style.display = 'block';
      statusMessage.style.backgroundColor = isError ? '#f8d7da' : '#d4edda';
      statusMessage.style.color = isError ? '#721c24' : '#155724';
      statusMessage.style.border = `1px solid ${isError ? '#f5c6cb' : '#c3e6cb'}`;
      statusMessage.style.padding = '10px';
    }
  }
  
  // Send OTP API call
  function sendOTP() {
    const phoneInputElement = document.getElementById('phone-input');
    const phoneError = document.getElementById('phone-error');
    const sendOtpBtn = document.getElementById('send-otp-btn');
    const otpSection = document.getElementById('otp-section');
    const verifyOtpBtn = document.getElementById('verify-otp-btn');
    
    if (!phoneInputElement) {
      console.error('Phone input element not found');
      showStatus('Error: Could not find phone input field', true);
      return;
    }
    
    // Get the phone number at the time the button is clicked
    const phone = phoneInputElement.value.trim();
    console.log('Button clicked, sending OTP to:', phone);
    
    if (!phone.match(/^\+[1-9]\d{1,14}$/)) {
      if (phoneError) {
        phoneError.textContent = 'Please enter a valid phone number with country code (e.g., +12125551234)';
        phoneError.style.display = 'block';
      }
      return;
    }
    
    if (sendOtpBtn) sendOtpBtn.disabled = true;
    if (sendOtpBtn) sendOtpBtn.textContent = 'Sending...';
    
    console.log('Making request to:', `${API_ENDPOINT}/send-otp`);
    
    var xhr = new XMLHttpRequest();
    // Use the full URL to avoid relative URL issues
    xhr.open('POST', 'https://1055-2401-4900-1c7a-e2d1-64d4-d236-4c89-1ae0.ngrok-free.app/api/auth/send-otp', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
      console.log('Response status:', xhr.status);
      console.log('Response text:', xhr.responseText);
      
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          var data = JSON.parse(xhr.responseText);
          console.log('Response data:', data);
          
          if (data.status === 'success') {
            // Store the phone number for later use
            Qualtrics.SurveyEngine.setEmbeddedData('phoneNumber', phone);
            
            // Show OTP input section
            if (otpSection) otpSection.style.display = 'block';
            if (verifyOtpBtn) verifyOtpBtn.style.display = 'inline-block';
            if (sendOtpBtn) sendOtpBtn.textContent = 'Resend Code';
            
            showStatus('Verification code sent to your phone. Please enter it below.', false);
          } else {
            showStatus(`Error: ${data.message}`, true);
          }
        } catch (e) {
          console.error('JSON parse error:', e);
          showStatus('Error parsing response. Please try again.', true);
        }
      } else {
        showStatus(`Server error (${xhr.status}). Please try again.`, true);
      }
      
      if (sendOtpBtn) {
        sendOtpBtn.disabled = false;
        if (sendOtpBtn.textContent === 'Sending...') {
          sendOtpBtn.textContent = 'Send Verification Code';
        }
      }
    };
    
    xhr.onerror = function() {
      console.error('Network error');
      showStatus('Network error. Please check your connection and try again.', true);
      if (sendOtpBtn) {
        sendOtpBtn.disabled = false;
        sendOtpBtn.textContent = 'Send Verification Code';
      }
    };
    
    xhr.send(JSON.stringify({ phoneNumber: phone }));
  }
  
  // Verify OTP API call
  function verifyOTP() {
    const phoneInputElement = document.getElementById('phone-input');
    const otpInputElement = document.getElementById('otp-input');
    const otpError = document.getElementById('otp-error');
    const verifyOtpBtn = document.getElementById('verify-otp-btn');
    
    if (!phoneInputElement || !otpInputElement) {
      console.error('Input elements not found');
      showStatus('Error: Could not find input fields', true);
      return;
    }
    
    const phone = phoneInputElement.value.trim();
    const otp = otpInputElement.value.trim();
    
    if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
      if (otpError) {
        otpError.textContent = 'Please enter a valid 6-digit code';
        otpError.style.display = 'block';
      }
      return;
    }
    
    if (verifyOtpBtn) verifyOtpBtn.disabled = true;
    if (verifyOtpBtn) verifyOtpBtn.textContent = 'Verifying...';
    
    console.log('Making verify request to:', `${API_ENDPOINT}/verify-otp`);
    console.log('Phone:', phone, 'OTP:', otp);
    
    var xhr = new XMLHttpRequest();
    // Use the full URL to avoid relative URL issues
    xhr.open('POST', 'https://1055-2401-4900-1c7a-e2d1-64d4-d236-4c89-1ae0.ngrok-free.app/api/auth/verify-otp', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
      console.log('Verify response status:', xhr.status);
      console.log('Verify response text:', xhr.responseText);
      
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          var data = JSON.parse(xhr.responseText);
          console.log('Verify response data:', data);
          
          if (data.status === 'success') {
            // Store the session token for subsequent pages
            Qualtrics.SurveyEngine.setEmbeddedData('sessionToken', data.data.sessionToken);
            
            showStatus('Phone verified successfully! Proceeding to survey...', false);
            
            // Wait a moment before proceeding to next page
            setTimeout(function() {
              // Show and click the next button
              that.showNextButton();
              var nextButton = document.querySelector('#NextButton');
              if (nextButton) nextButton.click();
            }, 1500);
          } else {
            showStatus(`Error: ${data.message}`, true);
          }
        } catch (e) {
          console.error('JSON parse error:', e);
          showStatus('Error parsing response. Please try again.', true);
        }
      } else {
        showStatus(`Server error (${xhr.status}). Please try again.`, true);
      }
      
      if (verifyOtpBtn) {
        verifyOtpBtn.disabled = false;
        verifyOtpBtn.textContent = 'Verify Code';
      }
    };
    
    xhr.onerror = function() {
      console.error('Network error during verification');
      showStatus('Network error. Please check your connection and try again.', true);
      if (verifyOtpBtn) {
        verifyOtpBtn.disabled = false;
        verifyOtpBtn.textContent = 'Verify Code';
      }
    };
    
    xhr.send(JSON.stringify({ 
      phoneNumber: phone,
      otp: otp
    }));
  }
  
  // Wait for DOM to fully load before attaching event listeners
  setTimeout(function() {
    console.log('Setting up event listeners');
    
    // Get button elements
    var sendOtpBtn = document.getElementById('send-otp-btn');
    var verifyOtpBtn = document.getElementById('verify-otp-btn');
    var phoneInput = document.getElementById('phone-input');
    var otpInput = document.getElementById('otp-input');
    var phoneError = document.getElementById('phone-error');
    var otpError = document.getElementById('otp-error');
    
    // Add direct onclick handlers
    if (sendOtpBtn) {
      console.log('Adding send button handler');
      sendOtpBtn.onclick = sendOTP;
    } else {
      console.error('Send button not found');
    }
    
    if (verifyOtpBtn) {
      console.log('Adding verify button handler');
      verifyOtpBtn.onclick = verifyOTP;
    } else {
      console.error('Verify button not found');
    }
    
    // Reset error messages when user starts typing
    if (phoneInput && phoneError) {
      phoneInput.oninput = function() {
        phoneError.style.display = 'none';
      };
    }
    
    if (otpInput && otpError) {
      otpInput.oninput = function() {
        otpError.style.display = 'none';
      };
    }
  }, 500);
});
