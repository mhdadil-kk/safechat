# 📱 How to Test on Your Phone

## The Problem
Browsers require **HTTPS** (secure connection) to access camera and microphone when connecting from a network IP address (like `192.168.x.x` or `172.16.x.x`). This is a security feature.

## Solution: Use HTTPS

The app is now configured to run with HTTPS using a self-signed certificate.

### Step 1: Start the Servers

**Terminal 1 - Signaling Server:**
```bash
cd server
npm start
```

**Terminal 2 - Client (with HTTPS):**
```bash
npm run dev
```

You should see:
```
VITE ready in XXX ms
➜  Local:   https://localhost:3000/
➜  Network: https://192.168.x.x:3000/
```

### Step 2: Access on Your Laptop

1. Open `https://localhost:3000` in your browser
2. You'll see a **security warning** (because it's a self-signed certificate)
3. Click **"Advanced"** → **"Proceed to localhost (unsafe)"**
4. Grant camera/microphone permissions
5. You should see your video!

### Step 3: Access on Your Phone

1. Find your network IP from the Vite output (e.g., `https://192.168.1.100:3000`)
2. On your phone, open the browser and go to that URL
3. You'll see a **security warning**
4. **On Android Chrome**: Click "Advanced" → "Proceed to [IP] (unsafe)"
5. **On iPhone Safari**: Click "Show Details" → "visit this website"
6. Grant camera/microphone permissions when prompted
7. You should see your video!

### Step 4: Test Video Chat

1. Keep both devices on the same page
2. Both should show "Searching..."
3. They should automatically match and connect
4. You'll see both video streams!

## Troubleshooting

### ❌ "Camera/Microphone access denied"

**On Phone:**
- Make sure you're using `https://` not `http://`
- Check browser permissions: Settings → Site Settings → Camera/Microphone
- Try a different browser (Chrome, Firefox, Safari)

**On Laptop:**
- Allow permissions when prompted
- Check browser settings for camera/microphone access

### ❌ "Not secure" or certificate warning

This is **normal** for self-signed certificates. You need to:
1. Click "Advanced" or "Show Details"
2. Click "Proceed anyway" or "Visit this website"
3. This is safe for local development

### ❌ Can't connect from phone

1. Make sure phone and laptop are on the **same WiFi network**
2. Check your laptop's firewall isn't blocking port 3000
3. Use the IP address shown in the Vite output, not `localhost`

### ❌ "Could not connect to server"

Make sure the signaling server is running:
```bash
cd server
npm start
```

Should show:
```
🚀 Signaling server running on port 3001
```

### ❌ Video works on laptop but not phone

1. Verify you're using `https://` on phone
2. Accept the security warning
3. Grant camera permissions
4. Try reloading the page

## Alternative: Use ngrok (No Certificate Warnings)

If you don't want to deal with certificate warnings:

1. Install ngrok: https://ngrok.com/download
2. Run your app normally: `npm run dev`
3. In another terminal: `ngrok http 3000`
4. Use the `https://` URL ngrok provides (e.g., `https://abc123.ngrok.io`)
5. This URL will work on any device without warnings!

## Network IP Addresses

Your laptop might have multiple IPs. Use the one that matches your WiFi network:
- `192.168.x.x` - Common home WiFi
- `10.x.x.x` - Some corporate networks
- `172.16.x.x` - Your current network

**Don't use:**
- `127.0.0.1` or `localhost` - Only works on the same device
- `0.0.0.0` - Not accessible from other devices

## Quick Test Checklist

- [ ] Signaling server running (`npm run server`)
- [ ] Client running with HTTPS (`npm run dev`)
- [ ] Using `https://` URL (not `http://`)
- [ ] Accepted security warning
- [ ] Granted camera/microphone permissions
- [ ] Both devices on same WiFi network
- [ ] Using correct network IP address

## Still Having Issues?

Check the browser console (F12) for error messages and share them for help!
