# Mend 📝

A comprehensive full-stack productivity application for managing tasks, organizing workspaces, and scheduling your time. **Mend** helps you stay organized with an intuitive interface for creating todo lists, managing projects across multiple workspaces, and planning your schedule with a timetable system.

🌐 **Live Demo:** [https://mendapp.online](https://mendapp.online)

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Database Management](#database-management)
- [Dependencies](#dependencies)
- [Performance Features](#performance-features)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

- **User Authentication** - Secure login and registration with JWT tokens
- **Workspace Management** - Create and organize multiple workspaces (Home, Work, etc.)
- **Todo Lists** - Add, update, and manage todo items with completion tracking
- **Time Tracking** - Track time allocated to tasks with time-left-minutes functionality
- **Timetable Scheduling** - Plan your schedule with day-based timetable items
- **Responsive Design** - Beautiful, mobile-friendly UI with smooth animations
- **Secure API** - CORS-protected backend with user-specific data isolation
- **Local Storage** - Automatic session persistence in the browser

---

## 📁 Project Structure

```
Mend/
├── frontend/                 # React + Vite frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.jsx          # Main application component
│   │   ├── index.css        # Global styles
│   │   ├── login.jsx        # Authentication component
│   │   ├── addTask.jsx      # Todo management component
│   │   └── main.jsx         # React entry point
│   ├── index.html           # HTML template
│   └── package.json         # Frontend dependencies
│
├── backend/                  # FastAPI backend application
│   ├── auth/                # Authentication routes and security
│   │   ├── routes.py        # Auth endpoints (login, register)
│   │   └── security.py      # JWT and password utilities
│   ├── main.py              # FastAPI app and API endpoints
│   ├── database.py          # Database configuration
│   ├── models.py            # SQLAlchemy ORM models
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── requirements.txt      # Python dependencies
│   └── .env                 # Environment variables (local)
│
├── .env                     # Root environment configuration
├── README.md                # This file
└── LICENSE                  # License file
```

---

## 🛠️ Tech Stack

### Frontend (42.1% CSS, 38% JavaScript, 0.3% HTML)
- **React** - UI library for building interactive components
- **Vite** - Lightning-fast build tool and dev server
- **CSS3** - Modern styling with animations and responsive design
- **localStorage** - Client-side session persistence

### Backend (19.6% Python)
- **FastAPI** - Modern, high-performance Python web framework
- **SQLAlchemy** - SQL toolkit and ORM for database operations
- **PostgreSQL** - Reliable relational database (todo_db)
- **psycopg2-binary** - PostgreSQL driver for Python
- **python-jose** - JWT token generation and validation
- **Pydantic** - Data validation and serialization
- **Uvicorn** - ASGI server for FastAPI
- **CORS Middleware** - Cross-origin resource sharing support

---

## 🚀 Installation

### Prerequisites
- **Node.js** (v16+) and npm
- **Python** (v3.9+) and pip
- **PostgreSQL** (v12+)
- **Git**

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a Python virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   - **Windows:**
     ```bash
     venv\Scripts\activate
     ```
   - **macOS/Linux:**
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Create a `.env` file in the backend directory:**
   ```env
   DATABASE_URL=postgresql://your_username:your_password@localhost:5432/todo_db
   ```

6. **Run the backend server:**
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

---

## 🔧 Environment Setup

### Backend Environment Variables

Create a `backend/.env` file with:

```env
# PostgreSQL database connection
DATABASE_URL=postgresql://username:password@localhost:5432/todo_db

# Security (if applicable)
# SECRET_KEY=your_secret_key_here
# ALGORITHM=HS256
# ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Database Setup

1. **Create the PostgreSQL database:**
   ```bash
   psql -U postgres
   CREATE DATABASE todo_db;
   ```

2. **The tables will be automatically created** when you first run the FastAPI application (via SQLAlchemy's `Base.metadata.create_all()`).

---

## 💻 Usage

### Starting the Application

1. **Start PostgreSQL server** (if not running)

2. **Start the backend:**
   ```bash
   cd backend
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   uvicorn main:app --reload
   ```

3. **Start the frontend (in a new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173`

### Typical Workflow

1. **Register/Login** - Create an account or sign in
2. **View Workspaces** - See default "Home" and "Work" workspaces
3. **Create Workspaces** - Add custom workspaces as needed
4. **Add Todos** - Create todo items within workspaces
5. **Manage Schedule** - Add timetable items for specific days
6. **Track Progress** - Mark todos as complete and monitor your tasks

---

## 📡 API Documentation

### Authentication Endpoints

#### Register
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "secure_password"
  }'
```

#### Login
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "secure_password"
  }'
```

### Workspace Endpoints

#### Get All Workspaces
```bash
curl -X GET http://localhost:8000/workspaces \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

#### Create Workspace
```bash
curl -X POST http://localhost:8000/workspaces \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Projects"}'
```

#### Update Workspace
```bash
curl -X PATCH http://localhost:8000/workspaces/1 \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'
```

#### Delete Workspace
```bash
curl -X DELETE http://localhost:8000/workspaces/1 \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

### Todo Endpoints

#### Get Todos
```bash
curl -X GET "http://localhost:8000/todos?workspace_id=1&completed=false" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

#### Create Todo
```bash
curl -X POST http://localhost:8000/todos \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project",
    "workspace_id": 1,
    "completed": false,
    "time_left_minutes": 120
  }'
```

#### Update Todo
```bash
curl -X PATCH http://localhost:8000/todos/1 \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "completed": true,
    "time_left_minutes": 60
  }'
