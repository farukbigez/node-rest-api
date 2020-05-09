var express = require('express');

var route = express.Router();

var dbUser = require('../../schema/user.schema');

route.get('/:id', (Request, Response) => {
  var id = Request.params.id || null;

  if (id === null)
    return Response.status(200).send({
      status: false,
      errMessage: 'missing data',
    });

  dbUser.findOne(
    {
      verify: id,
    },
    (error, user) => {
      if (error) return Response.status(500);

      if (!user || user === null)
        return Response.status(200).send({
          status: false,
          errMessage: 'missing data',
        });

      if (user.verify === null)
        return Response.status(200).send({
          status: false,
          errMessage: 'Incorrect operation',
        });

      user.verify = '';
      user.status = true;

      user.save((err) => {
        if (err) return Response.status(500);

        return Response.status(200).send({
          status: true,
        });
      });
    }
  );
});

var verifyUser = {
  route,
};

module.exports = verifyUser;
