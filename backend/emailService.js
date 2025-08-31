const nodemailer = require('nodemailer');

/**
 * Sends an email using a standard SMTP transporter.
 * It reads the SMTP configuration directly from environment variables.
 * @param {object} options Email options (to, subject, message).
 */
const sendEmail = async (options) => {
  try {
    // 1. Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,       // Your SMTP server hostname (e.g., 'smtp.mailtrap.io' or 'smtp.sendgrid.com')
      port: process.env.EMAIL_PORT,       // Port for SMTP (e.g., 2525, 587, 465)
      secure: process.env.EMAIL_PORT == 465, // `true` for port 465, `false` for others
      auth: {
        user: process.env.EMAIL_USER, // Your SMTP username
        pass: process.env.EMAIL_PASS, // Your SMTP password
      },
    });

    // 2. Define the email options
    const mailOptions = {
      from: process.env.EMAIL_FROM, // Sender address (e.g., "Fluent English <no-reply@yourapp.com>")
      to: options.email,
      subject: options.subject,
      text: options.message,
      // You can also add an html property for richer emails
      // html: '<b>Hello world?</b>'
    };

    // 3. Send the email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${options.email}`);

  } catch (error) {
    console.error(`Email could not be sent to ${options.email}:`, error);
    // Depending on your app's needs, you might want to re-throw the error
    // or handle it more gracefully.
  }
};

module.exports = sendEmail;
