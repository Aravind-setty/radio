# 🧪 Quick Testing Guide

## Start the Application

### Terminal 1 - Backend
```powershell
cd c:\Users\setty\OneDrive\Desktop\codebase\radio\backend
npm start
```
**Expected:** Server running on http://localhost:3000

### Terminal 2 - Frontend
```powershell
cd c:\Users\setty\OneDrive\Desktop\codebase\radio\frontend
npm run dev
```
**Expected:** Frontend running on http://localhost:5173

---

## Test Scenarios

### ✅ Test 1: Stream Delete

**Steps:**
1. Login to the app
2. Click "Start Broadcast"
3. Fill in: Title: "Test Stream", Genre: "Test"
4. Click "Go Live"
5. Find your stream card (blue badge "Your Stream")
6. Click "Delete Stream"
7. Click "Delete" to confirm

**Expected Result:**
- ✅ Stream disappears immediately from UI
- ✅ No errors in console
- ✅ Refresh page → stream still gone

**If it fails:**
- Check console for errors
- Verify backend is running
- Check network tab for DELETE request

---

### ✅ Test 2: Broadcasting with Microphone

**Steps:**
1. Login as User 1
2. Click "Start Broadcast"
3. Enter details and click "Go Live"
4. Click "Start" button on your stream card
5. Browser will prompt for microphone permission → Click "Allow"

**Expected Result:**
- ✅ Red bar appears at bottom: "📡 Broadcasting with WebRTC ✓"
- ✅ Status shows "Broadcasting with WebRTC ✓" in green
- ✅ Console shows: "[WebRTC] Microphone access granted"
- ✅ Console shows: "[WebRTC] Audio tracks: 1"

**If microphone fails:**
- Error message should be clear and helpful
- Examples:
  - "Microphone permission denied..." → Go to browser settings
  - "No microphone found..." → Connect a microphone
  - "Microphone is already in use..." → Close other apps

---

### ✅ Test 3: Listening to Broadcast

**Open Incognito Window (or different browser):**
1. Go to http://localhost:5173
2. Register/Login as User 2
3. You should see User 1's stream with "LIVE" badge
4. Click "Listen" button on the stream card
5. Audio player appears at bottom
6. Click "Play" if needed

**Expected Result:**
- ✅ Bottom bar shows stream info
- ✅ You hear User 1's microphone audio
- ✅ Volume controls work
- ✅ Can mute/unmute

**Troubleshooting:**
- Check browser console for WebRTC logs
- Verify both users are in the same stream
- Check network connectivity
- Try refreshing both pages

---

### ✅ Test 4: Chat Functionality

**While listening:**
1. Click "Chat Only" or use the chat sidebar
2. Type a message
3. Press Enter

**Expected Result:**
- ✅ Message appears in chat
- ✅ User 1 sees the message
- ✅ Messages have timestamps
- ✅ Can edit/delete own messages

---

### ✅ Test 5: Multiple Listeners

**Open 2-3 Incognito windows:**
1. Each window: Register as different user
2. All users: Join User 1's stream
3. All users: Click "Listen"

**Expected Result:**
- ✅ All listeners hear the broadcast
- ✅ User 1 sees connection logs for each listener
- ✅ All can chat simultaneously
- ✅ Audio quality remains good

---

## Common Issues & Solutions

### Issue: "Microphone permission denied"
**Solution:**
1. Click lock icon in browser address bar
2. Find "Microphone" setting
3. Change to "Allow"
4. Refresh page and try again

### Issue: Can't hear audio
**Solution:**
1. Check volume isn't muted
2. Click "Play" button if paused
3. Verify broadcaster has started stream
4. Check browser console for errors
5. Try refreshing page

### Issue: Stream not appearing
**Solution:**
1. Check backend is running (port 3000)
2. Verify stream status is "isActive: true"
3. Refresh the streams list
4. Check browser console for API errors

### Issue: WebRTC connection fails
**Solution:**
1. Check browser console for detailed logs
2. Verify both users are authenticated
3. Try using same browser (different windows)
4. Clear browser cache and retry
5. Check firewall/network settings

---

## Browser Console Logs

### Successful Broadcasting:
```
[WebRTC] Requesting microphone access...
[WebRTC] Microphone access granted
[WebRTC] Audio tracks: 1
[WebRTC] Broadcaster joined stream room: <id>
[WebRTC] Broadcaster ready to accept listeners
[WebRTC] Broadcast setup complete - waiting for listeners
```

### Successful Listening:
```
[WebRTC] Listener joining stream: <id>
[WebRTC] Listener setup complete
[WebRTC] Listener received offer from: <broadcaster-id>
[WebRTC] Received ICE candidate from: <broadcaster-id>
[WebRTC] Received remote stream
```

### Connection Established:
```
Connection state with <peer-id>: connected
Remote track received: audio
```

---

## Performance Checks

### Normal CPU Usage:
- Broadcaster: 5-15% (depends on mic processing)
- Listener: 3-10%

### Normal Memory Usage:
- Frontend: 50-150 MB
- Backend: 100-200 MB

### Network:
- Audio bitrate: ~32-64 kbps per listener
- Chat: minimal (<1 kbps)

---

## Quick Commands

### Check if backend is running:
```powershell
curl http://localhost:3000
```

### Check if frontend is running:
```powershell
curl http://localhost:5173
```

### View backend logs:
Check Terminal 1

### View frontend logs:
Browser Console (F12)

### Force restart:
```powershell
# Kill processes on ports
npx kill-port 3000 5173
# Then restart
```

---

## Success Criteria

✅ **All Fixed Issues Working:**
- Stream delete: Instant removal, no errors
- Broadcasting: Mic access works, clear errors if fails
- Listening: Audio comes through clearly

✅ **No Console Errors:**
- No red errors in browser console
- Warning logs are okay (informational)

✅ **Good User Experience:**
- Actions feel responsive
- Error messages are helpful
- UI updates immediately

---

## Need Help?

Check the detailed reports:
- `PENDING_TASKS_ANALYSIS.md` - Full issue analysis
- `BUG_FIXES_REPORT.md` - Detailed technical fixes
- `FIXES_SUMMARY.md` - Executive summary

Or review the code changes in:
- `frontend/src/store/streamStore.ts`
- `frontend/src/lib/webrtc.ts`
- `frontend/src/components/StreamPlayer.tsx`
- `backend/src/chat/chat.gateway.ts`

---

**Happy Testing! 🎙️**
