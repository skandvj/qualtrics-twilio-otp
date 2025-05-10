// qualtrics/embedded-js/verification.js
/**
 * This JavaScript should be added to each page of your Qualtrics survey
 * after the first page to validate the session token before allowing
 * the user to continue.
 * 
 * Add this code to the "JavaScript" section of each page's settings.
 */
Qualtrics.SurveyEngine.addOnload(function() {
  // Configuration
  const API_ENDPOINT = 'https://1055-2401-4900-1c7a-e2d1-64d4-d236-4c89-1ae0.ngrok-free.app/api/auth';
  
  // Get the session token from embedded data
  const sessionToken = Qualtrics.SurveyEngine.getEmbeddedData('sessionToken');
  
  console.log('Validating session token:', sessionToken ? 'Token exists' : 'No token');
  
  // Check if we have a session token
  if (!sessionToken) {
    console.error('No session token found');
    alert('Session validation failed. Please restart the survey.');
    
    // Redirect to the first page
    window.location.href = "${e://Field/SurveyURL}";
    return;
  }
  
  // Validate the session token
  var xhr = new XMLHttpRequest();
  // Use the full URL to avoid relative URL issues
  xhr.open('POST', 'https://1055-2401-4900-1c7a-e2d1-64d4-d236-4c89-1ae0.ngrok-free.app/api/auth/validate-session', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function() {
    console.log('Validation response status:', xhr.status);
    console.log('Validation response text:', xhr.responseText);
    
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        var data = JSON.parse(xhr.responseText);
        console.log('Validation response data:', data);
        
        if (data.status !== 'success') {
          console.error('Session validation failed:', data.message);
          alert('Your session has expired. Please restart the survey.');
          
          // Redirect to the first page
          window.location.href = "${e://Field/SurveyURL}";
        } else {
          console.log('Session is valid, continuing with survey');
        }
      } catch (e) {
        console.error('JSON parse error:', e);
        alert('Error validating session. Please restart the survey.');
        window.location.href = "${e://Field/SurveyURL}";
      }
    } else {
      console.error('Server error during validation:', xhr.status);
      alert('Unable to validate your session. Please restart the survey.');
      window.location.href = "${e://Field/SurveyURL}";
    }
  };
  
  xhr.onerror = function() {
    console.error('Network error during session validation');
    alert('Unable to validate your session. Please restart the survey.');
    window.location.href = "${e://Field/SurveyURL}";
  };
  
  xhr.send(JSON.stringify({ sessionToken: sessionToken }));
});
