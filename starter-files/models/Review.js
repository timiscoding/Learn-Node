const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const reviewSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: 'You must supply an author',
  },
  created: {
    type: Date,
    default: Date.now(),
  },
  text: {
    type: String,
    required: 'Your review must have text'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: 'You must supply a store',
  },
});

module.exports = mongoose.model('Review', reviewSchema);
