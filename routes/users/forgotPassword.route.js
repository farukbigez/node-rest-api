var express = require('express');
var crypto = require('crypto');

var route = express.Router();

var dbUser = require('../../schema/user.schema');

route.post('', async (Request, Response) => {
  var data = Request.body;

  if (!data.email)
    return Response.status(400).send({
      status: false,
      errMessage: 'missing data',
    });

  dbUser.findOne({ email: data.email }, (error, data) => {
    if (error) return Response.status(500);

    if (!data)
      return Response.status(400).send({
        status: false,
        errMessage: 'Not user found',
      });

    if (data.status === false)
      return Response.status(400).send({
        status: false,
        errMessage: 'User is not active',
      });

    var current_date = new Date().valueOf().toString(),
      random = Math.random().toString(),
      forgotHash = crypto
        .createHash('sha256')
        .update(current_date + random)
        .digest('hex');
    forgotRand = crypto
      .createHash('sha256')
      .update(random + current_date)
      .digest('hex');

    data.forgotPassword.hash = forgotHash;
    data.forgotPassword.rand = forgotRand;

    data.save((err, NewData) => {
      if (err) return Response.status(500);

      var nodemailer = require('nodemailer');

      // Create the transporter with the required configuration for Gmail
      // change the user and pass !
      var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
          user: 'norelypft.team@gmail.com',
          pass: 'SLSYAU7HCEdLu5D',
        },
      });

      // setup e-mail data
      var mailOptions = {
        from: 'norelypft.team@gmail.com', // sender address (who sends)
        to: NewData.email, // list of receivers (who receives)
        subject: 'reset pass', // Subject line
        html:
          'hash: ' +
          NewData.forgotPassword.hash +
          ' - rand: ' +
          NewData.forgotPassword.rand, // html body
      };

      // send mail with defined transport object
      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          return console.log(error);
        }

        console.log('Message sent: ' + info.response);
      });

      return Response.status(200).send({ status: true });
    });
  });
});

var forgotPassword = { route };

module.exports = forgotPassword;
