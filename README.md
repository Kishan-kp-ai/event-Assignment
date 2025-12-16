# Mini Event Platform

A full-stack MERN application for creating, managing, and RSVPing to events with a modern, responsive UI.

## Features

### Authentication & Security
- User Sign Up and Login
- Password hashing with bcrypt
- JWT (JSON Web Tokens) for stateless authentication
- Protected routes for authenticated users only

### Event Management (CRUD)
- **Create Event** - Title, description, date/time, location, capacity, and image upload
- **View Events** - Dashboard showing all upcoming events with event cards
- **Edit & Delete** - Users can only modify events they created (ownership verification)
- **Image Upload** - Cloud storage via Cloudinary

### RSVP System
- Join and leave events
- Capacity enforcement (no RSVPs when full)
- Concurrency handling with MongoDB transactions (prevents overbooking)
- No duplicate RSVPs (one RSVP per user per event)

### Search & Filter
- Search events by title, description, or location
- Filter by date range (From/To)
- Sort by: Upcoming, Newest, Most Popular
- Debounced search for performance

### SmartDashboard
- Personalized welcome with user stats
- View events you're attending
- View events you've created
- Past events history
- Tabbed interface for easy navigation

### Responsive Design
- Works on Desktop, Tablet, and Mobile
- Modern UI with animations and gradients
- Clean forms with validation and loading states

## Tech Stack

- **Frontend**: React.js, React Router, Axios, React Toastify
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT, bcryptjs
- **Image Storage**: Cloudinary
- **Concurrency**: MongoDB transactions for atomic RSVP operations

## Project Structure

```
├── server/
│   ├── config/          # Database and Cloudinary configuration
│   ├── middleware/      # Auth middleware
│   ├── models/          # Mongoose models (User, Event)
│   ├── routes/          # API routes (auth, events, rsvp)
│   └── server.js        # Express server entry point
│
└── client/
    ├── public/          # Static files
    └── src/
        ├── components/  # Reusable components (Navbar, EventCard, EventForm)
        ├── context/     # Auth context provider
        ├── pages/       # Page components (Home, Dashboard, Login, etc.)
        └── services/    # API service configuration
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)

### Server Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/event-platform
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Client Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user (protected) |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | Get all upcoming events (supports search, filter, sort) |
| GET | `/api/events/:id` | Get single event |
| GET | `/api/events/my-events` | Get user's created events (protected) |
| GET | `/api/events/my-rsvps` | Get user's RSVPed events (protected) |
| POST | `/api/events` | Create event (protected) |
| PUT | `/api/events/:id` | Update event (protected, owner only) |
| DELETE | `/api/events/:id` | Delete event (protected, owner only) |

### Query Parameters for Events
- `search` - Search by title, description, or location
- `startDate` - Filter events from this date
- `endDate` - Filter events until this date
- `sortBy` - Sort by: `date`, `newest`, `popular`

### RSVP
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rsvp/:eventId/join` | RSVP to event (protected) |
| POST | `/api/rsvp/:eventId/leave` | Cancel RSVP (protected) |
| GET | `/api/rsvp/:eventId/status` | Get RSVP status (protected) |

## Key Implementation Details

### Concurrency Handling for RSVP

The RSVP system uses MongoDB transactions with atomic operations to prevent overbooking:

```javascript
// Uses findOneAndUpdate with conditions to ensure:
// 1. User hasn't already RSVPed
// 2. Event capacity hasn't been reached
// All within a single atomic operation
```

### Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT-based stateless authentication
- Protected routes with auth middleware
- Owner verification for event modifications

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Browse all events with search & filters |
| Login | `/login` | User login |
| Register | `/register` | User registration |
| Event Details | `/events/:id` | View event details and RSVP |
| Create Event | `/create-event` | Create new event (protected) |
| Edit Event | `/edit-event/:id` | Edit event (protected, owner only) |
| SmartDashboard | `/dashboard` | User dashboard with stats (protected) |
| My RSVPs | `/my-rsvps` | Events user is attending (protected) |

## License

MIT
