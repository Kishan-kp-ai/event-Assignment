import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import EventCard from '../components/EventCard';
import './MyEvents.css';

const MyRsvps = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyRsvps = async () => {
      try {
        const response = await api.get('/events/my-rsvps');
        setEvents(response.data.events);
      } catch (error) {
        console.error('Failed to fetch RSVPs');
      } finally {
        setLoading(false);
      }
    };

    fetchMyRsvps();
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
        <h1>My RSVPs</h1>
      </div>

      {events.length === 0 ? (
        <div className="empty-state">
          <h3>You haven't RSVPed to any events yet</h3>
          <p>Explore upcoming events and join the ones you like!</p>
          <Link to="/" className="btn btn-primary">
            Browse Events
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

export default MyRsvps;
