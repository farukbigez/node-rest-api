var express = require('express');
var jwt = require('jsonwebtoken'),
  JWT_KEY = "(-QFX~v/..{8'kNaXsQh7fr53Xy0";

var dbUser = require('../../schema/user.schema');

var ProtectedRoute = express.Router();

ProtectedRoute.use((req, res, next) => {
  // check header or url parameters or post parameters for token
  // var token = req.body.headers.token;
  var token = req.get('token');

  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, JWT_KEY, (err, decoded) => {
      if (err) {
        return res.json({
          status: false,
          errMessage: 'Failed to authenticate token.',
        });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
  } else {
    // if there is no token
    // return an error
    return res
      .status(403)
      .send({ status: false, errMessage: 'No token provided.' });
  }
});

ProtectedRoute.post('', (Request, Response) => {
  var data = Request.body;

  var decode = Request.decoded;

  if (!data.firstName || !data.lastName || !data.email)
    return Response.status(200).send({
      status: false,
      errMessage: 'missing data',
    });

  dbUser.findOne({ email: decode.email }, (error, user) => {
    if (error) return Response.status(500);

    if (!user || !user.validPassword(decode.password))
      return Response.status(200).send({
        status: false,
        errMessage: 'Not user found',
      });

    if (user.status === false)
      return Response.status(200).send({
        status: false,
        errMessage: 'User is not active',
      });

    user.firstName = data.firstName;
    user.lastName = data.lastName;
    user.email = data.email;
    user.phone = data.phone;

    user.save((err, newData) => {
      if (err) return Response.status(500);

      return Response.status(200).send({
        status: true,
        firstName: newData.firstName,
        lastName: newData.lastName,
        email: newData.email,
        phone: newData.phone,
      });
    });
  });
});

var updateProfile = { ProtectedRoute };

module.exports = updateProfile;
