# Voice Widget Component

A real-time voice interface widget that connects to Catalyst's production WebSocket endpoint for ultra-low latency voice conversations.

## Features

- **WebSocket Connection**: Connects to Catalyst's real-time voice WebSocket endpoint
- **PCM16 Audio Streaming**: Converts browser audio to PCM16 format (24kHz, mono) as required by Catalyst
- **Real-time Playback**: Receives and plays back audio responses from Catalyst
- **Visual Feedback**: Audio level visualization and connection status indicators
- **Design System Compliant**: Matches the per4ex.org glassmorphism design system

## Configuration

The widget can be configured via props or environment variables:

```tsx
<VoiceWidget 
  wsUrl="wss://api.catalyst.example.com/ws/voice"
  apiKey="your-api-key"
  tenantId="catalyst-widget"
/>
```

### Environment Variables

- `NEXT_PUBLIC_CATALYST_WS_URL`: WebSocket endpoint URL (default: `wss://api.catalyst.example.com/ws/voice`)
- `CATALYST_API_KEY`: API key for authentication (optional, can be passed as prop)
- `CATALYST_TENANT_ID`: Tenant ID for multi-tenancy (default: `catalyst-widget`)

## Usage

### Basic Integration

```tsx
import { VoiceWidget } from "@/components/voice-widget"

export default function MyPage() {
  return (
    <div>
      {/* Your page content */}
      <VoiceWidget />
    </div>
  )
}
```

### With Custom Configuration

```tsx
<VoiceWidget 
  wsUrl={process.env.NEXT_PUBLIC_CATALYST_WS_URL}
  apiKey={process.env.CATALYST_API_KEY}
  tenantId="my-tenant"
/>
```

## WebSocket Protocol

The widget communicates with Catalyst using the following protocol:

### Connection Parameters

- `api_key`: Authentication key (if provided)
- `tenant_id`: Tenant identifier
- `mode`: Always `"realtime"`
- `sample_rate`: `24000` (24kHz)
- `format`: `"pcm16"`

### Message Types

#### Outgoing (Client → Server)

1. **Session Creation**
   ```json
   {
     "type": "session.create",
     "config": {
       "namespace": "per4ex-kb"
     }
   }
   ```

2. **Session Resume**
   ```json
   {
     "type": "session.resume",
     "session_id": "session-id"
   }
   ```

3. **Start Audio Stream**
   ```json
   {
     "type": "input_audio_buffer.append",
     "audio": ""
   }
   ```

4. **Audio Data**: Binary PCM16 data (ArrayBuffer)

5. **Commit Audio**
   ```json
   {
     "type": "input_audio_buffer.commit"
   }
   ```

#### Incoming (Server → Client)

1. **Session Created/Resumed**
   ```json
   {
     "type": "session.created" | "session.resumed",
     "session_id": "session-id"
   }
   ```

2. **Audio Response**: Binary PCM16 data (Blob)

3. **Transcript** (optional)
   ```json
   {
     "type": "transcript",
     "text": "transcribed text"
   }
   ```

4. **Error**
   ```json
   {
     "type": "error",
     "message": "error message"
   }
   ```

## Audio Processing

### Recording

1. Requests microphone access with optimal settings:
   - Sample rate: 24kHz
   - Channels: Mono
   - Echo cancellation, noise suppression, auto gain control enabled

2. Uses Web Audio API to process audio:
   - Creates `AudioContext` at 24kHz
   - Uses `ScriptProcessorNode` to capture audio chunks
   - Converts Float32 samples to PCM16 format

3. Sends PCM16 binary data via WebSocket

### Playback

1. Receives PCM16 binary data from WebSocket
2. Decodes PCM16 to `AudioBuffer`
3. Plays audio using Web Audio API

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (may require user gesture for audio context)
- **Mobile**: Limited (Web Audio API support varies)

## Limitations

1. **Browser Audio Context**: Some browsers require user interaction before initializing audio context
2. **ScriptProcessorNode**: Deprecated API, but widely supported. Consider migrating to AudioWorklet for production
3. **CORS**: Direct WebSocket connections may be blocked. Consider using a proxy route
4. **Mobile Performance**: PCM16 conversion and WebSocket streaming may be resource-intensive on mobile devices

## Future Improvements

- [ ] Migrate to AudioWorklet for better performance
- [ ] Add WebSocket reconnection logic with exponential backoff
- [ ] Implement audio compression for better bandwidth usage
- [ ] Add transcript display
- [ ] Support for multiple audio input devices
- [ ] Add connection quality indicators
- [ ] Implement WebSocket proxy route for CORS handling

## Troubleshooting

### "Failed to access microphone"
- Ensure HTTPS (required for `getUserMedia`)
- Check browser permissions
- Verify microphone is connected and working

### "WebSocket connection failed"
- Verify the WebSocket URL is correct
- Check if the backend is running
- Verify CORS settings on the backend
- Consider using a proxy route

### "No audio playback"
- Check browser audio permissions
- Verify audio context is initialized
- Check browser console for errors

## Notes

This is a **frontend mockup** component. For production use:

1. Ensure the Catalyst backend WebSocket server is running and accessible
2. Configure proper authentication and authorization
3. Consider implementing a WebSocket proxy route for security/CORS
4. Add proper error handling and reconnection logic
5. Test thoroughly across different browsers and devices

