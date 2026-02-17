# Dock Your Boat - Remote Control Demo (TypeScript)

Dock your boat is a boat simulation game developed with Unity3D for Windows, Mac, iOs and Android by Klaus P Kobald Gmbh, Austria.

https://dock-your-boat.kobald.com/

A TypeScript proof of concept demonstrating connection to the Dock Your Boat game server, receiving game data, and sending control commands.
Feel free to use the code to create connections to customized controls.

## Features

- ✅ TCP socket connection to game server
- ✅ JSON protocol implementation
- ✅ Type-safe message handling
- ✅ Event-driven architecture
- ✅ Automatic reconnection
- ✅ Comprehensive test sequence
- ✅ Real-time data logging

## Installation

```bash
# Install dependencies
npm install

## Usage

# Run with default settings (localhost:2612)
npm run dev

```

### Custom Host/Port

```bash
# Set environment variables
GAME_HOST=192.168.1.100 GAME_PORT=2612 npm run dev
```

## What It Does

The demo automatically:

1. **Connects** to the game server
2. **Receives** and logs all incoming messages:
   - Boat properties (engine count, thrusters, sails)
   - Game notifications (spawned, events)
   - Compass/autopilot display updates
3. **Sends** a test sequence of commands:
   - Engine on/off
   - Rudder control (left, center, right)
   - Throttle control (0-100%, forward and reverse)
   - Bow thruster (left, off, right)
   - Autopilot (on, adjust heading, off)
   - Sail controls (main sail, genoa)

## Example Output

```
╔════════════════════════════════════════════════════════╗
║   Dock Your Boat - Remote Control Demo (TypeScript)   ║
╚════════════════════════════════════════════════════════╝

Connecting to game at localhost:2612...

✓ Connected to game server
→ SENT: {"RemoteMessenger":{"t":"J","v":{"Msg":{"Type":"Subscription","Noti":":typescript-demo"}}}}
✓ Connected! Starting test sequence...

← RECV [Group 1]: {"PlayerMessenger":{"t":"J","v":{"Props":{"EngineCount":1,"HasThrusters":false,"HasLoPowerSwitch":true,"HasSails":true}}}}
╔════════════════════════════════════════╗
║        BOAT PROPERTIES RECEIVED        ║
╠════════════════════════════════════════╣
║ Engines:      1                        ║
║ Thrusters:    No                       ║
║ Sails:        Yes                      ║
║ Low Power:    Yes                      ║
╚════════════════════════════════════════╝

╔════════════════════════════════════════╗
║        STARTING TEST SEQUENCE          ║
╚════════════════════════════════════════╝

🔧 Test 1: Engine Control
   → Turning engine ON
→ SENT: {"BoatEngineOn":{"t":"B","v":true}}

🔧 Test 2: Rudder Control
   → Setting rudder to 50% right (0.5)
→ SENT: {"BoatRuder":{"t":"F","v":0.5}}
   → Setting rudder to center (0.0)
→ SENT: {"BoatRuder":{"t":"F","v":0}}
   → Setting rudder to 50% left (-0.5)
→ SENT: {"BoatRuder":{"t":"F","v":-0.5}}

🔧 Test 3: Throttle Control
   → Setting throttle to 25% (0.25)
→ SENT: {"BoatThrottle0":{"t":"F","v":0.25}}
   → Increasing throttle to 50% (0.5)
→ SENT: {"BoatThrottle0":{"t":"F","v":0.5}}

← RECV [Group 1]: {"AP_display":{"t":"S","v":"270.NW.HDG"}}
🧭 Compass: 270° NW (HDG)

...
```

## Project Structure

```
dyb-remote-demo/
├── src/
│   ├── types.ts          # TypeScript type definitions
│   ├── DYBClient.ts      # Main client class
│   └── index.ts          # Demo application
├── dist/                 # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## API Usage

### Basic Connection

```typescript
import { DYBClient } from './DYBClient';

const USER_ID = '3e53b06574897e78ebde8d2570ef9c32';  // Your user ID

const client = new DYBClient({
  host: 'localhost',
  port: 2612,
  autoReconnect: true,
});

client.on('connected', () => {
  console.log('Connected!');  
});

client.connect();
```

### Sending Controls

```typescript
// Rudder (-1.0 to 1.0)
client.sendRudder(0.5);  // 50% right

// Throttle (-1.0 to 1.0)
client.sendThrottle(0.75);  // 75% forward

// Engine on/off
client.sendEngineState(true);

// Bow thruster (-1, 0, 1)
client.sendBowThruster(-1);  // Left

// Autopilot
client.sendAutopilot(true);
client.sendHeadingAdjust(10);  // +10 degrees

// Sails (0.0 to 1.0)
client.sendSailControl('Main.Size', 0.8);
client.sendSailControl('Main.Sheet', 0.6);
```

### Receiving Events

```typescript
// Boat properties
client.on('boatProperties', (props) => {
  console.log(`Engines: ${props.EngineCount}`);
  console.log(`Has sails: ${props.HasSails}`);
});

// Game notifications
client.on('gameNotification', (notification) => {
  console.log(`${notification.Type}.${notification.Noti}`);
});

// Compass display
client.on('compassDisplay', (display) => {
  console.log(`Compass: ${display}`);
});

// All messages
client.on('message', (message) => {
  console.log('Received:', message);
});
```

## Type Safety

All messages and controls are fully typed:

```typescript
// Type-safe control keys
type ControlKey = 
  | 'BoatRuder'
  | 'BoatThrottle0'
  | 'BoatEngineOn'
  | 'BowThruster'
  | 'AP_active'
  // ... etc

// Structured boat properties
interface BoatProperties {
  EngineCount: number;
  HasThrusters: boolean;
  HasLoPowerSwitch: boolean;
  HasSails: boolean;
}
```

## Development

```bash
# Watch mode (auto-recompile on changes)
npm run watch

# Run in development mode
npm run dev

```

## Testing with Game

1. **Start the game** with remote control enabled
2. **Run the demo**:
   ```bash
   npm run dev
   ```
3. **Observe**:
   - Connection status
   - Incoming boat properties
   - Test sequence execution
   - Real-time compass updates

## Troubleshooting

### Cannot connect

```bash
# Check if game is running and listening on port 2612
telnet localhost 2612

# Try with explicit host
GAME_HOST=192.168.1.100 npm run dev
```

### TypeScript errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Port already in use

The game uses port 2612 by default. Make sure:
- Game is running
- No firewall blocking the connection
- Correct IP address if not localhost

## Next Steps

This demo can be extended to:

- Build a web-based controller UI
- Add joystick/gamepad support
- Create a mobile app interface
- Implement data logging and replay
- Add virtual instruments (speed, compass, etc.)
- Create autopilot algorithms

## License

MIT

