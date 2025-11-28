# Viso - Random Video Chat

A modern, Omegle-like random video chat application with real-time WebRTC video/audio and text chat.

## Features

- 🎥 Real-time peer-to-peer video chat using WebRTC
- 💬 Instant text messaging
- 🔀 Random user matching
- 🎯 Interest-based matching (optional)
- 🔇 Mute/unmute audio
- 📹 Toggle video on/off
- ⏭️ Skip to next stranger
- 🚫 Report inappropriate behavior
- 📱 Responsive design (mobile & desktop)

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express, WebSocket (ws)
- **Real-Time**: WebRTC for peer-to-peer connections
- **Signaling**: WebSocket server for WebRTC signaling

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Modern web browser with WebRTC support

## Setup Instructions

### 1. Install Dependencies

**Client:**
```bash
npm install
```

**Server:**
```bash
cd server
npm install
cd ..
```

### 2. Configure Environment Variables

Copy the example environment file and update it:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_SIGNALING_SERVER_URL=ws://localhost:3001
VITE_STUN_SERVER=stun:stun.l.google.com:19302
GEMINI_API_KEY=your_api_key_here
```

### 3. Run the Application

You need to run **both** the signaling server and the client:

**Terminal 1 - Start the Signaling Server:**
```bash
npm run server
```

**Terminal 2 - Start the Client:**
```bash
npm run dev
```

The signaling server will run on `http://localhost:3001`
The client will run on `http://localhost:5173` (or next available port)

### 4. Test the Application

To test the video chat functionality:

1. Open the app in two different browser windows (or use incognito mode)
2. Grant camera/microphone permissions in both windows
3. Both users should automatically match and connect
4. You should see both video streams and be able to chat

## How It Works

### Architecture

```
User A Browser          Signaling Server         User B Browser
     |                        |                        |
     |----WebSocket Connect-->|<--WebSocket Connect----|
     |                        |                        |
     |--Start Search--------->|                        |
     |                        |<------Start Search-----|
     |                        |                        |
     |<---Match Found---------|----Match Found-------->|
     |                        |                        |
     |--WebRTC Offer--------->|----WebRTC Offer------->|
     |<--WebRTC Answer--------|<---WebRTC Answer-------|
     |                        |                        |
     |<====== Direct P2P Video/Audio Connection ======>|
     |                        |                        |
     |--Chat Message--------->|----Chat Message------->|
```

### Components

1. **Signaling Server** (`server/index.js`):
   - Manages user connections via WebSocket
   - Maintains waiting queue for matching
   - Relays WebRTC signaling messages (offer, answer, ICE candidates)
   - Relays chat messages between peers

2. **WebRTC Service** (`services/webrtc.ts`):
   - Manages RTCPeerConnection
   - Handles offer/answer exchange
   - Collects and exchanges ICE candidates
   - Manages local and remote media streams

3. **Socket Service** (`services/socketService.ts`):
   - WebSocket client for signaling
   - Integrates with WebRTC service
   - Emits events for UI updates

4. **ChatRoom Component** (`pages/ChatRoom.tsx`):
   - Main UI for video chat
   - Manages local and remote streams
   - Handles user interactions (mute, video toggle, skip)

## Deployment

### Deploying the Signaling Server

The signaling server needs to be deployed to a hosting service. Options include:

- **Railway**: Easy deployment with WebSocket support
- **Render**: Free tier available
- **Heroku**: Requires paid dyno for WebSocket
- **DigitalOcean**: VPS with full control
- **AWS EC2**: Scalable cloud hosting

**Important**: Update `VITE_SIGNALING_SERVER_URL` in `.env.local` to point to your deployed server URL (use `wss://` for secure WebSocket).

### Deploying the Client

The client can be deployed to:

- **Vercel**: `npm run build` then deploy
- **Netlify**: Automatic deployment from Git
- **GitHub Pages**: Static hosting
- **Cloudflare Pages**: Fast global CDN

## STUN/TURN Servers

The app uses Google's free STUN servers by default for NAT traversal. For production use with users behind strict firewalls, consider adding TURN servers:

- **Twilio**: Offers TURN server service
- **Metered**: Affordable TURN servers
- **Self-hosted**: coturn server

Update the STUN/TURN configuration in `services/webrtc.ts`.

## Security Considerations

⚠️ **Important for Production**:

- Implement user authentication
- Add rate limiting to prevent abuse
- Use HTTPS/WSS (secure WebSocket)
- Implement content moderation
- Add CAPTCHA to prevent bots
- Set up logging and monitoring
- Implement user reporting system
- Add age verification if required

## Troubleshooting

### Video not showing
- Check camera/microphone permissions
- Ensure HTTPS is used (required for getUserMedia in production)
- Check browser console for errors

### Connection fails
- Verify signaling server is running
- Check WebSocket URL in `.env.local`
- Ensure firewall allows WebSocket connections
- Try different STUN servers if behind strict NAT

### No match found
- Ensure at least 2 users are searching
- Check server logs for errors
- Verify both users are in the same mode (video/text)

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
