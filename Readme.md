# Animind - AI-Powered Manim Animation Generator

Animind is a full-stack web application that allows users to create mathematical animations and data visualizations using natural language. Simply describe what you want to see, and Animind generates Manim Python code, renders it into high-quality videos, and displays them in an interactive interface.

## 🎯 Features

### Core Functionality
- **Natural Language to Code**: Describe animations in plain English, and AI generates Manim Python code
- **Real-time Video Generation**: Cloud-based rendering produces 1080p/4K videos in seconds
- **Interactive Project Workspace**: Resizable sidebar with chat interface for iterative refinement
- **Video Preview**: Built-in video player with play/pause, scrubbing, and time controls
- **Code Validation**: Automatic sanitization and validation of generated code for security

### Authentication & User Management
- **Google OAuth Sign-in**: Seamless authentication via Supabase
- **JWT Token-based Auth**: Secure API access with token verification
- **User Profile Display**: Shows username/name in navigation

### UI/UX Features
- **Responsive Design**: Works on desktop and mobile devices
- **Resizable Sidebar**: Users can adjust sidebar width to their preference
- **Gradient Background**: Beautiful animated gradient background
- **Smooth Animations**: Framer Motion powered transitions
- **Dark Theme**: Modern dark UI with accent colors

## 🏗️ Architecture

### Frontend (Next.js 16)
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: React Context API (AuthContext)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Authentication**: Supabase Auth with SSR support

### Backend (FastAPI)
- **Framework**: FastAPI (Python)
- **AI Integration**: Google Generative AI (Gemini)
- **Video Rendering**: Docker-based Manim execution
- **Storage**: Supabase Storage for video hosting
- **Authentication**: Supabase JWT verification

## 📁 Project Structure

```
new-test/
├── frontend/                 # Next.js frontend application
│   ├── components/
│   │   └── landing/          # Landing page components
│   │       ├── AuthModal.tsx      # Authentication modal
│   │       ├── Features.tsx        # Features section
│   │       ├── Hero.tsx            # Hero section with input
│   │       ├── HowItWorks.tsx      # How it works section
│   │       ├── Navbar.tsx          # Navigation bar
│   │       ├── Pricing.tsx         # Pricing section
│   │       └── Showcase.tsx        # Project showcase
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/
│   │   │   │   └── callback/      # OAuth callback handler
│   │   │   ├── project/            # Project workspace page
│   │   │   ├── layout.tsx         # Root layout with AuthProvider
│   │   │   └── page.tsx           # Landing page
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx    # Authentication context
│   │   └── lib/
│   │       ├── api/
│   │       │   └── client.ts       # API client utilities
│   │       └── supabase/
│   │           ├── client.ts      # Browser Supabase client
│   │           └── server.ts       # Server Supabase client
│   └── public/               # Static assets
│
└── backend/                  # FastAPI backend application
    ├── controllers/          # Business logic
    │   ├── auth_controller.py
    │   ├── generation_controller.py
    │   ├── render_controller.py
    │   └── validation_controller.py
    ├── middlewares/          # Middleware functions
    │   └── auth.py          # JWT authentication
    ├── models/              # Data models
    │   └── schemas.py       # Pydantic schemas
    ├── routes/              # API routes
    │   ├── generation.py    # Code generation endpoints
    │   ├── protected.py     # Protected endpoints
    │   ├── rendering.py     # Video rendering endpoints
    │   └── validation.py    # Code validation endpoints
    ├── utils/               # Utility functions
    │   └── supabase_client.py
    ├── generated_scripts/    # Generated Manim scripts
    ├── generated_videos/    # Rendered video files
    ├── main.py              # FastAPI application entry
    └── requirements.txt     # Python dependencies
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **Docker** (for Manim rendering)
- **Supabase Account** (for authentication and storage)
- **Google Cloud Account** (for Generative AI API)

### Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd new-test
```

#### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

### Environment Variables

#### Backend (`.env` in `backend/`)

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_BUCKET=videos

# Google Generative AI
GENAI_API_KEY=your_google_genai_api_key

# Optional: JWT Verification (for faster token validation)
SUPABASE_JWT_SECRET=your_jwt_secret
SUPABASE_AUD=your_audience
```

#### Frontend (`.env.local` in `frontend/`)

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8008
```

### Supabase Configuration

