const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../schema/order.schema');
const Advertise = require('../schema/advertise');

//Handle incoming GET request to /orders
router.get('/', (req, res, next) => {
  Order.find()
    .select()
    .populate('advertise')
    .exec()
    .then((docs) => {
      res.status(200).json({
        count: docs.length,
        orders: doc.map((doc) => {
          return {
            _id: doc.id,
            advertise: doc.advertise,
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
      const order = new Order({
        _id: mongoose.Types.ObjectId(),
        advertise: req.body.advertiseId,
      });
      return order.save();
    })
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: 'Order stored',
        createOrder: {
          _id: result.id,
          advertise: result.advertise,
        },
        request: {
          type: 'GET',
          url: 'http://localhost:3000/orders' + result.id,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
  res.status(201).json({
    message: 'Order was created',
    order: order,
  });
});

router.get('/:orderId', (req, res, next) => {
  Order.findById(req.params.orderId)
    .populate('advertise')
    .exec()
    .then((order) => {
      return res.status(404).json({
        message: 'Order not found',
      });
    });
  then((order) => {
    res.status(200).json({
      order: order,
      request: {
        type: 'GET',
        url: 'http://localhost:3000/orders',
      },
    });
  }).catch((err) => {
    res.status(500).json({
      error: err,
    });
  });
});

router.delete('/:orderId', (req, res, next) => {
  Order.remove({
    _id: req.params.orderId,
  })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: 'Order deleted',
        request: {
          type: 'POST',
          url: 'http://localhost:3000/orders',
          body: {
            advertiseId: 'ID',
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
