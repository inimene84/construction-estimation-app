# 🔍 Qdrant Vector Search Guide

## Qdrant Setup for Construction Estimator

Your Qdrant is running at: `http://72.60.18.113:6333`

---

## 📊 Available Collections

After restoring snapshots, you have:

```
Collection Name          Purpose                    Status
────────────────────────────────────────────────────────
ddc_cwicr_en            English items             ✅ Ready
ddc_cwicr_de            German items              ✅ Ready
```

---

## 🔗 API Endpoint

```
http://qdrant:6333/collections/ddc_cwicr_en/points/search
```

This searches within the English collection. ✅

---

## 🧪 Test Queries

### 1. List Collections

```bash
curl http://72.60.18.113:6333/collections
```

### 2. Get Collection Info

```bash
curl http://72.60.18.113:6333/collections/ddc_cwicr_en
```

**Response:**
```json
{
  "result": {
    "name": "ddc_cwicr_en",
    "status": "green",
    "vectors_count": 55000,
    "points_count": 55000,
    "config": {
      "params": {
        "vectors": {
          "size": 384,
          "distance": "Cosine"
        }
      }
    }
  },
  "status": "ok"
}
```

### 3. Search via API

```bash
curl -X POST http://72.60.18.113:3001/api/v1/estimations/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "brick wall",
    "language": "en",
    "country": "EE"
  }'
```

---

## 🚀 How It Works

```
1. User enters search query
   "I need a brick wall"
   
2. API receives request
   POST /api/v1/estimations/search
   
3. Generate embedding (384 dimensions)
   Using Google's text-embedding model
   
4. Send to Qdrant
   POST /collections/ddc_cwicr_en/points/search
   
5. Qdrant returns similar items
   [
     {id: 123, score: 0.95, payload: {...}},
     {id: 124, score: 0.92, payload: {...}},
     ...
   ]
   
6. API processes results
   - Format response
   - Add more details
   - Calculate totals
   
7. Return to UI
   User sees matching items with costs
```

---

## 📝 Payload Structure

Each point in Qdrant contains:

```json
{
  "id": 12345,
  "score": 0.95,
  "payload": {
    "item_id": 12345,
    "description": "Brick wall construction",
    "description_et": "Tellistest müüri ehitus",
    "description_de": "Ziegelmauerkonstruktion",
    "category": "Masonry",
    "subcategory": "Walls",
    "labor_hours": 8.5,
    "labor_hours_min": 7.0,
    "labor_hours_max": 10.0,
    "estimated_cost": 450.00,
    "unit": "m2",
    "country": "EE",
    "supplier": "DDC Database",
    "tags": ["masonry", "construction", "wall"],
    "phase": "Structure",
    "created_at": "2024-01-15",
    "updated_at": "2024-12-15"
  }
}
```

---

## ✅ Verification

```bash
# Check Qdrant is running
curl http://72.60.18.113:6333/health
# Should return: {"status":"ok"}

# List collections
curl http://72.60.18.113:6333/collections
# Should show: ddc_cwicr_en, ddc_cwicr_de

# Get collection stats
curl http://72.60.18.113:6333/collections/ddc_cwicr_en/stats
```

---

## 📊 Your Collections

| Collection | Items | Dimension | Language |
|-----------|-------|-----------|----------|
| ddc_cwicr_en | ~55,000 | 384 | 🇬🇧 English |
| ddc_cwicr_de | ~55,000 | 384 | 🇩🇪 German |

---

## 🚨 Common Issues

### Issue 1: Connection Refused
```
Error: Cannot connect to http://72.60.18.113:6333

Fix:
1. Check Qdrant container is running
   docker-compose ps qdrant
   
2. Check port 6333 is open
   curl http://72.60.18.113:6333/health
   
3. Restart Qdrant
   docker-compose restart qdrant
```

### Issue 2: Collection Not Found
```
Error: Collection 'ddc_cwicr_en' not found

Fix:
1. List available collections
   curl http://72.60.18.113:6333/collections
   
2. Restore snapshots (if missing)
   See deployment guide
   
3. Restart Qdrant
   docker-compose restart qdrant
```

---

**Your vector search is ready! 🔍 Start searching for construction items!**