1. **Create a Supabase Project** at [supabase.com](https://supabase.com)

2. **Enable Google OAuth**:
   - Go to Authentication → Providers
   - Enable Google provider
   - Add your Google OAuth credentials
   - Set redirect URL: `http://localhost:3000/auth/callback`

3. **Create Storage Bucket**:
   - Go to Storage
   - Create a new bucket named `videos` (or match your `SUPABASE_BUCKET` env var)
   - Make it **public** so videos can be accessed via URL
   - Configure CORS if needed

4. **Get API Keys**:
   - Project Settings → API
   - Copy `URL` → `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_URL`
   - Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_KEY`
   - Copy `service_role` key → `SERVICE_ROLE_KEY`

### Google Cloud Setup

1. **Create a Google Cloud Project**
2. **Enable Generative AI API**
3. **Create API Key**:
   - Go to APIs & Services → Credentials
   - Create API Key
   - Copy to `GENAI_API_KEY`

### Docker Setup (for Manim)

The backend uses Docker to run Manim in an isolated environment. Ensure Docker is running:

```bash
# Build the Manim Docker image (if not already built)
docker build -t manim-image:latest -f backend/Dockerfile .
```

## 🏃 Running the Application

### Development Mode

#### Start Backend

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8008
```

Backend will be available at `http://localhost:8008`

#### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will be available at `http://localhost:3000`

### Production Build

#### Frontend

```bash
cd frontend
npm run build
npm start
```

#### Backend

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8008
```

## 📡 API Documentation

### Base URL
```
http://localhost:8008
```

### Endpoints

#### Public Endpoints

**POST** `/api/generate-and-render`
- **Description**: Generate Manim code from prompt and render video
- **Auth**: Optional (Bearer token)
- **Request Body**:
  ```json
  {
    "prompt": "Create a rotating 3D cube",
    "scene_class": "GeneratedScene",
    "quality": "low",
    "filename": "script.py",
    "max_retries": 2
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "filename": "script.py",
    "local_path": "/path/to/video.mp4",
    "supabase_url": "https://...",
    "code": "from manim import *\n...",
    "sanitized_code": "...",
    "error": null,
    "logs": {}
  }
  ```

**POST** `/api/generate`
- **Description**: Generate Manim code from prompt (no rendering)
- **Request Body**:
  ```json
  {
    "prompt": "Create a rotating 3D cube"
  }
  ```

**POST** `/api/render`
- **Description**: Render existing Manim code to video
- **Request Body**:
  ```json
  {
    "code": "from manim import *\n...",
    "scene_class": "GeneratedScene",
    "quality": "low",
    "filename": "script.py"
  }
  ```

**POST** `/api/validate`
- **Description**: Validate and sanitize Manim code
- **Request Body**:
  ```json
  {
    "code": "from manim import *\n..."
  }
  ```

#### Protected Endpoints (Require Authentication)

**GET** `/api/me`
- **Description**: Get current user information
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "id": "user-id",
    "email": "user@example.com",
    "role": "authenticated",
    "raw": {...}
  }
  ```

**GET** `/api/admin-only`
- **Description**: Admin-only endpoint (example)
- **Headers**: `Authorization: Bearer <token>`

#### Debug Endpoints

**GET** `/debug/supabase`
- **Description**: Check Supabase configuration
- **Response**: Configuration status

**GET** `/`
- **Description**: Health check
- **Response**: `{"msg": "ok"}`

## 🔐 Authentication Flow

1. **User clicks "Sign in with Google"** on frontend
2. **Redirects to Google OAuth** for authentication
3. **Google redirects back** to `/auth/callback` with code
4. **Frontend exchanges code** for session via Supabase
5. **Access token stored** in session
6. **API requests include** `Authorization: Bearer <token>` header
7. **Backend verifies token** using Supabase JWT verification
8. **User authenticated** and can access protected endpoints

## 🎨 Frontend Features

### Landing Page
- **Hero Section**: Main input field for animation prompts
- **Features Section**: Key features showcase
- **How It Works**: Step-by-step explanation
- **Pricing**: Subscription plans
- **Showcase**: Community projects gallery

### Project Workspace
- **Resizable Sidebar**: Drag to adjust width (280px - 800px)
- **Chat Interface**: Interactive conversation with AI
- **Video Player**: Full-featured video preview
- **Code View**: Toggle between preview and code (coming soon)

### Responsive Design
- Mobile-friendly navigation
- Adaptive layouts
- Touch-friendly controls

## 🛠️ Development

### Code Generation Flow

1. User submits prompt via frontend
2. Frontend calls `/api/generate-and-render` with prompt
3. Backend uses Google Generative AI to generate Manim code
4. Code is validated and sanitized for security
5. Code is executed in Docker container with Manim
6. Video is rendered and uploaded to Supabase Storage
7. Public URL is returned to frontend
8. Frontend displays video in project workspace

### Security Features

- **Code Sanitization**: Removes dangerous imports and functions
- **Docker Isolation**: Manim runs in isolated container
- **JWT Verification**: Secure token-based authentication
- **CORS Protection**: Configured for specific origins

### Adding New Features

#### Frontend
- Components in `components/` directory
- Pages in `src/app/` directory
- Context providers in `src/contexts/`
- Utilities in `src/lib/`

#### Backend
- Routes in `routes/` directory
- Controllers in `controllers/` directory
- Middleware in `middlewares/` directory
- Models in `models/` directory

## 🐛 Troubleshooting

### Common Issues

**"Failed to fetch" error**
- Check if backend is running on port 8008
- Verify CORS configuration in `backend/main.py`
- Check network tab in browser dev tools

**"Bucket not found" error**
- Ensure Supabase bucket named `videos` exists
- Make sure bucket is set to **public**
- Verify `SUPABASE_BUCKET` environment variable

**Video not loading**
- Check Supabase bucket CORS settings
- Verify video URL is accessible
- Check browser console for errors

**Authentication not working**
- Verify Supabase environment variables
- Check Google OAuth redirect URL matches
- Ensure callback route is accessible

**Docker errors**
- Ensure Docker is running
- Check Manim Docker image is built
- Verify Docker has necessary permissions

## 📝 License

[Add your license here]

## 🤝 Contributing

[Add contribution guidelines here]

## 📧 Contact

[Add contact information here]

---

Built with ❤️ using Next.js, FastAPI, Manim, and Supabase

