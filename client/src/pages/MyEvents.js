import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import EventCard from '../components/EventCard';
import './MyEvents.css';

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const response = await api.get('/events/my-events');
        setEvents(response.data.events);
      } catch (error) {
        console.error('Failed to fetch events');
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="my-events">
      <div className="page-header">
        <h1>My Events</h1>
        <Link to="/create-event" className="btn btn-primary">
          Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="empty-state">
          <h3>You haven't created any events yet</h3>
          <p>Create your first event and start inviting people!</p>
          <Link to="/create-event" className="btn btn-primary">
            Create Event
          </Link>
        </div>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEvents;
