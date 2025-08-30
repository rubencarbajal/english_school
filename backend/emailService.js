const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const OAuth2 = google.auth.OAuth2;

/**
 * Creates a reusable transporter object using OAuth2 for Gmail.
 * It dynamically generates an access token from your refresh token.
 * @returns {Promise<nodemailer.Transporter>} A configured nodemailer transporter.
 */
const createTransporter = async () => {
  try {
    const oauth2Client = new OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          console.error('Failed to create access token:', err);
          reject('Failed to create access token for email service.');
        }
        resolve(token);
      });
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER, // The Gmail account you are sending from
        accessToken,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      },
    });

    return transporter;
  } catch (error) {
    console.error('Error creating email transporter:', error);
    throw error;
  }
};

/**
 * Sends an email using the configured transporter.
 * @param {object} options Email options (to, subject, message).
 */
const sendEmail = async (options) => {
  try {
    const emailTransporter = await createTransporter();
    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM, // e.g., "Fluent English <youremail@gmail.com>"
      to: options.email,
      subject: options.subject,
      text: options.message,
    });
  } catch (error) {
    console.error(`Email could not be sent to ${options.email}:`, error);
    // Depending on your app's needs, you might want to handle this more gracefully.
  }
};

module.exports = sendEmail;

