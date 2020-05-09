var express = require('express');
var crypto = require('crypto');

var route = express.Router();

var dbUser = require('../../schema/user.schema');

route.post('', async (Request, Response) => {
  var data = Request.body;

  if (!data.email || !data.password || !data.username)
    return Response.status(200).send({
      status: false,
      errMessage: 'missing data',
    });

  var emailUniqControl = await dbUser.findOne({
    email: data.email,
  });

  var usernameUniqControl = await dbUser.findOne({
    username: data.username,
  });

  if (emailUniqControl || usernameUniqControl)
    return Response.status(200).send({
      status: false,
      errMessage: 'already exists',
    });

  var newUser = new dbUser(data);

  newUser.setPassword(data.password);

  newUser.status = false;
  newUser.delete = false;

  var current_date = new Date().valueOf().toString(),
    random = Math.random().toString();

  const hash = crypto
    .createHash('sha256')
    .update(current_date + random + '-' + random + current_date)
    .digest('hex');

  newUser.verify = hash;

  newUser.save((err, User) => {
    if (err) {
      return response.sendStatus(500).send({
        err,
      });
    }

    // var nodemailer = require('nodemailer')

    // // Create the transporter with the required configuration for Gmail
    // // change the user and pass !
    // var transporter = nodemailer.createTransport({
    // 	host: 'smtp.gmail.com',
    // 	port: 465,
    // 	secure: true, // use SSL
    // 	auth: {
    // 		user: 'norelypft.team@gmail.com',
    // 		pass: 'SLSYAU7HCEdLu5D'
    // 	}
    // })

    // // setup e-mail data
    // var mailOptions = {
    // 	from: 'kara <norelypft.team@gmail.com>', // sender address (who sends)
    // 	to: User.email, // list of receivers (who receives)
    // 	subject: 'verify', // Subject line
    // 	html: '<b>Hello world </b><br> This is the first email sent with Nodemailer in Node.js http://localhost:7777/User/Verify/' + User.verify // html body
    // }

    // // send mail with defined transport object
    // transporter.sendMail(mailOptions, function (error, info) {
    // 	if (error) {
    // 		return console.log(error)
    // 	}

    // 	console.log('Message sent: ' + info.response)
    // })

    return Response.status(200).send({
      status: true,
    });
  });
});

var register = {
  route,
};

module.exports = register;
