const router = require('express').Router();
const { sequelize } = require('../models');
const MailController = require('../controllers/mail.controller');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const JWT_TOKEN = process.env.SECRET;

/**
 * Function used to register new admin
 */
const registerAdmin = async (req, res) => {
  try {
    //Check email already exists
    const [emailExists] = await sequelize.query(
      'SELECT * FROM `admin` WHERE `mail` = :mail and `is_deleted` = false', {
      replacements: req.body,
      type: sequelize.QueryTypes.SELECT
    });

    if (emailExists) {
      res.status(400).json({
        success: false,
        message: 'Email already exists.',
      });
    }
    else {
      const token = jwt.sign({ email: req.body.mail }, JWT_TOKEN); //Generate jwt token
      req.body = { ...req.body, ...{ resetToken: token } };

      //Register admin details
      const [registerAdmin] = await sequelize.query(
        'INSERT INTO `admin` (`name`, `mail`, `mobile`, `gender`, `reset_token`) VALUES (:name, :mail, :mobile, :gender, :resetToken)',
        {
          replacements: req.body,
          type: sequelize.QueryTypes.INSERT,
        }
      );
      //Send mail to admin
      await notifyRegisterToAdmin(req.body);

      res.status(200).json({
        success: true,
        result: registerAdmin,
        message: 'Admin Details registered.',
      });
    }

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to register admin.',
    });
  }

}

/**
 * Function used to notify registered admin detail to admin
 */
const notifyRegisterToAdmin = async (detail) => {
  const frontUrl = process.env.FRONT_END_URL;
  const adminMail = process.env.ADMIN_MAIL;
  const template = `<div style="text-align: center; ">
  <h1 style="text-decoration: underline">Admin Account Request</h1>
  <p>Name: ${detail.name}</p>
  <p>Email: ${detail.mail}</p>
  <p>Mobile: ${detail.mobile}</p>
  <p>Gender: ${detail.gender}</p>
  <p>Click the below link to send password</p>
  <a href="${frontUrl}/generate-password/${detail.resetToken}/?isAdmin=true">Click me</a>
  </div>`
  const sendMail = await MailController.sendMail(adminMail, 'REQUEST FOR ADMIN ACCOUNT', 'Details', template);
  if (sendMail.success) {
    return { success: true };
  }
  else {
    return { success: false };
  }
}


/**
 * Function used to get registered admin detail using token
 */
getRegisterAdminDetail = async (req, res) => {
  try {
    const reset_token = req.query?.token;
    const decoded = jwt.verify(reset_token, JWT_TOKEN);
    if (reset_token && decoded?.email) {
      const [getDetail] = await sequelize.query(
        'SELECT mail, name FROM `admin` WHERE `mail` = :mail and `reset_token` = :reset_token and `is_deleted` = false', {
        replacements: {
          mail: decoded?.email,
          reset_token: reset_token
        }
      });
      if (getDetail?.length) {
        res.status(200).json({
          success: true,
          result: getDetail,
          message: 'Registered admin detail.',
        });
      }
      else {
        res.status(400).json({
          success: false,
          message: 'Invalid detail.',
        });
      }
    }
    else {
      res.status(400).json({
        success: false,
        message: 'Invalid token.',
      });
    }
  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to get detail.',
    });
  }
}

/**
 * Function used to generate admin password
 */
generatePassword = async (req, res) => {
  try {
    const { reset_token, isAdmin, password } = req.body;
    const decoded = jwt.verify(reset_token, JWT_TOKEN);
    if (reset_token && decoded?.email && password) {
      const [getDetail] = await sequelize.query(
        'SELECT mail, name FROM `admin` WHERE `mail` = :mail and `reset_token` = :reset_token and `is_deleted` = false', {
        replacements: {
          mail: decoded?.email,
          reset_token: reset_token
        }
      });
      if (getDetail?.length) {
        const encryptedPassword = await bcrypt.hash(password, 10);
        //Generate password
        const [updateJournal] = await sequelize.query(
          'UPDATE `admin` SET `password` = :password, `reset_token` = NULL WHERE `mail` = :mail and `reset_token` = :reset_token and `is_deleted` = false',
          {
            replacements: {
              password: encryptedPassword,
              mail: decoded?.email,
              reset_token: reset_token
            }
          });
        if (updateJournal) {
          if (isAdmin) {
            await notifyPasswordToAdmin({ password: password, mail: getDetail[0]?.mail });
          }
          res.status(200).json({
            success: true,
            result: updateJournal,
            message: 'Password generated successfully.',
          });
        }
        else {
          res.status(400).json({
            success: false,
            message: 'Failed to update password.',
          });
        }

      }
      else {
        res.status(400).json({
          success: false,
          message: 'Invalid detail.',
        });
      }

    }
    else {
      res.status(400).json({
        success: false,
        message: 'Invalid detail.',
      });
    }
  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to get detail.',
    });
  }
}

/**
 * Function used to notify registered admin detail to admin
 */
const notifyPasswordToAdmin = async (detail) => {
  const frontUrl = process.env.FRONT_END_URL;
  const adminMail = process.env.ADMIN_MAIL;
  const template = `<div style="text-align: center; ">
  <h1 style="text-decoration: underline">Congratulation from EPRA Journal</h1>
  <p>You are successsfully added as the admin. Use the below password to login into EPRA Journal.</p>
  <p>Password: <b>${detail.password}</b></p>
  <a href="${frontUrl}/login"><b>Click here to login</b></a>
  </div>`
  const sendMail = await MailController.sendMail(detail.mail, 'Password Generated', 'Details', template);
  if (sendMail.success) {
    return { success: true };
  }
  else {
    return { success: false };
  }
}

router.get('/register', getRegisterAdminDetail);
router.post('/register', registerAdmin);
router.post('/password', generatePassword)
module.exports = router;