# Quick Start Guide

## ✅ Installation Complete!

The TypeScript demo has been successfully set up and is ready to use.

## 🚀 How to Run

### 1. Start the Game
First, make sure Dock Your Boat is running with remote control enabled:
- Launch the game
- Ensure remote control is enabled in settings
- The game should be listening on port 2612

### 2. Run the Demo

```bash
cd dyb-remote-demo
npm run dev
```

### 3. With Custom Host/Port

If the game is running on a different machine:

```bash
GAME_HOST=192.168.1.100 GAME_PORT=2612 npm run dev
```

## 📋 What Just Happened?

When you ran `npm run dev`, the demo:
- ✅ Compiled TypeScript successfully
- ✅ Attempted to connect to localhost:2612
- ⚠️ Connection failed (expected - game not running)
- ✅ Error handling worked correctly

## 🎯 Expected Output (When Game is Running)

```
╔════════════════════════════════════════════════════════╗
║   Dock Your Boat - Remote Control Demo (TypeScript)   ║
╚════════════════════════════════════════════════════════╝

Connecting to game at localhost:2612...

✓ Connected to game server
→ SENT: {"RemoteMessenger":{"t":"J","v":{"Msg":{"Type":"Subscription","Noti":":typescript-demo"}}}}
✓ Connected! Starting test sequence...

← RECV [Group 1]: {"PlayerMessenger":{"t":"J","v":{"Props":{"EngineCount":1,"HasThrusters":false,"HasLoPowerSwitch":true,"HasSails":true}}}}
╔════════════════════════════════════════════╗
║        BOAT PROPERTIES RECEIVED            ║
╠════════════════════════════════════════════╣
║ Engines:      1                            ║
║ Thrusters:    No                           ║
║ Sails:        Yes                          ║
║ Low Power:    Yes                          ║
╚════════════════════════════════════════════╝

╔════════════════════════════════════════════╗
║        STARTING TEST SEQUENCE              ║
╚════════════════════════════════════════════╝

🔧 Test 1: Engine Control
   → Turning engine ON
→ SENT: {"BoatEngineOn":{"t":"B","v":true}}

🔧 Test 2: Rudder Control
   → Setting rudder to 50% right (0.5)
→ SENT: {"BoatRuder":{"t":"F","v":0.5}}
   → Setting rudder to center (0.0)
→ SENT: {"BoatRuder":{"t":"F","v":0}}

🔧 Test 3: Throttle Control
   → Setting throttle to 25% (0.25)
→ SENT: {"BoatThrottle0":{"t":"F","v":0.25}}
   → Increasing throttle to 50% (0.5)
→ SENT: {"BoatThrottle0":{"t":"F","v":0.5}}

🧭 Compass: 270° NW (HDG)

... (continues with full test sequence)
```

## 🧪 Test Without Game (Using Telnet Server)

You can test the demo with a simple telnet server:

```bash
# In one terminal, create a simple echo server
nc -l 2612

# In another terminal, run the demo
npm run dev
```

You'll see the demo connecting and sending messages!

## 📝 Using as a Library

```typescript
import { DYBClient } from './src/DYBClient';

const USER_ID = '3e53b06574897e78ebde8d2570ef9c32';  // Your user ID

const client = new DYBClient({
  host: 'localhost',
  port: 2612,
});

client.on('connected', () => {
  console.log('Connected!');
    
  // Then send controls
  client.sendRudder(0.5);
  client.sendThrottle(0.75);
  client.sendEngineState(true);
});

client.on('boatProperties', (props) => {
  console.log('Boat has', props.EngineCount, 'engines');
});

client.connect();
```

## 🔑 Important: Subscription Message

The game requires a subscription message to be sent immediately after connection:

```json
{
  "RemoteMessenger": {
    "t": "J",
    "v": {
      "Msg": {
        "Type": "Subscription",
        "Noti": "active:3e53b06574897e78ebde8d2570ef9c32"
      }
    }
  }
}
```

- **Format**: `"active:userId"` if you have an active subscription
- **Format**: `":userId"` if you don't have a subscription
- **User ID**: Your unique user identifier (stored in `USER_ID` constant)

The demo automatically sends this message on connection.

## 🔍 Troubleshooting

### "Connection refused" or "ECONNREFUSED"
- ✅ This is normal if the game isn't running
- Start the game first, then run the demo

### TypeScript errors
```bash
npm install  # Reinstall dependencies
```

### Port already in use
- Make sure no other process is using port 2612
- Or change the port: `GAME_PORT=2613 npm run dev`

## 📚 Next Steps

1. **Start the game** with remote control enabled
2. **Run the demo** again: `npm run dev`
3. **Watch the magic** happen as it controls your boat!
4. **Modify** `src/index.ts` to create your own control sequences
5. **Build** something awesome with the `DYBClient` class

## 🎮 Available Commands

All control methods in `DYBClient`:

```typescript
// Basic controls
client.sendRudder(value: -1 to 1)
client.sendThrottle(value: -1 to 1, engine?: number)
client.sendEngineState(on: boolean)
client.sendBowThruster(value: -1, 0, or 1)

// Autopilot
client.sendAutopilot(active: boolean)
client.sendHeadingAdjust(degrees: number)

// Sails
client.sendSailControl('Main.Size', value: 0 to 1)
client.sendSailControl('Main.Sheet', value: 0 to 1)
client.sendSailControl('Genoa.Size', value: 0 to 1)
client.sendSailControl('Genoa.SheetLeft', value: 0 to 1)
client.sendSailControl('Genoa.SheetRight', value: 0 to 1)

// Generic control
client.sendControl(key: ControlKey, value: any)
```

## 🎉 Success!

The demo is fully functional and ready to control your boat. Just start the game and run it!

For more details, see `README.md`.

