# SocialBridge MERN Stack

A powerful social media distribution platform built with MongoDB, Express, React, and Node.js.

## Structure

- `/client`: React (Vite) frontend with a premium dark-mode UI.
- `/server`: Node.js Express API with Mongoose and BullMQ.

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (running locally or a Cloud URI)
- Redis (for background job processing)

### Installation

1. Install dependencies:
   ```bash
   npm run install-all
   ```

2. Set up environment variables:
   - Copy `server/.env.example` to `server/.env` and fill in your values.
   - Copy `client/.env.example` to `client/.env`.

3. Start the development environment:
   ```bash
   npm run dev
   ```

## Features

- **Smart Video Routing**: Automatically determines the best platforms (TikTok, Reels, Shorts) based on aspect ratio and duration.
- **Universal API**: A single endpoint for all social media posting needs.
- **Async Processing**: BullMQ and Redis handle high-volume background tasks reliably.
- **Premium UI**: Modern dark-mode aesthetic with glassmorphism.
