VentApp - backend scaffold

Structure created to implement a simple realtime "vent" app using MongoDB + Gin + WebSockets.

Goals:
- Telegram Web (social) auth (store Telegram info in DB, ask user to choose display alias)
- Vents only (no community features): upvote/downvote, threaded replies, save, report, views counter
- Admin page endpoints for moderation (list reported content, moderate)
- Realtime events for post/reply/vote/report via WebSocket hub

Folders:
- models/: Mongo models (User, Vent, Reply, Report)
- repositories/: DB access layer
- controllers/: HTTP handlers
- middleware/: auth and admin guards
- routes/: route registration
- config/: db and app config
- main.go: wiring

This scaffold contains fully-commented templates and TODOs to implement behavior incrementally.
