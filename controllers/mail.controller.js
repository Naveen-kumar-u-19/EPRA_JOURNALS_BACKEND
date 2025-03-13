const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_MAIL,
    pass: process.env.ADMIN_MAIL_PASSWORD
  }
});

/**
 * Function used to send mail
 * @param {*} toMail denotes to mail details
 * @param {*} subject denontes subject of the mail
 * @param {*} text denotes text of the mail
 * @param {*} html denotes  html content
 * @returns response
 */
const sendMail = async (toMail, subject, text, html) => {
  try {
    const mailOption = {
      from: process.env.ADMIN_MAIL,
      to: toMail,
      subject: subject,
      text: text,
      html: html
    }

    const sendMail = await transporter.sendMail(mailOption);
    if (sendMail) {
      return { success: true, details: sendMail }
    }
  }
  catch (err) {
    console.log('Mail creation err', err);
    return { success: false, error: err }
  }
}
module.exports = { sendMail };


