const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const User = require('../schema/user.schema');

router.post('/register', (req, res, next) => {
  User.find({
    email: req.body.email,
  })
    .exec()
    .then((user) => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: 'Mail already exists',
        });
      } else {
      }
    });
});

router.post('/login', (req, res, next) => {
  User.find({
    email: req.body.email,
  })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({
          message: 'Auth failed',
        });
      }
      if (err) {
        return res.status(401).json({
          message: 'Auth failed',
        });
      }
      if (result) {
        const token = jwt.sign(
          {
            email: user[0].email,
            userId: user[0]._id,
          },
          process.env.KEY,
          {
            expiresIn: '1h',
          }
        );
        return res.status(200).json({
          message: 'Auth successful',
          token: token,
        });
      }
      res.status(401).json({
        message: 'Auth failed',
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.delete('/:userId', (req, res, next) => {
  User.remove({
    _id: req.params.userId,
  })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: 'User Deleted',
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