```

#### Delete Todo
```bash
curl -X DELETE http://localhost:8000/todos/1 \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

### Timetable Endpoints

#### Get Timetable Items
```bash
curl -X GET "http://localhost:8000/timetable-items?day=monday" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

#### Create Timetable Item
```bash
curl -X POST http://localhost:8000/timetable-items \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Team Meeting",
    "day": "monday",
    "time": "10:00 AM",
    "workspace_id": 1
  }'
```

#### Update Timetable Item
```bash
curl -X PATCH http://localhost:8000/timetable-items/1 \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Meeting"}'
```

#### Delete Timetable Item
```bash
curl -X DELETE http://localhost:8000/timetable-items/1 \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

---

## 🔨 Development

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm build

# Preview production build
npm run preview
```

### Backend Development

```bash
cd backend

# Activate virtual environment
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server with auto-reload
uvicorn main:app --reload

# Run with specific host/port
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Code Quality

**Frontend:**
- ESLint for code linting
- Prettier for code formatting

**Backend:**
- Follow PEP 8 style guide
- Use type hints for better code documentation

---

## 📦 Database Management

### PostgreSQL Connection

Use your `.env` file DATABASE_URL:
```
postgresql://username:password@localhost:5432/todo_db
```

### Useful PostgreSQL Commands

```bash
# Connect to the database
psql -U your_username -d todo_db

# List all tables
\dt

# Backup database
pg_dump -U your_username -d todo_db > backup.sql

# Restore database
psql -U your_username -d todo_db < backup.sql

# Drop database (WARNING: destructive)
DROP DATABASE todo_db;
```

### Database Schema

The application uses SQLAlchemy ORM to manage the following tables:

- **users** - User accounts and authentication
- **workspaces** - User workspaces (Home, Work, etc.)
- **todos** - Todo items with completion and time tracking
- **timetable_items** - Scheduled items with day and time information

All tables are automatically created on first run via SQLAlchemy migrations.

---

## 📦 Dependencies

### Frontend (npm)
- `react` - UI library
- `react-dom` - React DOM rendering
- `vite` - Build tool

### Backend (pip)
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `sqlalchemy` - ORM
- `psycopg2-binary` - PostgreSQL driver
- `python-dotenv` - Environment variables
- `pydantic` - Data validation
- `python-jose` - JWT tokens
- `python-multipart` - Form data handling

See `backend/requirements.txt` for the complete list.

---

## 📈 Performance Features

- **JWT Authentication** - Stateless, scalable authentication
- **Database Indexing** - Optimized queries for fast data retrieval
- **CORS Middleware** - Efficient cross-origin request handling
- **Session Caching** - LocalStorage for reduced API calls
- **Async Operations** - FastAPI's async support for concurrent requests
- **Input Validation** - Pydantic schemas prevent invalid data
- **User Data Isolation** - Each user sees only their own data

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add YourFeature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

Please ensure:
- Code follows the existing style
- All features are tested
- Documentation is updated
- Commits have clear messages

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

For issues, questions, or suggestions, please open an issue on the [GitHub repository](https://github.com/micaiahsamuel31/Mend/issues).

---

**Built with ❤️ using React, FastAPI, and PostgreSQL**
