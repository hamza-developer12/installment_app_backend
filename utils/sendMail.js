const nodemailer = require("nodemailer");

const sendMail = async (from, to, subject, message) => {
  const transporter = await nodemailer.createTransport({
    host: process.env.SMTP_SERVER,
    port: process.env.SMTP_PORT,
    tls: {
      rejectUnauthorized: true,
    },
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: from,
    to: to,
    subject: subject,
    html: message,
  });
  console.log(info.messageId);
};
module.exports = sendMail;
