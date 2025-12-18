# 🚀 VPS Setup: Download & Deploy Construction Estimator

## Complete Step-by-Step Guide for Hostinger VPS

Your Hostinger VPS (72.60.18.113) - Estonia

---

## ✅ Prerequisites Check

Before starting, verify your VPS has:

```bash
# SSH into your VPS
ssh root@72.60.18.113

# Check Docker
docker --version          # Should show Docker version

# Check Docker Compose
docker-compose --version  # Should show version

# Check Node.js
node --version           # Should show v18+

# Check Git
git --version            # Should show git version
```

If any are missing, install them first.

---

## 🎯 Step 1: SSH Into VPS

```bash
# From your computer
ssh root@72.60.18.113

# Or with key file
ssh -i your-key.pem root@72.60.18.113
```

---

## 📥 Step 2: Clone the Repository

```bash
# Navigate to home directory
cd ~

# Clone the app
git clone https://github.com/inimene84/construction-estimation-app.git

# Enter the directory
cd construction-estimation-app

# Check what's there
ls -la
```

You should see:
- README.md
- DEPLOYMENT_GUIDE.md
- FRONTEND_SETUP.md
- src/ (backend code)
- frontend/ (React UI)
- docker-compose.yml
- .env files

---

## 🔧 Step 3: Create .env Configuration Files

### Create backend .env

```bash
# Navigate to root of project
cd ~/construction-estimation-app

# Create .env file
nano .env
```

Paste this content:

```
# Backend API
PORT=3000
NODE_ENV=production

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@db:5432/construction_app
DB_HOST=db
DB_PORT=5432
DB_NAME=construction_app
DB_USER=user
DB_PASSWORD=password123

# Cache (Redis)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis123

# Vector Search (Qdrant)
QDRANT_URL=http://qdrant:6333
QDRANT_API_KEY=your_api_key

# Frontend URL
FRONTEND_URL=http://72.60.18.113:8888

# CORS
CORS_ORIGIN=http://72.60.18.113:8888

# API Keys
OPENAI_API_KEY=your_key_here
GOOGLE_CLOUD_API_KEY=your_key_here
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

### Create frontend .env

```bash
# Inside frontend directory
cd frontend

# Create .env file
nano .env
```

Paste:

```
REACT_APP_API_URL=http://72.60.18.113:3001/api/v1
REACT_APP_PORT=8888
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

---

## 🚀 Step 4: Install Dependencies

```bash
# Go to project root
cd ~/construction-estimation-app

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

This takes 2-3 minutes. Wait for completion.

---

## 🐳 Step 5: Start Docker Containers

```bash
# Make sure you're in project root
cd ~/construction-estimation-app

# Build and start all containers
docker-compose up -d

# Verify containers are running
docker-compose ps
```

You should see:
```
NAME                    STATUS
construction-ui         Up
construction-api        Up
construction-db         Up
construction-redis      Up
construction-qdrant     Up
construction-n8n        Up
```

---

## 📊 Step 6: Initialize Database

```bash
# Create tables
docker exec -it construction-db psql -U user -d construction_app -c "
CREATE TABLE IF NOT EXISTS estimations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR,
  query TEXT,
  language VARCHAR,
  country VARCHAR,
  results JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);
"
```

---

## ✅ Step 7: Verify Everything is Running

### Check UI
```bash
curl http://72.60.18.113:8888
# Should return HTML of React app
```

### Check API
```bash
curl -X POST http://72.60.18.113:3001/api/v1/estimations/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "wall",
    "language": "en",
    "country": "EE"
  }'
# Should return estimation results
```

### Check Database
```bash
docker exec -it construction-db psql -U user -d construction_app -c "SELECT COUNT(*) FROM estimations;"
```

### Check Redis
```bash
docker exec -it construction-redis redis-cli -a redis123 PING
# Should return PONG
```

### Check Qdrant
```bash
curl http://72.60.18.113:6333/collections
# Should show collection info
```

### Check n8n
```bash
# Access in browser: http://72.60.18.113:5678
```

---

## 🌐 Step 8: Access Your App

Open in browser:

```
UI:   http://72.60.18.113:8888    ← Your app here!
API:  http://72.60.18.113:3001    ← Backend API
n8n:  http://72.60.18.113:5678    ← Workflows
```

---

## 📋 Useful Docker Commands

```bash
# View logs for a service
docker-compose logs construction-api
docker-compose logs construction-ui

# View real-time logs
docker-compose logs -f construction-api

# Stop all containers
docker-compose stop

# Start all containers
docker-compose start

# Restart all containers
docker-compose restart

# Remove all containers
docker-compose down

# Remove containers AND volumes (careful!)
docker-compose down -v

# Enter a container's shell
docker exec -it construction-api bash
```

---

## 🔧 Common Issues & Fixes

### Port already in use?
```bash
# Find what's using port 8888
lsof -i :8888

# Kill it
kill -9 <PID>

# Or use different port in docker-compose.yml
```

### Can't connect to API?
```bash
# Check API logs
docker-compose logs construction-api

# Verify API is running
docker-compose ps construction-api
```

### Frontend not loading?
```bash
# Check frontend logs
docker-compose logs construction-ui

# Rebuild frontend
docker-compose down construction-ui
docker-compose up -d construction-ui

# Wait 1 minute for npm start to complete
```

---

## 🎯 Quick Reference: VPS Setup Summary

| Step | Command | Time |
|------|---------|------|
| 1 | SSH into VPS | 1 min |
| 2 | Clone repo | 2 min |
| 3 | Create .env files | 3 min |
| 4 | npm install | 3 min |
| 5 | docker-compose up | 2 min |
| 6 | Init database | 2 min |
| 7 | Verify services | 2 min |
| **Total** | | **~15 min** |

---

**Your app is ready to deploy! 🎉 Follow these steps and you'll have everything running in ~15 minutes.**