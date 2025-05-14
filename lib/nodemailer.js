import nodemailer from 'nodemailer';

// Create a reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use Gmail service
  auth: {
    user: process.env.GMAIL_EMAIL, // Your Gmail address from .env.local
    pass: process.env.GMAIL_APP_PASSWORD, // Your App Password from .env.local
  },
  // Optional: Add connection timeout settings if needed
  // connectionTimeout: 5 * 60 * 1000, // 5 min
});

// Function to send an email
export const sendEmail = async (to, subject, html) => {
  if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('⚠️ Email credentials (GMAIL_EMAIL, GMAIL_APP_PASSWORD) not set in .env.local. Skipping email.');
    return; // Don't attempt to send if not configured
  }

  const mailOptions = {
    from: `SkillShikhi <${process.env.GMAIL_EMAIL}>`, // Sender address (shows your Gmail)
    to: to, // List of receivers (email address string)
    subject: subject, // Subject line
    html: html, // HTML body content (can also use 'text' for plain text)
  };

  try {
    console.log(`\n📧 Attempting to send email via Nodemailer`);
    console.log(`   From: ${mailOptions.from}`);
    console.log(`   To: ${mailOptions.to}`);
    console.log(`   Subject: ${mailOptions.subject}`);

    let info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`);
    // You can optionally log the response URL from Ethereal/preview if needed
    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return info;
  } catch (error) {
    console.error('❌ Error sending email via Nodemailer:', error);
    // Depending on the error, you might want to log more details
    // or handle specific error codes (e.g., authentication failure)
    // throw error; // Optionally re-throw if you want the calling function to handle it
  }
}; 