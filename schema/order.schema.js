const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  advertise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Advertise',
    reqired: 'true',
  },
});

module.exports = mongoose.model('Order', orderSchema);
