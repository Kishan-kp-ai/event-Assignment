import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './EventDetails.css';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${id}`);
        setEvent(response.data.event);
      } catch (error) {
        toast.error('Event not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, navigate]);

  const isCreator = user && (event?.creator?._id === user.id || event?.creator?._id === user._id);
  const isAttending = user && event?.attendees?.some((a) => a._id === user.id || a._id === user._id);
  const isFull = event?.attendees?.length >= event?.capacity;
  const isPast = event && new Date(event.dateTime) < new Date();

  const handleRsvp = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to RSVP');
      navigate('/login');
      return;
    }

    setRsvpLoading(true);
    try {
      const endpoint = isAttending ? 'leave' : 'join';
      const response = await api.post(`/rsvp/${id}/${endpoint}`);
      setEvent(response.data.event);
      toast.success(isAttending ? 'Left the event' : 'Successfully RSVPed!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'RSVP failed');
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const spotsLeft = event.capacity - event.attendees.length;

  return (
    <div className="event-details">
      <div className="event-details-header">
        <Link to="/" className="back-link">
          ← Back to Events
        </Link>
      </div>

      <div className="event-details-content">
        <div className="event-details-main">
          <div className="event-details-image">
            {event.image?.url ? (
              <img src={event.image.url} alt={event.title} />
            ) : (
              <div className="event-image-placeholder">
                <span>📅</span>
              </div>
            )}
          </div>

          <div className="event-details-info">
            <h1>{event.title}</h1>

            <div className="event-details-meta">
              <div className="meta-item">
                <span className="meta-icon">📆</span>
                <span>{formatDate(event.dateTime)}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">🕐</span>
                <span>{formatTime(event.dateTime)}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">📍</span>
                <span>{event.location}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">👤</span>
                <span>Hosted by {event.creator?.name}</span>
              </div>
            </div>

            <div className="event-description">
              <h3>About this event</h3>
              <p>{event.description}</p>
            </div>
          </div>
        </div>

        <div className="event-details-sidebar">
          <div className="rsvp-card">
            <div className="rsvp-status">
              <div className="capacity-info">
                <span className="capacity-number">{event.attendees.length}</span>
                <span className="capacity-label">/ {event.capacity} attending</span>
              </div>
              <div className="spots-left">
                {isFull ? (
                  <span className="full">Event is full</span>
                ) : (
                  <span>{spotsLeft} spots left</span>
                )}
              </div>
            </div>

            <div className="capacity-bar-large">
              <div
                className="capacity-fill"
                style={{
                  width: `${(event.attendees.length / event.capacity) * 100}%`
                }}
              ></div>
            </div>

            {isPast ? (
              <div className="event-past-notice">This event has ended</div>
            ) : isCreator ? (
              <div className="creator-actions">
                <Link to={`/edit-event/${event._id}`} className="btn btn-secondary">
                  Edit Event
                </Link>
                <button className="btn btn-danger" onClick={handleDelete}>
                  Delete Event
                </button>
              </div>
            ) : (
              <button
                className={`btn ${isAttending ? 'btn-secondary' : 'btn-primary'} btn-rsvp`}
                onClick={handleRsvp}
                disabled={rsvpLoading || (isFull && !isAttending)}
              >
                {rsvpLoading
                  ? 'Processing...'
                  : isAttending
                  ? 'Cancel RSVP'
                  : isFull
                  ? 'Event Full'
                  : 'RSVP Now'}
              </button>
            )}
          </div>

          <div className="attendees-card">
            <h3>Attendees ({event.attendees.length})</h3>
            {event.attendees.length > 0 ? (
              <ul className="attendees-list">
                {event.attendees.map((attendee) => (
                  <li key={attendee._id} className="attendee-item">
                    <span className="attendee-avatar">
                      {attendee.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="attendee-name">{attendee.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-attendees">No attendees yet. Be the first!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
