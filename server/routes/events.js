const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect } = require('../middleware/auth');
const { upload, cloudinary } = require('../config/cloudinary');

router.get('/', async (req, res) => {
  try {
    const { search, startDate, endDate, sortBy } = req.query;
    
    let query = { dateTime: { $gte: new Date() } };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate) {
      query.dateTime = { ...query.dateTime, $gte: new Date(startDate) };
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.dateTime = { ...query.dateTime, $lte: end };
    }

    let sortOption = { dateTime: 1 };
    if (sortBy === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (sortBy === 'popular') {
      sortOption = { attendees: -1 };
    }

    const events = await Event.find(query)
      .populate('creator', 'name email')
      .populate('attendees', 'name email')
      .sort(sortOption);

    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/my-events', protect, async (req, res) => {
  try {
    const events = await Event.find({ creator: req.user.id })
      .populate('creator', 'name email')
      .populate('attendees', 'name email')
      .sort({ dateTime: -1 });

    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/my-rsvps', protect, async (req, res) => {
  try {
    const events = await Event.find({ attendees: req.user.id })
      .populate('creator', 'name email')
      .populate('attendees', 'name email')
      .sort({ dateTime: 1 });

    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('attendees', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { title, description, dateTime, location, capacity } = req.body;

    const eventData = {
      title,
      description,
      dateTime,
      location,
      capacity: parseInt(capacity),
      creator: req.user.id
    };

    if (req.file) {
      eventData.image = {
        url: req.file.path,
        publicId: req.file.filename
      };
    }

    const event = await Event.create(eventData);
    await event.populate('creator', 'name email');

    res.status(201).json({
      success: true,
      event
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

router.put('/:id', protect, upload.single('image'), async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    const { title, description, dateTime, location, capacity } = req.body;

    const updateData = {
      title,
      description,
      dateTime,
      location,
      capacity: parseInt(capacity)
    };

    if (req.file) {
      if (event.image.publicId) {
        await cloudinary.uploader.destroy(event.image.publicId);
      }
      updateData.image = {
        url: req.file.path,
        publicId: req.file.filename
      };
    }

    event = await Event.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    })
      .populate('creator', 'name email')
      .populate('attendees', 'name email');

    res.json({
      success: true,
      event
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    if (event.image.publicId) {
      await cloudinary.uploader.destroy(event.image.publicId);
    }

    await event.deleteOne();

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
