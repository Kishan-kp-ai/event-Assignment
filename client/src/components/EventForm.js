import React, { useState } from 'react';
import './EventForm.css';

const EventForm = ({ initialData, onSubmit, submitLabel, loading }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    dateTime: initialData?.dateTime
      ? new Date(initialData.dateTime).toISOString().slice(0, 16)
      : '',
    location: initialData?.location || '',
    capacity: initialData?.capacity || ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.image?.url || null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    if (image) {
      data.append('image', image);
    }
    onSubmit(data);
  };

  const minDateTime = new Date().toISOString().slice(0, 16);

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title">Event Title *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter event title"
          required
          maxLength={100}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your event..."
          required
          maxLength={2000}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="dateTime">Date & Time *</label>
          <input
            type="datetime-local"
            id="dateTime"
            name="dateTime"
            value={formData.dateTime}
            onChange={handleChange}
            min={minDateTime}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="capacity">Capacity *</label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            placeholder="Max attendees"
            min={1}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="location">Location *</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Event location"
          required
          maxLength={200}
        />
      </div>

      <div className="form-group">
        <label htmlFor="image">Event Image</label>
        <div className="image-upload">
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            className="image-input"
          />
          <label htmlFor="image" className="image-upload-label">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="image-preview" />
            ) : (
              <div className="image-placeholder">
                <span>📷</span>
                <span>Click to upload image</span>
              </div>
            )}
          </label>
        </div>
      </div>

      <button type="submit" className="btn btn-primary btn-submit" disabled={loading}>
        {loading ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
};

export default EventForm;
