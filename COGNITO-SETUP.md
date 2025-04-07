# Cognito Authentication Setup Guide

This guide will help you set up and troubleshoot your Amazon Cognito authentication for the Seatbelt Admin dashboard.

## 1. Configuration

Ensure your `.env.local` file contains the correct Cognito configuration:

```
NEXT_PUBLIC_AWS_REGION=us-east-2
NEXT_PUBLIC_AWS_USER_POOL_ID=us-east-2_fdu9Pi2S
NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID=710v38ojh58uogtv6sjq857a2
NEXT_PUBLIC_API_URL=https://1z5u2pe1h.execute-api.us-east-2.amazonaws.com
NEXT_PUBLIC_ENV=development
```

Replace the values with your actual AWS Cognito settings.

## 2. Testing Your Cognito Connection

Before using the web app, you can test your Cognito setup using the provided test script:

1. Update the test credentials in `src/utils/cognito-test.js`
2. Install required dependencies:
   ```
   npm install dotenv amazon-cognito-identity-js
   ```
3. Run the test script:
   ```
   node src/utils/cognito-test.js
   ```

This script will test your Cognito configuration directly without any of the web app UI.

## 3. Common Issues and Solutions

### Incorrect User Pool ID

Make sure the User Pool ID is in the correct format: `region_poolId` (e.g., `us-east-2_fdu9Pi2S`).

### Incorrect App Client ID

Double-check your App Client ID. It should be a long alphanumeric string without any dashes.

### CORS Issues

If you're getting CORS errors:

1. Go to your Cognito User Pool in AWS Console
2. Navigate to "App integration" > "App client settings"
3. Add your local domain (http://localhost:3000) to the "Callback URL" and "Sign out URL" sections
4. Enable "Authorization code grant" and "Implicit grant" flows
5. Check "email" and "openid" in the "Allowed OAuth Scopes" section

### User Not Confirmed

If your user account is not confirmed, you'll need to:

1. Log in to AWS Console
2. Go to Cognito User Pools
3. Select your user pool
4. Go to "Users and groups"
5. Find your user and confirm them manually, or
6. Implement a confirmation flow in your app

### API Gateway Connectivity

To ensure your API Gateway connectivity is working:

1. Verify the `NEXT_PUBLIC_API_URL` value is correct
2. Check that the API Gateway CORS settings allow your domain
3. Make sure the JWT token is being correctly passed in the Authorization header

## 4. Debugging the Login Flow

The login page now includes debugging information that will help diagnose issues:

1. Check the "Debug Info" section on the login page
2. Open your browser's developer console (F12) to see detailed logging
3. If you see a login error, the specific error message will help identify the issue

## 5. Using the Test Account

For testing purposes, you can use this account (replace with an actual test account):

- Email: `test@example.com`
- Password: Contact your administrator for the password

Note: Never commit real credentials to your code repository.

## 6. Next Steps

Once your authentication is working:

1. Update the API services to use the correct endpoints
2. Implement proper error handling
3. Consider adding refresh token handling
4. Add logout functionality
5. Implement password recovery if needed

For assistance, contact the AWS administrator who set up the Cognito User Pool. 