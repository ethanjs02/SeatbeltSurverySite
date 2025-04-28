/**
 * Cognito API Test
 * 
 * This script tests Cognito authentication using direct API calls
 * to the Cognito Identity Provider endpoint.
 * 
 * Usage:
 * node src/utils/test-cognito-api.js youremail@example.com yourpassword
 */

const https = require('https');
require('dotenv').config({ path: '.env.local' });

// Get credentials from command line arguments
const TEST_EMAIL = "lucienmcariffe@gmail.com";
const TEST_PASSWORD = "10752Lanett!";

// Configuration
const REGION = process.env.NEXT_PUBLIC_AWS_REGION;
const USER_POOL_ID = process.env.NEXT_PUBLIC_AWS_USER_POOL_ID;
const CLIENT_ID = process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID;

const COGNITO_DOMAIN = `cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`;

console.log('Cognito API Test');
console.log('===============');
console.log('Configuration:');
console.log('- Region:', REGION || 'Not set');
console.log('- User Pool ID:', USER_POOL_ID ? `${USER_POOL_ID.split('_')[0]}_****` : 'Not set');
console.log('- Client ID:', CLIENT_ID ? `${CLIENT_ID.substring(0, 4)}****` : 'Not set');
console.log('- Email:', TEST_EMAIL ? TEST_EMAIL.substring(0, 3) + '***' : 'Not provided');
console.log('\n');

if (!REGION || !USER_POOL_ID || !CLIENT_ID) {
  console.error('ERROR: Missing configuration. Please check your .env.local file.');
  process.exit(1);
}

if (!TEST_EMAIL || !TEST_PASSWORD) {
  console.error('ERROR: Missing credentials. Please provide email and password as command line arguments.');
  console.error('Usage: node src/utils/test-cognito-api.js youremail@example.com yourpassword');
  process.exit(1);
}

// Function to make the API call
function initiateAuth(email, password) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password
      },
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: CLIENT_ID
    });

    const options = {
      hostname: `cognito-idp.${REGION}.amazonaws.com`,
      path: `/${USER_POOL_ID}`,
      method: 'POST',
      headers: {
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
        'Content-Type': 'application/x-amz-json-1.1',
        'Content-Length': data.length
      }
    };

    console.log('Making request to:', `https://${options.hostname}${options.path}`);
    console.log('With Client ID:', CLIENT_ID.substring(0, 4) + '****');

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          
          if (res.statusCode === 200) {
            console.log('\nAuthentication SUCCESSFUL!');
            console.log('- ID Token:', response.AuthenticationResult.IdToken.substring(0, 20) + '...');
            console.log('- Access Token:', response.AuthenticationResult.AccessToken.substring(0, 20) + '...');
            console.log('- Expires In:', response.AuthenticationResult.ExpiresIn, 'seconds');
            resolve(response);
          } else {
            console.error('\nAuthentication FAILED!');
            console.error('Status Code:', res.statusCode);
            console.error('Error:', response);
            reject(new Error(response.message || 'Authentication failed'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('\nRequest ERROR:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Run the test
console.log('Testing Cognito authentication...\n');

initiateAuth(TEST_EMAIL, TEST_PASSWORD)
  .then(() => {
    console.log('\nTest completed successfully.');
  })
  .catch((err) => {
    console.error('\nTest failed:', err.message || err);
  }); 