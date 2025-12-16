const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Event = require('../models/Event');
const { protect } = require('../middleware/auth');

router.post('/:eventId/join', protect, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const event = await Event.findById(req.params.eventId).session(session);

    if (!event) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.dateTime < new Date()) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Cannot RSVP to past events'
      });
    }

    const alreadyRsvped = event.attendees.some(
      attendee => attendee.toString() === req.user.id
    );

    if (alreadyRsvped) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'You have already RSVPed to this event'
      });
    }

    if (event.attendees.length >= event.capacity) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Event is at full capacity'
      });
    }

    const result = await Event.findOneAndUpdate(
      {
        _id: req.params.eventId,
        attendees: { $ne: req.user._id },
        $expr: { $lt: [{ $size: '$attendees' }, '$capacity'] }
      },
      {
        $addToSet: { attendees: req.user._id }
      },
      {
        new: true,
        session
      }
    )
      .populate('creator', 'name email')
      .populate('attendees', 'name email');

    if (!result) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Unable to RSVP. Event may be full or you already RSVPed.'
      });
    }

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Successfully RSVPed to event',
      event: result
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: error.message
    });
  } finally {
    session.endSession();
  }
});

router.post('/:eventId/leave', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const isAttending = event.attendees.some(
      attendee => attendee.toString() === req.user.id
    );

    if (!isAttending) {
      return res.status(400).json({
        success: false,
        message: 'You are not RSVPed to this event'
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.eventId,
      {
        $pull: { attendees: req.user._id }
      },
      { new: true }
    )
      .populate('creator', 'name email')
      .populate('attendees', 'name email');

    res.json({
      success: true,
      message: 'Successfully left the event',
      event: updatedEvent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/:eventId/status', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const isAttending = event.attendees.some(
      attendee => attendee.toString() === req.user.id
    );

    res.json({
      success: true,
      isAttending,
      attendeeCount: event.attendees.length,
      spotsLeft: event.capacity - event.attendees.length,
      isFull: event.attendees.length >= event.capacity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
