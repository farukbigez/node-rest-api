const mongoose = require('mongoose');
const slug = require('slugs');

const advertiseSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: String,
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now,
  },
  review: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: 'You must supply an author',
  },
  //  location: {
  //      type: {
  //          type:String,
  //          default: 'Point'
  //      },
  //      coordinates: [{
  //          type:Number,
  //          required: 'For better service, you need to supply coordinates'
  //      }],
  //      address: {
  //          type:'String',
  //          required: 'You need to do that'
  //      }
  //  }
});

advertiseSchema.pre('save', async function(next) {
  if (!this.isModified('name')) {
    next();
    return;
  }
  this.slug = slug(this.name);
  //find other advertise that have a slug of ft, ft-1, ft-2
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');

  const advertiseWithSlug = await this.constructor.find({
    slug: slugRegEx,
  });

  if (advertiseWithSlug.length) {
    this.slug = `${this.slug}-${advertiseWithSlug.elenght + 1}`;
  }

  next();
});

//find reviews where the stores _id property === reviews advertise property
advertiseSchema.virtual('reviews', {
  ref: 'Review', // what model to link?
  localField: '_id', //which field on the advertise
  foreignField: 'advertise', //which field on the review?
});

module.exports = mongoose.model('Advertise', advertiseSchema);
