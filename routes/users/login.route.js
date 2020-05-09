var express = require('express');
var jwt = require('jsonwebtoken'),
  JWT_KEY = "(-QFX~v/..{8'kNaXsQh7fr53Xy0";

var route = express.Router();

var dbUser = require('../../schema/user.schema');

route.post('', async (Request, Response) => {
  var data = Request.body;

  if (!data.email || !data.password)
    return Response.status(200).send({
      status: false,
      errMessage: 'missing data',
    });

  var user = await dbUser.findOne({ email: data.email });

  if (!user || !user.validPassword(data.password))
    return Response.status(200).send({
      status: false,
      errMessage: 'Not user found',
    });

  if (user.status === false)
    return Response.status(200).send({
      status: false,
      errMessage: 'User is not active',
    });

  var token = jwt.sign(data, JWT_KEY);

  return Response.status(200).send({ status: true, data: token });
});

var login = { route };

module.exports = login;
