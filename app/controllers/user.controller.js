const db = require("../models");
const User = db.user;
exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};

exports.verification = (req, res) => {
  User.findOne({
    where: {
      code_verification: req.params.codeverification
    }
  })
    .then(user => {

      user.getRoles().then(roles => {
        // console.log("danang", req.params.codeverification)
        res.status(200).send({
          username: user.username
        });

        user.update(
          { verification: '1' },
          { where: { code_verification: req.params.codeverification } }
        )
          .success(function () { })
      });
    })
    .catch(err => {
      res.status(200).send({ username: null });
    });
  // res.send({ message: makeid(20) });
};

