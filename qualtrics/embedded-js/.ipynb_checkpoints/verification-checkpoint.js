// qualtrics/embedded-js/verification.js
/**
 * This JavaScript should be added to each page of your Qualtrics survey
 * after the first page to validate the session token before allowing
 * the user to continue.
 * 
 * Add this code to the "JavaScript" section of each page's settings.
 */

Qualtrics.SurveyEngine.addOnload(function() {
  // Configuration - UPDATE THIS WITH YOUR SERVER URL
  const API_ENDPOINT = 'http://localhost:3000/api/auth';
  
  // Get the session token from embedded data
  const sessionToken = Qualtrics.SurveyEngine.getEmbeddedData('sessionToken');
  
  // Check if we have a session token
  if (!sessionToken) {
    alert('Session validation failed. Please restart the survey.');
    // Redirect to the first page
    window.location.href = "${e://Field/SurveyURL}";
    return;
  }
  
  // Validate the session token
  async function validateSession() {
    try {
      const response = await fetch(`${API_ENDPOINT}/validate-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionToken })
      });
      
      const data = await response.json();
      
      if (data.status !== 'success') {
        alert('Your session has expired. Please restart the survey.');
        // Redirect to the first page
        window.location.href = "${e://Field/SurveyURL}";
      }
    } catch (error) {
      console.error('Error validating session:', error);
      // If we can't validate, we should redirect to be safe
      alert('Unable to validate your session. Please restart the survey.');
      window.location.href = "${e://Field/SurveyURL}";
    }
  }
  
  // Validate the session when the page loads
  validateSession();
});