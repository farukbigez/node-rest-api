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

ProtectedRoute.get('', async (Request, Response) => {
  var decode = Request.decoded;

  var user = await dbUser.findOne({ email: decode.email });

  if (!user || !user.validPassword(decode.password))
    return Response.status(400).send({
      status: false,
      errMessage: 'Not user found',
    });

  return Response.status(200).send({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    notificationChannels: user.notificationChannels,
  });
});

var changePassword = { ProtectedRoute };

module.exports = changePassword;
