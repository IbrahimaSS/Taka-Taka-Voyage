const nodemailer = require("nodemailer");

module.exports = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"TAKA TAKA" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  });
};
