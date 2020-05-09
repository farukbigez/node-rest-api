var express = require('express');
var jwt = require('jsonwebtoken'),
  JWT_KEY = "(-QFX~v/..{8'kNaXsQh7fr53Xy0";
const multer = require('multer');
const fs = require('fs').promises;
const hasha = require('hasha');

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
    return res.status(403).send({
      status: false,
      errMessage: 'No token provided.',
    });
  }
});

async function ensureDir(dirpath) {
  try {
    await fs.mkdir(dirpath, {
      recursive: true,
    });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function main() {
  try {
    await ensureDir('assets/user/avatar');
  } catch (err) {
    console.error(err);
  }
}

main();

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'assets/user/avatar/');
  },
  filename: function(req, file, cb) {
    let extArray = file.mimetype.split('/');
    let extension = extArray[extArray.length - 1];
    cb(null, 'avatar' + '-' + Date.now() + '.' + extension);
  },
});

var upload = multer({
  storage: storage,
});

ProtectedRoute.post('', upload.single('avatar'), async (Request, Response) => {
  const avatar = Request.file;

  var decode = Request.decoded;

  if (!avatar)
    return Response.status(200).send({
      status: false,
      errMessage: 'missing data',
    });

  var imghash = await hasha.fromFile(avatar.path, {
    algorithm: 'sha256',
  });

  var checkImg = await dbUser.findOne({
    'avatar.hash': imghash,
  });

  if (checkImg) {
    fs.unlink(avatar.path);

    return Response.status(200).send({
      status: false,
      errMessage: 'This image has been used before.',
    });
  }

  dbUser.findOne(
    {
      email: decode.email,
    },
    (error, user) => {
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

      user.avatar = {
        originalname: avatar.originalname,
        encoding: avatar.encoding,
        mimetype: avatar.mimetype,
        destination: avatar.destination,
        filename: avatar.filename,
        path: avatar.path,
        size: avatar.size,
        hash: imghash,
      };

      user.save((err, newData) => {
        if (err) return Response.status(500);

        return Response.status(200).send({
          // status: true,
          // avatarPath: newData.avatar.path,
          newData,
        });
      });
    }
  );
});

var updateAvatar = {
  ProtectedRoute,
};

module.exports = updateAvatar;
