import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState([]);
  const [myRsvps, setMyRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('attending');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, rsvpsRes] = await Promise.all([
          api.get('/events/my-events'),
          api.get('/events/my-rsvps')
        ]);
        setMyEvents(eventsRes.data.events);
        setMyRsvps(rsvpsRes.data.events);
      } catch (error) {
        console.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const upcomingRsvps = myRsvps.filter(e => new Date(e.dateTime) >= new Date());
  const pastRsvps = myRsvps.filter(e => new Date(e.dateTime) < new Date());
  const upcomingEvents = myEvents.filter(e => new Date(e.dateTime) >= new Date());
  const pastEvents = myEvents.filter(e => new Date(e.dateTime) < new Date());

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-welcome">
          <div className="welcome-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="welcome-text">
            <h1>Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p>Manage your events and RSVPs all in one place</p>
          </div>
        </div>
        <Link to="/create-event" className="btn btn-primary">
          + Create Event
        </Link>
      </header>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <span className="stat-number">{myEvents.length}</span>
            <span className="stat-label">Events Created</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-number">{upcomingRsvps.length}</span>
            <span className="stat-label">Upcoming Events</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-info">
            <span className="stat-number">{pastRsvps.length}</span>
            <span className="stat-label">Events Attended</span>
          </div>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'attending' ? 'active' : ''}`}
          onClick={() => setActiveTab('attending')}
        >
          <span className="tab-icon">🎟️</span>
          Events I'm Attending
          <span className="tab-count">{upcomingRsvps.length}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'created' ? 'active' : ''}`}
          onClick={() => setActiveTab('created')}
        >
          <span className="tab-icon">✨</span>
          Events I Created
          <span className="tab-count">{myEvents.length}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          <span className="tab-icon">📜</span>
          Past Events
          <span className="tab-count">{pastRsvps.length + pastEvents.length}</span>
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'attending' && (
          <div className="tab-content">
            {upcomingRsvps.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎟️</div>
                <h3>No upcoming events</h3>
                <p>You haven't RSVPed to any upcoming events yet</p>
                <Link to="/" className="btn btn-primary">
                  Browse Events
                </Link>
              </div>
            ) : (
              <div className="events-grid">
                {upcomingRsvps.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'created' && (
          <div className="tab-content">
            {myEvents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✨</div>
                <h3>No events created yet</h3>
                <p>Create your first event and start inviting people!</p>
                <Link to="/create-event" className="btn btn-primary">
                  Create Event
                </Link>
              </div>
            ) : (
              <>
                {upcomingEvents.length > 0 && (
                  <>
                    <h3 className="subsection-title">Upcoming Events</h3>
                    <div className="events-grid">
                      {upcomingEvents.map((event) => (
                        <EventCard key={event._id} event={event} />
                      ))}
                    </div>
                  </>
                )}
                {pastEvents.length > 0 && (
                  <>
                    <h3 className="subsection-title past">Past Events</h3>
                    <div className="events-grid past-events">
                      {pastEvents.map((event) => (
                        <EventCard key={event._id} event={event} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'past' && (
          <div className="tab-content">
            {pastRsvps.length === 0 && pastEvents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📜</div>
                <h3>No past events</h3>
                <p>Events you've attended or created will appear here</p>
                <Link to="/" className="btn btn-primary">
                  Browse Events
                </Link>
              </div>
            ) : (
              <>
                {pastRsvps.length > 0 && (
                  <>
                    <h3 className="subsection-title">Events I Attended</h3>
                    <div className="events-grid past-events">
                      {pastRsvps.map((event) => (
                        <EventCard key={event._id} event={event} />
                      ))}
                    </div>
                  </>
                )}
                {pastEvents.length > 0 && (
                  <>
                    <h3 className="subsection-title">Events I Hosted</h3>
                    <div className="events-grid past-events">
                      {pastEvents.map((event) => (
                        <EventCard key={event._id} event={event} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
