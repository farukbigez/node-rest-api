const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString + file.originalname);
  },
});
const upload = multer({
  storage: storage,
});

const Advertise = require('../schema/advertise');

router.get('/', (req, res, next) => {
  Advertise.find()
    .select('name price_id')
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        advertising: docs.map((doc) => {
          return {
            name: doc.name,
            price: doc.price,
            author: doc.author,
            description: doc.description,
            created: doc.created,
            location: doc.location,
            tags: doc.tags,
            _id: doc.id,
            url: {
              request: {
                type: 'GET',
                url: 'http://localhost:3000/advertising/ + doc._id',
              },
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.post('/', upload.single('advertiseImage'), (req, res, next) => {
  const advertise = new Advertise({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    tags: req.body.tags,
    author: req.body.author,
    description: req.body.description,
    created: req.body.created,
    location: req.body.location,
    price: req.body.price,
  });
  advertise
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: 'Advertise Created',
        createdAdvertise: {
          name: result.name,
          tags: result.tags,
          price: result.price,
          description: result.advertise,
          author: result.author,
          location: result.location,
          _id: result._id,
          request: {
            type: 'GET',
            url: 'http://localhost:3000/advertising/ + result.id',
          },
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.get('/:advertiseId', (req, res, next) => {
  const id = req.params.advertiseId;
  Advertise.findById(id).select('name price Id').exec().then((doc) => {
    console.log('From database', doc);
    if (doc) {
      res.status(200).json({
        advertise: doc,
        request: {
          type: 'GET',
          url: 'http://localhost:3000/advertising',
        },
      });
    } else {
      res.status(404).json({
        message: 'No valid enrty found for provide ID',
      });
    }
  });

  //Rating.findById
});

router.patch('/:advertiseId', (req, res, next) => {
  const id = req.params.advertiseId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Advertise.update(
    {
      _id: id,
    },
    {
      $set: updateOps,
    }
  )
    .exec()
    .then((result) => {
      res.status(200).json({
        message: 'Advertise updated',
        request: {
          type: 'GET',
          url: 'http://localhost:9000/advertising/' + id,
        },
      });
      console.log(result);
    })
    .catch(
      console.log((err) => {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      })
    );
});

router.delete('/:advertiseId', (req, res, next) => {
  const id = req.params.advertiseId;
  Advertise.remove({
    _id: id,
  })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: 'Advertise Deleted',
        request: {
          type: 'POST',
          url: 'http://localhost:9000/advertising',
          data: {
            name: 'String',
            price: 'Number',
          },
        },
      });
      console.log(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
