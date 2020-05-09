var express = require('express');

var route = express.Router();

var dbUser = require('../../schema/user.schema');

route.post('', async (Request, Response) => {
  var data = Request.body;

  if (!data.hash || !data.rand || !data.password)
    return Response.status(400).send({
      status: false,
      errMessage: 'missing data',
    });

  dbUser.findOne(
    {
      forgotPassword: {
        hash: data.hash,
        rand: data.rand,
      },
    },
    (error, user) => {
      if (error) return Response.status(500);

      if (!user)
        return Response.status(400).send({
          status: false,
          errMessage: 'Incorrect operation',
        });

      if (user.status === false)
        return Response.status(400).send({
          status: false,
          errMessage: 'User is not active',
        });

      user.forgotPassword = {
        hash: '',
        rand: '',
      };
      user.setPassword(data.password);

      user.save((err) => {
        if (err) return Response.status(500);

        return Response.status(200).send({
          status: true,
        });
      });
    }
  );
});

var resetPassword = {
  route,
};

module.exports = resetPassword;
