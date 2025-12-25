# HEYPICO.AI - TEST 🤖🗺️

A comprehensive full-stack AI-powered location assistant application built with Elysia (Bun) backend and Next.js frontend, featuring intelligent place search using Google Maps API and LLM integration (OpenAI/Ollama).

## 📁 Project Structure

```
├── apps/
│   ├── api/                    # Elysia (Bun) backend service
│   │   ├── src/
│   │   │   ├── routes/         # API route controllers
│   │   │   │   ├── chat.routes.ts    # AI chat with streaming
│   │   │   │   └── photos.routes.ts  # Photo proxy endpoints
│   │   │   ├── services/       # Business logic services
│   │   │   │   └── places.service.ts # Google Places API integration
│   │   │   ├── models/         # Zod schemas and types
│   │   │   ├── utils/          # Utility functions (rate limiter)
│   │   │   ├── app.ts          # Elysia application setup
│   │   │   ├── env.ts          # Environment configuration
│   │   │   └── index.ts        # Server entry point
│   │   └── package.json
│   └── web/                    # Next.js frontend application
│       ├── src/
│       │   ├── app/            # Next.js App Router pages
│       │   ├── components/     # React components
│       │   │   ├── ChatInterface.tsx   # Main chat UI
│       │   │   ├── ChatMessages.tsx    # Message rendering
│       │   │   ├── ChatInput.tsx       # User input component
│       │   │   ├── MapCanvas.tsx       # Google Maps integration
│       │   │   ├── PlaceCarousel.tsx   # Place cards display
│       │   │   └── ThemeToggle.tsx     # Dark/light mode toggle
│       │   ├── types/          # TypeScript type definitions
│       │   └── env.ts          # Frontend environment config
│       └── package.json
└── packages/
    ├── eslint-config/          # Shared ESLint configurations
    ├── typescript-config/      # Shared TypeScript configs
    └── ui/                     # Shared UI component library
```

## 🚀 Features Overview

### Core Features Implemented

✅ **AI Chat Interface**
- Interactive chat UI with streaming responses
- Markdown support for rich text responses
- Real-time AI responses using Vercel AI SDK
- Loading states and error handling
- Clear chat functionality

✅ **Intelligent Location Search**
- Natural language processing for location queries
- Google Places API integration for place discovery
- Smart intent detection to determine when location search is needed
- AI-powered tool calling for seamless place recommendations

✅ **Interactive Maps Integration**
- Embedded Google Maps with multiple location markers
- Place details display (name, address, reviews, open status)
- Photo gallery for each place via secure proxy
- Responsive map container with modern UI

✅ **Rate Limiting & Security**
- IP-based rate limiting with X-Forwarded-For support
- Separate rate limits for chat and Google Places API
- CORS protection with configurable origins
- Secure photo proxy (API keys never exposed to client)

✅ **Modern UI/UX**
- Clean, responsive design
- Dark/light theme support with system preference detection
- Mobile-friendly interface
- Intuitive chat bubbles with user/AI distinction

## 🎯 Requirements Achievement

This project successfully meets all the specified requirements:

### ✅ Local/Cloud LLM Integration (OpenAI Compatible API)
- **Flexible LLM Configuration**: Supports both local and cloud LLM providers
- **Cloud Setup**: OpenAI integration (gpt-4o-mini by default)
- **Local Setup**: Ollama integration (llama3.2 by default)
- **Easy Toggle**: Switch between providers via `LLM_PROVIDER` env variable

### ✅ Google Maps Integration
- **Places API**: Text search for finding places based on natural language queries
- **Embedded Maps**: Interactive maps showing search results with markers
- **Place Details**: Rich information display with photos, reviews, and open status
- **Photo Proxy**: Secure backend proxy to serve place photos without exposing API keys

### ✅ Backend API with Best Practices
- **Elysia Framework**: Modern, fast, and type-safe API with Bun runtime
- **Rate Limiting**: Multi-layered rate limiting (global + per-endpoint)
- **Input Validation**: Zod schemas for request/response validation
- **Error Handling**: Comprehensive error responses with proper HTTP status codes
- **API Documentation**: Auto-generated Swagger/OpenAPI docs at `/swagger`

