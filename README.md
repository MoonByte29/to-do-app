# TaskFlow - Professional To-Do Web Application

A full-stack task management application that helps users organize tasks across multiple boards with advanced features like priority levels, reminders, and due dates.

## Features

### Core Functionality
- **User Authentication**: Secure email/password registration and login with JWT tokens
- **Boards Management**: Create, view, update, and delete project boards
- **Task Management**: Full CRUD operations for tasks within boards
- **Task Organization**: 
  - Priority levels (Low, Medium, High)
  - Due dates with visual overdue indicators
  - Task status (Pending/Completed)
  - Tags for categorization
  - Notes for additional details

### Advanced Features
- **Smart Reminders**: 
  - Browser notifications when app is open
  - Email notifications via SMTP
  - Automated reminder checking every minute
- **Filtering & Sorting**: Filter tasks by status and priority
- **Upcoming Tasks**: Dashboard widget showing tasks due within 7 days
- **Visual Indicators**: Clear markers for overdue and high-priority tasks
- **Responsive Design**: Professional, elegant UI with Stone & Slate color palette

## Tech Stack

### Frontend
- **React.js** (v19.0.0) - UI framework
- **React Router** (v7.5.1) - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Shadcn/UI** - Component library
- **Lucide React** - Icons
- **Sonner** - Toast notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** (v4.18.2) - Web framework
- **MongoDB** with **Mongoose** (v8.0.3) - Database
- **JWT** (jsonwebtoken v9.0.2) - Authentication
- **bcryptjs** (v2.4.3) - Password hashing
- **Nodemailer** (v6.9.7) - Email notifications
- **node-cron** (v3.0.3) - Task scheduling

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or remote instance)
- SMTP credentials (optional, for email reminders)

### Setup Instructions

1. **Clone the repository**
```bash
git clone <repository-url>
cd taskflow
```

2. **Install Backend Dependencies**
```bash
cd backend
yarn install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
yarn install
```

4. **Configure Environment Variables**

Create or update `/app/backend/.env`:
```env
MONGO_URL=\"mongodb://localhost:27017\"
DB_NAME=\"taskflow_database\"
CORS_ORIGINS=\"*\"
JWT_SECRET=\"your-secret-key-here\"

# Email Configuration (Optional)
SMTP_HOST=\"smtp.gmail.com\"
SMTP_PORT=\"587\"
SMTP_USER=\"your-email@gmail.com\"
SMTP_PASS=\"your-app-password\"
SMTP_FROM=\"your-email@gmail.com\"
```

Create or update `/app/frontend/.env`:
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

5. **Start MongoDB**
```bash
mongod --bind_ip_all
```

6. **Start Backend Server**
```bash
cd backend
node server.js
# Server runs on http://localhost:8001
```

7. **Start Frontend**
```bash
cd frontend
yarn start
# App opens at http://localhost:3000
```

## Configuration

### Email Notifications
Email notifications are **optional**. If SMTP credentials are not configured:
- The app will function normally
- Email reminders will be skipped gracefully
- Browser notifications will still work

To enable email notifications:
1. Use Gmail with App Password or any SMTP service
2. Configure SMTP credentials in `/app/backend/.env`
3. Restart the backend server

### JWT Secret
Change the default `JWT_SECRET` in production for security.

## Usage

### Getting Started
1. **Register**: Create an account with email and password
2. **Create Boards**: Organize tasks into different projects (e.g., Work, Personal)
3. **Add Tasks**: Create tasks with priorities, due dates, and reminders
4. **Manage Tasks**: Mark as complete, edit details, or delete
5. **Filter & View**: Use filters to focus on specific tasks

### Creating Tasks with Reminders
1. Click \"Add Task\" in any board
2. Fill in task details
3. Set a reminder date/time
4. Browser notifications will trigger at the specified time
5. Email notifications will be sent (if SMTP is configured)

### Visual Indicators
- **Red border + \"Overdue\" badge**: Tasks past their due date
- **Red badge**: High priority tasks
- **Blue badge**: Medium priority tasks
- **Gray badge**: Low priority tasks

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Boards
- `GET /api/boards` - Get all boards (protected)
- `POST /api/boards` - Create board (protected)
- `GET /api/boards/:id` - Get single board (protected)
- `PUT /api/boards/:id` - Update board (protected)
- `DELETE /api/boards/:id` - Delete board and tasks (protected)

