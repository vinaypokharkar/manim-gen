# CodeMotion - AI-Powered Manim Animation Generator

CodeMotion is a full-stack web application that allows users to create mathematical animations and data visualizations using natural language. Simply describe what you want to see, and CodeMotion generates Manim Python code, renders it into high-quality videos, and displays them in an interactive interface.

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

## 🚀 Deployment

### Frontend Deployment (Next.js)

#### Option 1: Vercel (Recommended)

Vercel is the recommended platform for Next.js applications:

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your Git repository
   - Set root directory to `frontend`
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_API_URL` (your backend URL)
   - Click "Deploy"

3. **Deploy via CLI**:
   ```bash
   cd frontend
   vercel
   ```

4. **Update Supabase Redirect URL**:
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your Vercel domain to "Redirect URLs": `https://your-app.vercel.app/auth/callback`

#### Option 2: Netlify

1. **Build Configuration** (`netlify.toml` in `frontend/`):
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy**:
   - Connect repository to Netlify
   - Set build directory to `frontend`
   - Add environment variables
   - Deploy

#### Option 3: Self-Hosted (VPS/Server)

1. **Build the application**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Start production server**:
   ```bash
   npm start
   ```

3. **Use PM2 for process management**:
   ```bash
   npm install -g pm2
   pm2 start npm --name "CodeMotion-frontend" -- start
   pm2 save
   pm2 startup
   ```

4. **Set up Nginx reverse proxy**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Backend Deployment (FastAPI)

#### Option 1: Railway (Recommended for Docker)

Railway supports Docker and is great for FastAPI apps:

1. **Create `railway.json`** in `backend/`:
   ```json
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": {
       "builder": "DOCKERFILE",
       "dockerfilePath": "Dockerfile"
     },
     "deploy": {
       "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

2. **Deploy**:
   - Go to [railway.app](https://railway.app)
   - New Project → Deploy from GitHub
   - Select your repository
   - Set root directory to `backend`
   - Add environment variables
   - Deploy

#### Option 2: Render

1. **Create `render.yaml`** in root:
   ```yaml
   services:
     - type: web
       name: CodeMotion-backend
       env: python
       buildCommand: pip install -r requirements.txt
       startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
       envVars:
         - key: SUPABASE_URL
           sync: false
         - key: SUPABASE_KEY
           sync: false
         - key: SERVICE_ROLE_KEY
           sync: false
         - key: GENAI_API_KEY
           sync: false
   ```

2. **Deploy**:
   - Connect GitHub repository
   - Create new Web Service
   - Set root directory to `backend`
   - Add environment variables
   - Deploy

#### Option 3: AWS EC2 / DigitalOcean / Linode

1. **SSH into your server**

2. **Install dependencies**:
   ```bash
   sudo apt update
   sudo apt install python3-pip python3-venv nginx
   ```

3. **Clone and setup**:
   ```bash
   git clone <your-repo>
   cd new-test/backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. **Use Gunicorn for production**:
   ```bash
   pip install gunicorn
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8008
   ```

5. **Set up systemd service** (`/etc/systemd/system/CodeMotion-backend.service`):
   ```ini
   [Unit]
   Description=CodeMotion Backend
   After=network.target

   [Service]
   User=www-data
   WorkingDirectory=/path/to/backend
   Environment="PATH=/path/to/backend/venv/bin"
   ExecStart=/path/to/backend/venv/bin/gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8008

   [Install]
   WantedBy=multi-user.target
   ```

6. **Start service**:
   ```bash
   sudo systemctl start CodeMotion-backend
   sudo systemctl enable CodeMotion-backend
   ```

7. **Nginx configuration**:
   ```nginx
   server {
       listen 80;
       server_name api.your-domain.com;

       location / {
           proxy_pass http://127.0.0.1:8008;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

#### Option 4: Docker Deployment

1. **Create `docker-compose.yml`** in root:
   ```yaml
   version: '3.8'
   
   services:
     backend:
       build:
         context: ./backend
         dockerfile: Dockerfile
       ports:
         - "8008:8008"
       environment:
         - SUPABASE_URL=${SUPABASE_URL}
         - SUPABASE_KEY=${SUPABASE_KEY}
         - SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}
         - GENAI_API_KEY=${GENAI_API_KEY}
         - SUPABASE_BUCKET=${SUPABASE_BUCKET}
       volumes:
         - ./backend/generated_videos:/app/generated_videos
       restart: unless-stopped
   
     frontend:
       build:
         context: ./frontend
         dockerfile: Dockerfile
       ports:
         - "3000:3000"
       environment:
         - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
         - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
         - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
       depends_on:
         - backend
       restart: unless-stopped
   ```

2. **Deploy**:
   ```bash
   docker-compose up -d
   ```

### Docker Setup for Backend

Create `Dockerfile` in `backend/` if not exists:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    docker.io \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8008

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8008"]
```

### Docker Setup for Frontend

Create `Dockerfile` in `frontend/`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

Update `next.config.ts`:

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
}

module.exports = nextConfig
```

### Environment Variables for Production

#### Frontend Production Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

#### Backend Production Variables

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key
SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_BUCKET=videos
GENAI_API_KEY=your_genai_key
```

### Post-Deployment Checklist

- [ ] Update Supabase redirect URLs with production domain
- [ ] Verify CORS settings in backend allow production frontend URL
- [ ] Test authentication flow end-to-end
- [ ] Verify video uploads to Supabase Storage
- [ ] Check API endpoints are accessible
- [ ] Set up SSL/HTTPS certificates (Let's Encrypt)
- [ ] Configure domain DNS records
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Test error handling and fallbacks

### Production Optimizations

#### Frontend
- Enable Next.js Image Optimization
- Configure CDN for static assets
- Enable compression
- Set up caching headers
- Use environment-specific builds

#### Backend
- Use production ASGI server (Gunicorn + Uvicorn)
- Configure proper logging
- Set up health check endpoints
- Implement rate limiting
- Use connection pooling for databases
- Configure proper CORS for production domains

### Monitoring & Logging

#### Recommended Tools
- **Frontend**: Vercel Analytics, Sentry
- **Backend**: Logtail, Datadog, or CloudWatch
- **Uptime**: UptimeRobot, Pingdom

### SSL/HTTPS Setup

#### Using Let's Encrypt (Certbot)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d api.your-domain.com
```

#### Using Cloudflare
- Add domain to Cloudflare
- Enable SSL/TLS encryption
- Configure DNS records

---

Built with ❤️ using Next.js, FastAPI, Manim, and Supabase


Test
