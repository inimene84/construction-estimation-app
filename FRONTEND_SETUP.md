# Construction Estimator - Frontend Setup

## Quick Start

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── SearchTab.tsx        # Search work items
│   │   ├── EstimateTab.tsx      # Generate estimates
│   │   └── HistoryTab.tsx       # View history
│   ├── styles/
│   │   ├── SearchTab.css
│   │   ├── EstimateTab.css
│   │   └── HistoryTab.css
│   ├── App.tsx                  # Main app component
│   ├── App.css                  # Global styles
│   ├── index.tsx                # React entry point
│   └── index.css                # Base styles
├── public/
│   └── index.html
└── package.json
```

## Component Architecture

### App.tsx (Main)
- Header with logo and project ID selector
- Tab navigation (Search / Estimate / History)
- Tab content rendering
- Footer

### SearchTab.tsx
**Features:**
- Natural language search input
- Language selection (EN/DE)
- Country filter
- Result cards with:
  - Similarity percentage
  - Description
  - Labor hours
  - Estimated cost
  - Category
  - Phase (if available)

**API Endpoint:**
```
POST /api/v1/estimations/search
Body: { query, language, country, topK }
```

### EstimateTab.tsx
**Features:**
- Add multiple construction elements
- Element properties:
  - Name
  - Description
  - Quantity
- Language selection
- Generate estimate button
- Cost breakdown visualization:
  - Labor costs
  - Material costs
  - Equipment costs
  - Total cost
  - By-phase breakdown

**API Endpoint:**
```
POST /api/v1/estimations/from-cad
Body: { projectId, language, country, cadElements }
```

### HistoryTab.tsx
**Features:**
- Load estimation history for project
- Display historical estimates with:
  - Date/time
  - Language
  - Cost breakdown
- View trends over time
- Compare estimates

**API Endpoint:**
```
GET /api/v1/estimations/projects/:projectId
```

## UI/UX Design System

### Colors
```css
--primary: #208c8d        /* Teal - main brand */
--secondary: #f5f5f5      /* Light gray - backgrounds */
--success: #22c55e        /* Green - success states */
--error: #ef4444          /* Red - errors */
--text: #1f2937           /* Dark gray - primary text */
--text-light: #6b7280     /* Light gray - secondary text */
--border: #e5e7eb         /* Very light gray - borders */
```

### Typography
- Font: System sans-serif
- Header: 28px bold
- Titles: 24px semi-bold
- Body: 14px regular
- Labels: 14px medium
- Small text: 13px regular

### Spacing
- Padding: 10px, 15px, 20px, 25px, 30px
- Gap: 10px, 15px, 20px
- Border radius: 6px, 8px

### Components

**Buttons**
- Primary (teal)
- Secondary (gray)
- Disabled state
- Hover effects

**Cards**
- Result cards
- History cards
- Element cards
- Cost summary boxes

**Forms**
- Input fields
- Select dropdowns
- Form groups
- Form rows (2-column)

**Alerts**
- Error messages
- Success messages
- Info messages

## API Integration

### Base URL
```
http://localhost:3000/api/v1
```

### Search Endpoint
```typescript
POST /estimations/search

Request:
{
  query: string;          // Search text
  language: 'en' | 'de';  // EN or DE
  country: string;        // Country code
  topK: number;           // Number of results (default: 5)
}

Response:
{
  success: boolean;
  resultCount: number;
  results: [
    {
      id: number;
      similarity: string;        // "92.3%"
      description: string;
      laborHours: number;
      estimatedCost: number;
      category: string;
      phase?: string;
    }
  ]
}
```

### Estimate Endpoint
```typescript
POST /estimations/from-cad

Request:
{
  projectId: string;
  language: 'en' | 'de';
  country: string;
  cadElements: [
    {
      id: string;
      name: string;
      description: string;
      quantity: number;
    }
  ]
}

Response:
{
  success: boolean;
  estimate: {
    itemCount: number;
    costBreakdown: {
      labor: number;
      materials: number;
      equipment: number;
      total: number;
      byPhase: Record<string, number>;
    }
  }
}
```

### History Endpoint
```typescript
GET /estimations/projects/:projectId

Response:
{
  success: boolean;
  estimationCount: number;
  estimations: [
    {
      id: string;
      projectId: string;
      costBreakdown: CostBreakdown;
      language: string;
      country: string;
      createdAt: string;
    }
  ]
}
```

## Styling Guide

### Animations
- Fade-in: 300ms
- Hover effects: 200ms
- All transitions: ease timing function

### Responsive Design
- Desktop: 1200px max-width
- Tablet: 768px breakpoint
- Mobile: Full width

### Accessibility
- All inputs labeled
- Focus states visible
- High contrast colors
- Semantic HTML
- ARIA attributes where needed

## Development Tips

### Mock API Responses
```typescript
// For development without backend
const mockSearchResults = [
  {
    id: 1,
    similarity: "92.3%",
    description: "Interior wall - plasterboard 13mm",
    laborHours: 0.75,
    estimatedCost: 45.50,
    category: "Walls"
  }
];
```

### Environment Variables
```
REACT_APP_API_URL=http://localhost:3000/api/v1
REACT_APP_ENV=development
```

### Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## Production Deployment

### Build
```bash
npm run build
```

This creates an optimized production build in `build/` directory.

### Docker
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Deploy with Docker Compose
```yaml
services:
  construction-ui:
    image: construction-estimator-ui:latest
    container_name: construction-ui
    ports:
      - "3000:80"
    environment:
      - REACT_APP_API_URL=http://construction-api:3000/api/v1
    networks:
      - construction-platform
    depends_on:
      - construction-api
```

## Browser Support
- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile: iOS Safari, Chrome for Android

## Performance
- Component lazy loading
- Memoization for expensive renders
- Debounced search input
- Cached API responses (when available)

## Known Issues & Solutions

**Issue: CORS errors**
```
Solution: Ensure backend is running and allowing localhost:3000
```

**Issue: Search returns 0 results**
```
Solution: Check Qdrant snapshots are restored and API is healthy
```

**Issue: Slow performance**
```
Solution: Check network latency, enable React DevTools Profiler
```

## Next Steps

1. ✅ Copy all component files from COMPLETE_UI_GUIDE.md
2. ✅ Install dependencies: `npm install`
3. ✅ Configure API URL in .env
4. ✅ Start dev server: `npm start`
5. ✅ Test each tab:
   - Search: Try "interior wall plasterboard"
   - Estimate: Add 2-3 elements
   - History: Load previous estimates
6. ✅ Build for production: `npm run build`
7. ✅ Deploy with Docker

---

**All UI files ready. Copy from COMPLETE_UI_GUIDE.md and deploy! 🚀**
