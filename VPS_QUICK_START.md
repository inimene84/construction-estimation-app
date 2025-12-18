# ⚡ VPS Quick Start (5-Minute Version)

## TL;DR - Get Running Fast

Your Hostinger VPS IP: **72.60.18.113**

---

## 🎯 Super Quick Version (10 Commands)

```bash
# 1. SSH in
ssh root@72.60.18.113

# 2. Clone app
cd ~ && git clone https://github.com/inimene84/construction-estimation-app.git && cd construction-estimation-app

# 3. Setup backend .env
cat > .env << 'EOF'
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://user:password@db:5432/construction_app
REDIS_HOST=redis
QDRANT_URL=http://qdrant:6333
CORS_ORIGIN=http://72.60.18.113:8888
EOF

# 4. Setup frontend .env
cat > frontend/.env << 'EOF'
REACT_APP_API_URL=http://72.60.18.113:3001/api/v1
EOF

# 5. Install dependencies
npm install && cd frontend && npm install && cd ..

# 6. Start containers
docker-compose up -d

# 7. Wait 30 seconds
sleep 30

# 8. Initialize database
docker exec -it construction-db psql -U user -d construction_app -c "CREATE TABLE IF NOT EXISTS estimations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), query TEXT, language VARCHAR, country VARCHAR, results JSONB, created_at TIMESTAMP DEFAULT NOW());"

# 9. Check status
docker-compose ps

# 10. Done!
echo "UI: http://72.60.18.113:8888"
echo "API: http://72.60.18.113:3001"
```

**Total time: ~5 minutes** ✅

---

## 🌐 Then Access

**In your browser:**

```
http://72.60.18.113:8888
```

**You should see:** 
- Construction Estimator UI ✅
- 3 language buttons (ET/EN/DE) ✅
- Search, Estimate, History tabs ✅

---

## 📱 Verify It Works

### Test 1: Open UI
```
http://72.60.18.113:8888
```
Should load the app ✅

### Test 2: Try a search
```
Language: English
Query: "brick wall"
Country: Estonia
→ Click Search
```
Should show results ✅

### Test 3: Create estimate
```
Select items from search
→ Click Estimate
```
Should generate cost estimate ✅

---

## 🔍 If Something Breaks

### Check what's wrong:
```bash
# See all logs
docker-compose logs

# Specific service
docker-compose logs construction-api

# Real-time logs
docker-compose logs -f construction-ui
```

### Fix it:
```bash
# Restart everything
docker-compose restart

# Restart specific service
docker-compose restart construction-api

# Full reset (starts over)
docker-compose down -v
docker-compose up -d
```

---

## 📊 Access All Services

| Service | URL | Purpose |
|---------|-----|---------||
| **UI** | http://72.60.18.113:8888 | Your app |
| **API** | http://72.60.18.113:3001 | Backend |
| **n8n** | http://72.60.18.113:5678 | Workflows |
| **Qdrant** | http://72.60.18.113:6333 | Vector DB |
| **Database** | localhost:5432 | PostgreSQL |

---

**Your app is ready! 🚀 Follow the 10 commands above and you're done.**