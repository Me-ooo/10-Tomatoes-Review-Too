# 10 Tomatoes Review Too

Smart Movie Review Community and Recommendation Platform — university project for Advanced Database Systems.

## Tech stack

- **Backend:** Node.js, Express
- **Primary DB:** MongoDB (Mongoose) for users, movies, and reviews
- **Search:** MongoDB Atlas Vector Search (embeddings on movies)
- **Cache:** Redis for high-traffic routes such as trending movies

## Backend layout (Phase 1)

```
backend/
  package.json
  .env.example
  src/
    server.js                 # process entry: connect MongoDB + Redis, listen
    app.js                    # Express app and health/trending stubs
    config/
      database.js             # Mongoose connection
      redis.js                # ioredis client
      atlas-vector-index.example.json
    models/
      User.js
      Movie.js                # includes embedding: [Number]
      Review.js
    middleware/
      cache.js                # Redis-first GET cache
    controllers/              # Phase 2
    routes/                   # Phase 2
```

## Quick start

1. Copy `backend/.env.example` to `backend/.env` and fill in MongoDB Atlas and Redis URLs.
2. `cd backend && npm install`
3. Create an Atlas Vector Search index on `movies.embedding` using `src/config/atlas-vector-index.example.json` (1536 dims for OpenAI `text-embedding-3-small`).
4. `npm run dev`
