const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const Op = db.Sequelize.Op;
require('dotenv').config();
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}

exports.signup = (req, res) => {
  // Save User to Database
  const codeVerification = makeid(30);
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    verification: 0,
    code_verification: codeVerification
  })
    .then(user => {
      if (req.body.roles) {
        Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles
            }
          }
        }).then(roles => {
          user.setRoles(roles).then(() => {
            console.log("1")
            res.send({ message: "User registered successfully!" });
          });
        });
      } else {
        // user role = 1
        user.setRoles([1]).then(() => {
          var nodemailer = require('nodemailer');

          var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'ocopselalu@gmail.com',
              pass: 'pbpbowrpzuwijhjf'
            }
          });

          var mailOptions = {
            to: 'danangroesmanto@gmail.com',
            subject: 'Verification Login',
            text: `${process.env.FRONTEND}/verification/${codeVerification}`
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
          res.send({ message: "User registered successfully, Please check your email for registration" });
        });
      }
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.signin = (req, res) => {
  User.findOne({
    where: {
      username: req.body.username
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      var authorities = [];
      user.getRoles().then(roles => {
        for (let i = 0; i < roles.length; i++) {
          authorities.push("ROLE_" + roles[i].name.toUpperCase());
        }
        res.status(200).send({
          id: user.id,
          username: user.username,
          email: user.email,
          roles: authorities,
          accessToken: token
        });
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.forgot = (req, res) => {
  var nodemailer = require('nodemailer');

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'ocopselalu@gmail.com',
      pass: 'pbpbowrpzuwijhjf'
    }
  });

  const newPassword = makeid(10);

  var mailOptions = {
    to: req.params.email,
    subject: 'Forget Password',
    text: `Your Password Has Changed To "${newPassword}"`
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });



  User.findOne({
    where: {
      email: req.params.email
    }
  })
    .then(user => {

      user.getRoles().then(roles => {
        // console.log("danang", req.params.codeverification)
        res.status(200).send({ message: "Please check your email for reset password" });

        user.update(
          { password: bcrypt.hashSync(newPassword, 8) },
          { where: { email: req.params.email } }
        )
          .success(function () { })
      });
    })
    .catch(err => {
      res.status(200).send({ email: null });
    });


};
