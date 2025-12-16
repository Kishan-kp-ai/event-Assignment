import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import EventForm from '../components/EventForm';
import './CreateEvent.css';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${id}`);
        const eventData = response.data.event;

        if (eventData.creator._id !== user.id) {
          toast.error('Not authorized to edit this event');
          navigate('/');
          return;
        }

        setEvent(eventData);
      } catch (error) {
        toast.error('Event not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, navigate, user]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await api.put(`/events/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Event updated successfully!');
      navigate(`/events/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="create-event">
      <div className="page-header">
        <h1>Edit Event</h1>
        <p>Update your event details</p>
      </div>

      <EventForm
        initialData={event}
        onSubmit={handleSubmit}
        submitLabel="Update Event"
        loading={submitting}
      />
    </div>
  );
};

export default EditEvent;
