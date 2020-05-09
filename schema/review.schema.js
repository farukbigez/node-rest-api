const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  created: {
    type: Date,
    default: Date.now,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: 'You must supply an author!',
  },
  advertise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Advertise',
    required: 'You must supply an advertise',
  },
  text: {
    type: String,
    required: 'Your review must have text!',
  },
  rating: {
    ref: 'Rating',
    type: Number,
    min: 1,
    max: 5,
  },
});

function autopopulate(next) {
  this.populate('author');
  next();
}

reviewSchema.pre('find', autopopulate);
reviewSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Review', reviewSchema);
