const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Review = require('../schema/review.schema');
const Advertise = require('../schema/advertise');
const User = require('../schema/user.schema');

//Handle incoming GET request to /reviews
router.get('/', (req, res, next) => {
  Review.find()
    .select()
    .populate('advertise', 'author')
    .exec()
    .then((docs) => {
      res.status(200).json({
        count: docs.length,
        reviews: docs.map((doc) => {
          return {
            _id: doc.id,
            advertise: doc.advertise,
            author: doc.author,
            text: doc.text,
            rating: doc.rating,
            request: {
              type: 'GET',
              url: 'http://localhost:9000/reviews/' + doc.id,
            },
          };
        }),
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.post('/', (req, res, next) => {
  Advertise.findById(req.body.advertiseId)
    .then((advertise) => {
      if (!advertise) {
        return res.status(404).json({
          message: 'Advertise not found',
        });
      }

      User.findById(req.body.authorId).then((author) => {
        if (!author) {
          return res.status(404).json({
            message: 'Author not found',
          });
        }
      });

      const review = new Review({
        _id: mongoose.Types.ObjectId(),
        advertise: req.body.advertiseId,
        author: req.body.authorId,
        rating: req.body.rating,
        text: req.body.text,
      });

      review.save().then((result) => {
        res.status(201).json({
          message: 'Review Created',
          createReview: {
            _id: result.id,
            advertise: result.advertise,
            author: result.author,
            rating: result.rating,
            text: result.text,
          },
          request: {
            type: 'GET',
            url: 'http://localhost:9000/reviews/' + result.id,
          },
        });
        console.log(result);
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
  // res.status(201).json({
  // 	message: 'Review was created',

  // })
});

router.get('/:reviewId', (req, res, next) => {
  Review.findById(req.params.reviewId)
    .populate('advertise', 'author')
    .exec()
    .then((review) => {
      if (!review) {
        return res.status(404).json({
          messaged: 'Review not found ☢☢☢',
        });
      }
    })
    .then((review) => {
      res.status(200).json({
        review: review,
        request: {
          type: 'GET',
          url: 'http://localhost:9000/reviews/',
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.delete('/:reviewId', (req, res, next) => {
  Review.remove({
    _id: req.params.reviewId,
  })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: 'Review deleted',
        request: {
          type: 'POST',
          url: 'http://localhost:9000/reviews/',
          body: {
            advertiseId: 'ID',
            authorId: 'ID',
          },
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
