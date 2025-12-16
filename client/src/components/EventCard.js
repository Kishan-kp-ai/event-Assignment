import React from 'react';
import { Link } from 'react-router-dom';
import './EventCard.css';

const EventCard = ({ event }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const spotsLeft = event.capacity - event.attendees.length;
  const isFull = spotsLeft <= 0;

  return (
    <Link to={`/events/${event._id}`} className="event-card">
      <div className="event-image">
        {event.image?.url ? (
          <img src={event.image.url} alt={event.title} />
        ) : (
          <div className="event-image-placeholder">
            <span>📅</span>
          </div>
        )}
        {isFull && <span className="event-badge full">Full</span>}
        {!isFull && spotsLeft <= 5 && (
          <span className="event-badge limited">{spotsLeft} spots left</span>
        )}
      </div>
      <div className="event-content">
        <h3 className="event-title">{event.title}</h3>
        <div className="event-meta">
          <div className="event-meta-item">
            <span className="meta-icon">📍</span>
            <span>{event.location}</span>
          </div>
          <div className="event-meta-item">
            <span className="meta-icon">📆</span>
            <span>{formatDate(event.dateTime)}</span>
          </div>
          <div className="event-meta-item">
            <span className="meta-icon">🕐</span>
            <span>{formatTime(event.dateTime)}</span>
          </div>
        </div>
        <div className="event-footer">
          <div className="event-capacity">
            <span className="capacity-bar">
              <span
                className="capacity-fill"
                style={{
                  width: `${(event.attendees.length / event.capacity) * 100}%`
                }}
              ></span>
            </span>
            <span className="capacity-text">
              {event.attendees.length}/{event.capacity} attending
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
