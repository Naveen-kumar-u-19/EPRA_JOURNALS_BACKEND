const router = require('express').Router();
const { sequelize } = require('../models');
const MailController = require('../controllers/mail.controller');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const passport = require('passport');

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
 * Function used to sned forgot password mail 
 */
const sendForgotPasswordMail = async (req, res) => {
  try {
    const email = req.body?.email;
    const [getAdminDetail] = await sequelize.query(
      'SELECT * FROM `admin` WHERE `mail` = :mail and `is_deleted` = false and `is_approved` = true', {
      replacements: {
        mail: email
      }
    });
    if (getAdminDetail?.length) {
      const detail = getAdminDetail[0];
      const token = jwt.sign({ email: detail.mail }, JWT_TOKEN);
      const [updateJournal] = await sequelize.query(
        'UPDATE `admin` SET `reset_token` = :token WHERE `id` = :id',
        {
          replacements: {
            token: token,
            id: detail.id
          }
        }
      );
      if (updateJournal) {
        detail['resetToken'] = token;
        await notifyResetPassword(detail);

        res.status(200).json({
          success: true,
          result: updateJournal,
          message: 'Mail sent successfully.',
        });
      }
    }
    else {
      res.status(400).json({
        success: false,
        message: 'Email does not exist.',
      });
    }
  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to send mail.',
    });
  }
}

/**
 * Function used to notify reset password
 */
const notifyResetPassword = async (detail) => {
  const frontUrl = process.env.FRONT_END_URL;
  const template = `<div style="text-align: center;">
  <h1 style="text-decoration: underline">Reset Password</h1>
  <p>Name: ${detail.name}</p>
  <p>Click the below link to reset password.</p>
  <a href="${frontUrl}/generate-password/${detail.resetToken}">Click me</a>
  </div>`
  const sendMail = await MailController.sendMail(detail.mail, 'Request for Password Reset', 'Details', template);
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
const getRegisterAdminDetail = async (req, res) => {
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
const generatePassword = async (req, res) => {
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
          'UPDATE `admin` SET `password` = :password, `reset_token` = NULL, `is_approved` = true WHERE `mail` = :mail and `reset_token` = :reset_token and `is_deleted` = false',
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

/**
 * Function used to signin admin
 */
const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      const [getAdminDetail] = await sequelize.query(
        'SELECT * FROM `admin` WHERE `mail` = :mail and `is_deleted` = false and `is_approved` = true', {
        replacements: {
          mail: email
        }
      });
      if (getAdminDetail?.length && getAdminDetail[0]?.password) {
        const detail = getAdminDetail[0];
        if (detail.password) {
          const checkPassword = await bcrypt.compare(password, detail.password);
          if (checkPassword) {
            const token = jwt.sign(detail, JWT_TOKEN, { 'expiresIn': '5h' });
            delete detail.password;
            res.status(200).json({
              success: true,
              result: {
                detail: detail,
                token: token
              },
              message: 'User verified successfully.',
            });
          }
          else {
            res.status(400).json({
              success: false,
              message: 'Invalid credential.',
            });
          }
        }
      }
      else {
        res.status(400).json({
          success: false,
          message: 'Invalid credential.',
        });
      }

    }
    else {
      res.status(400).json({
        success: false,
        message: 'Failed to login.',
      });
    }
  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to login.',
    });
  }
}
/**
 * Function used to get admin detail based on token
 */
const getAdminBasedOnToken = async (req, res) => {
  try {
    const detail = req.user;
    if (detail.id) {
      const [getAdminDetail] = await sequelize.query(
        'SELECT * FROM `admin` WHERE `id` = :id and `is_deleted` = false and `is_approved` = true', {
        replacements: {
          id: detail.id
        }
      });
      if (getAdminDetail?.length) {
        const adminDetail = getAdminDetail[0];
        if (adminDetail.reset_token) {
          delete adminDetail.reset_token;
        }
        res.status(200).json({
          success: true,
          result: {
            detail: adminDetail,
          },
          message: 'User verified successfully.',
        });
      }
      else {
        res.status(400).json({
          success: false,
          message: 'Invalid user',
        });
      }
    }
    else {
      res.status(400).json({
        success: false,
        message: 'Invalid user',
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
 * Function used to update admin detail
 */
const updateAdminDetail = async (req, res) => {
  try {
    const detail = req.body;
    const id = req.params?.id;
    if (detail && id) {
      detail['updatedAt'] = new Date();
      detail['id'] = id;
      const [updateAdmin] = await sequelize.query(
        'UPDATE `admin` SET `name` = :name, `mobile` = :mobile, `gender` = :gender,`updated_at`= :updatedAt WHERE `id` = :id  and is_deleted = false and is_approved=true',
        {
          replacements: detail,
        }
      );

      res.status(200).json({
        success: true,
        result: updateAdmin,
        message: 'Journal updated successfully.',
      });
    }
    else {
      res.status(400).json({
        success: false,
        message: 'Failed to udpate.',
      });
    }
  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to udpate.',
    });
  }
}

router.get('/register', getRegisterAdminDetail);
router.post('/register', registerAdmin);
router.post('/password', generatePassword);
router.post('/signin', signIn);
router.post('/forgotPassword', sendForgotPasswordMail);
router.get('/token', passport.authenticate('jwt', { session: false }), getAdminBasedOnToken);
router.put('/update/:id', passport.authenticate('jwt', { session: false }), updateAdminDetail);
module.exports = router;