### ✅ Frontend User Interface
- **Next.js 15 + React 19**: Modern, type-safe frontend development
- **Vercel AI SDK**: Seamless streaming chat integration
- **Google Maps**: Interactive maps with `@vis.gl/react-google-maps`
- **Responsive Design**: Works across desktop and mobile devices

## 🧠 LLM Configuration

### Cloud LLM (Default Setup)

The project is configured to use **Cloud LLM (OpenAI)** by default:

```env
# Cloud LLM Configuration (Default)
LLM_PROVIDER=cloud
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
```

### Local LLM (Ollama)

Local LLM setup using Ollama:

```env
# Local LLM Configuration
LLM_PROVIDER=local
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

**Prerequisites for Local LLM:**
1. Install Ollama: https://ollama.ai
2. Pull a model: `ollama pull llama3.2`
3. Ensure Ollama is running: `ollama serve`

## 🛡️ Rate Limiting & Security

### Rate Limiting Implementation

Implemented comprehensive rate limiting to ensure API stability:

```typescript
// Global rate limit: 100 requests per minute per IP
rateLimit({
  duration: 60000,
  max: 100,
  generator: (request, server) => {
    const forwardedFor = request.headers.get("X-Forwarded-For");
    if (forwardedFor) return forwardedFor.split(",")[0].trim();
    return server?.requestIP(request)?.address ?? "";
  }
})

// Chat endpoint: Configurable via CHAT_RATE_LIMIT (default: 10/min)
// Places API: Configurable via GOOGLE_PLACES_RATE_LIMIT (default: 100/min)
```

**Features:**
- ⏱️ IP-based rate limiting with X-Forwarded-For support for proxies
- 🔄 Sliding window algorithm for request tracking
- 📊 Separate rate limits for different endpoints
- ⚠️ Graceful error responses when limits exceeded
- 💾 In-memory storage for rate limit data

**Limitations:**
- ⚠️ Rate limiter uses in-memory storage only (no database integration)
- 🔄 Rate limit data is reset when server restarts
- 📊 Not suitable for distributed/multi-instance deployments
- 💡 Designed for demonstration or single-instance production only

### Security Measures

**Photo Proxy:**
- 🔐 Backend proxy for Google Places photos
- 🔒 API keys never exposed to client-side code
- 📸 Proper content-type and caching headers

**Additional Security:**
- 🌐 CORS protection with configurable origins
- 🛡️ Input validation and sanitization via Zod
- 🚫 No sensitive data logging
- 🔒 Environment-based configuration management

## 🎨 Frontend UI Features

### Chat Interface
- **Modern Design**: Clean chat bubbles with user/AI distinction
- **Streaming Responses**: Real-time AI response streaming
- **Rich Text**: Markdown rendering for formatted responses
- **Interactive Elements**: Buttons, loading states, and animations

### Map Integration
- **Embedded Maps**: Google Maps with interactive markers
- **Multiple Markers**: Display multiple locations simultaneously
- **Place Cards**: Rich information display with photos
- **Responsive Layout**: Adapts to different screen sizes

### User Experience
- **Real-time Updates**: Instant message delivery and streaming responses
- **Error Handling**: User-friendly error messages
- **Loading States**: Visual feedback during API calls
- **Theme Support**: Dark/light mode with system preference detection

## 🚀 Quick Start

### Prerequisites

- Bun 1.2+ (or Node.js 18+)
- Google Maps API key (with Places API enabled)
- OpenAI API key (for cloud LLM) OR Ollama (for local LLM)

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd heypico
   ```