### Tasks
- `GET /api/tasks/board/:boardId` - Get tasks for board (protected)
- `POST /api/tasks` - Create task (protected)
- `PUT /api/tasks/:id` - Update task (protected)
- `DELETE /api/tasks/:id` - Delete task (protected)
- `GET /api/tasks/upcoming` - Get upcoming tasks (protected)

### Health Check
- `GET /api/health` - Server health status

## Project Structure

```
taskflow/
├── backend/
│   ├── models/
│   │   ├── User.js           # User schema with password hashing
│   │   ├── Board.js          # Board schema
│   │   └── Task.js           # Task schema with priorities
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   ├── boards.js         # Board CRUD routes
│   │   └── tasks.js          # Task CRUD routes
│   ├── services/
│   │   ├── emailService.js   # Email notification service
│   │   └── reminderService.js # Cron job for reminders
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   ├── server.js             # Express server setup
│   ├── package.json          # Backend dependencies
│   └── .env                  # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js      # Login page
│   │   │   ├── Register.js   # Registration page
│   │   │   ├── Dashboard.js  # Boards overview
│   │   │   ├── BoardView.js  # Task list view
│   │   │   ├── BoardCard.js  # Board card component
│   │   │   ├── TaskCard.js   # Task card component
│   │   │   └── ui/           # Shadcn UI components
│   │   ├── App.js            # Main app component
│   │   ├── index.js          # Entry point
│   │   ├── index.css         # Global styles
│   │   └── App.css           # App styles
│   ├── public/               # Static assets
│   ├── package.json          # Frontend dependencies
│   ├── tailwind.config.js    # Tailwind configuration
│   └── .env                  # Environment variables
│
├── design_guidelines.json    # Design system specifications
└── README.md                 # This file
```

## Design System

### Color Palette
- **Background**: Off-white stone (hsl(60 5% 96%))
- **Primary**: Deep charcoal (hsl(240 5.9% 10%))
- **Brand Colors**: Blue-gray shades (#7694b8, #53769d, etc.)
- **Accent**: Muted slate tones

### Typography
- **Headings**: Manrope (sans-serif)
- **Body**: Public Sans (sans-serif)
- **Monospace**: JetBrains Mono

### Component Style
- Generous spacing (p-6, p-8)
- Subtle shadows and hover effects
- Rounded corners (0.5rem)
- Professional, calm aesthetic

## Development Notes

### Reminder System
The backend runs a cron job every minute to check for tasks with upcoming reminders:
- Checks tasks with reminders in the next 5 minutes
- Sends email notifications if SMTP is configured
- Marks reminders as sent to avoid duplicates

### Browser Notifications
- Automatically requests permission on board view
- Schedules notifications using setTimeout
- Only works when app is open in browser

### Security
- Passwords hashed with bcryptjs (10 salt rounds)
- JWT tokens expire in 7 days
- Protected routes require valid JWT token
- CORS configured for security

### Database Models
- **User**: email, password (hashed), name, timestamps
- **Board**: title, description, color, userId, timestamps
- **Task**: title, description, boardId, userId, priority, status, dueDate, reminderDate, reminderSent, tags, notes, timestamps

## Testing

The application includes comprehensive data-testid attributes for automated testing:
- All forms have testable inputs
- All buttons and interactive elements are marked
- All dialogs and modals are identifiable

Example test IDs:
- `login-form`, `login-email-input`, `login-submit-button`
- `create-board-button`, `board-card-{id}`
- `create-task-button`, `task-card-{id}`
- `task-status-toggle-{id}`, `delete-task-{id}`

## Troubleshooting

### Backend won't start
- Verify MongoDB is running
- Check `/app/backend/.env` configuration
- View logs: `tail -f /var/log/supervisor/backend.err.log`

### Frontend won't load
- Ensure backend is running on port 8001
- Verify `REACT_APP_BACKEND_URL` in frontend/.env
- Clear browser cache and restart

### Email notifications not working
- Verify SMTP credentials in backend/.env
- Check backend logs for email errors
- For Gmail, use App Password (not regular password)
- Email is optional - app works without it

### Browser notifications not appearing
- Check browser notification permissions
- Notifications only work when app is open
- Some browsers block notifications in incognito mode

## License

This project is created for demonstration purposes.

## Support

For issues or questions, please check the troubleshooting section or review the backend logs.

---

**Made with Emergent** - Built with Node.js, Express, React, and MongoDB
"
