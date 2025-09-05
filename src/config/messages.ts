export default {
  otp: {
    sent: (target: string) => `OTP sent to ${target}`,
    invalid: 'Invalid or expired OTP code.',
    verified: 'OTP verified successfully.',
  },
  auth: {
    invalidCredentials: 'The credentials you provided are invalid.',
    userExists: (provider: string) =>
      `A user with this ${provider} already exists.`,
    userNotFound: (provider: string) =>
      `A user with this ${provider} does not exist.`,
    noUserFromGoogle: 'Could not retrieve user information from Google.',
  },
  security: {
    tooManyAttempts:
      'Too many failed attempts. Your account is temporarily blocked. Please try again later.',
    accountBlocked:
      'This account is temporarily blocked due to too many failed attempts.',
  },
  registration: {
    initiated: (provider: string) =>
      `Registration initiated. Please check your ${provider} for a verification code to complete the process.`,
  },
};
