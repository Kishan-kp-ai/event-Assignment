import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import EventForm from '../components/EventForm';
import './CreateEvent.css';

const CreateEvent = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const response = await api.post('/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Event created successfully!');
      navigate(`/events/${response.data.event._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event">
      <div className="page-header">
        <h1>Create Event</h1>
        <p>Fill in the details to create a new event</p>
      </div>

      <EventForm onSubmit={handleSubmit} submitLabel="Create Event" loading={loading} />
    </div>
  );
};

export default CreateEvent;
