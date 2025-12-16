const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an event title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide an event description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  dateTime: {
    type: Date,
    required: [true, 'Please provide event date and time']
  },
  location: {
    type: String,
    required: [true, 'Please provide event location'],
    maxlength: [200, 'Location cannot be more than 200 characters']
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide event capacity'],
    min: [1, 'Capacity must be at least 1']
  },
  image: {
    url: {
      type: String,
      default: ''
    },
    publicId: {
      type: String,
      default: ''
    }
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

eventSchema.virtual('attendeeCount').get(function() {
  return this.attendees.length;
});

eventSchema.virtual('spotsLeft').get(function() {
  return this.capacity - this.attendees.length;
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

eventSchema.index({ dateTime: 1 });
eventSchema.index({ creator: 1 });

module.exports = mongoose.model('Event', eventSchema);