2. **Set up API environment variables**
   ```bash
   cp apps/api/env.example apps/api/.env
   ```

   Edit `apps/api/.env` with your configuration:
   ```env
   # LLM Provider: "cloud" or "local"
   LLM_PROVIDER=cloud

   # Cloud (OpenAI) - required when LLM_PROVIDER=cloud
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_MODEL=gpt-4o-mini

   # Local (Ollama) - used when LLM_PROVIDER=local
   # OLLAMA_BASE_URL=http://localhost:11434
   # OLLAMA_MODEL=llama3.2

   # Google Places API (required)
   GOOGLE_PLACES_API_KEY=your_google_places_api_key

   # App Config
   FRONTEND_URL=http://localhost:3000
   PORT=3001
   ```

3. **Set up Web environment variables**
   ```bash
   cp apps/web/.env.local.example apps/web/.env.local
   ```

   Edit `apps/web/.env.local`:
   ```env
   # Google Maps API Key for displaying maps
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

   # Backend API URL
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

### Development Mode

```bash
# Install dependencies
bun install

# Start all services (API + Web)
bun dev
```

**Services will be available at:**
- 🌐 Frontend: `http://localhost:3000`
- 🔧 Backend: `http://localhost:3001`
- 📚 API Docs: `http://localhost:3001/swagger`

### Individual Service Development

**Backend Only:**
```bash
cd apps/api
bun run dev
```

**Frontend Only:**
```bash
cd apps/web
bun run dev
```

## 📖 API Documentation

Once the backend is running, comprehensive API documentation is available at:

- **Swagger UI**: `http://localhost:3001/swagger`

### Main Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Welcome message |
| `/health` | GET | Health check endpoint |
| `/chat` | POST | AI chat with streaming response |
| `/photos/:photoName` | GET | Photo proxy for Google Places photos |

### Chat Endpoint

**Request:**
```bash
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Find me good restaurants in Jakarta"}
    ]
  }'
```

**Response:** Streaming response with AI-generated text and optional place recommendations.

## 🧪 Testing

### Backend Testing
```bash
cd apps/api
bun test
```

### Frontend Testing
```bash
cd apps/web
bun run lint
bun run check-types
```

## 🚀 Production Build

### Build All Services
```bash
bun run build
```

### Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `LLM_PROVIDER` | LLM provider: "cloud" or "local" | No | `cloud` |
| `OPENAI_API_KEY` | OpenAI API Key | Yes* | - |
| `OPENAI_MODEL` | OpenAI model name | No | `gpt-4o-mini` |
| `OLLAMA_BASE_URL` | Ollama server URL | No | `http://localhost:11434` |
| `OLLAMA_MODEL` | Ollama model name | No | `llama3.2` |
| `GOOGLE_PLACES_API_KEY` | Google Places API Key | Yes | - |
| `FRONTEND_URL` | Frontend URL for CORS | No | `http://localhost:3000` |
| `PORT` | Backend server port | No | `3001` |
| `CHAT_RATE_LIMIT` | Chat requests per minute | No | `10` |
| `GOOGLE_PLACES_RATE_LIMIT` | Places API requests per minute | No | `100` |

*Required when `LLM_PROVIDER=cloud`

## 🔧 Troubleshooting

### Common Issues

1. **LLM Connection Issues**
   - Verify API keys are correct
   - For local LLM, ensure Ollama is running: `ollama serve`
   - Check model is available: `ollama list`

2. **Google Maps Not Loading**
   - Verify API keys have proper permissions
   - Check API quotas in Google Cloud Console
   - Ensure Maps JavaScript API and Places API are enabled

3. **Rate Limiting Errors**
   - Wait for rate limit window to reset (1 minute)
   - Adjust rate limits in environment configuration
   - Check if rate limits are applied correctly

4. **CORS Errors**
   - Verify `FRONTEND_URL` matches your frontend origin
   - Check if backend is running on correct port

### Development Tips

- 📊 Backend auto-reloads on code changes (Bun watch mode)
- ⚡ Frontend supports hot module replacement (Turbopack)
- 📚 API documentation is automatically generated from Elysia schemas
- 🤖 Test local LLM via Ollama CLI before integrating

---

**Built with ❤️ using Elysia, Next.js, and modern web technologies**
