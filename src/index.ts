/**
 * Dock Your Boat Remote Control Demo
 * Proof of concept: Connect, receive data, send test commands
 */

import { DYBClient } from './DYBClient';
import { BoatProperties, GameNotification } from './types';

// Configuration
const GAME_HOST = process.env.GAME_HOST || 'localhost';
const GAME_PORT = parseInt(process.env.GAME_PORT || '2612', 10);
const USER_ID = '3e53b06574897e78ebde8d2570ef9c32';  // Your user ID

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║   Dock Your Boat - Remote Control Demo (TypeScript)   ║');
console.log('╚════════════════════════════════════════════════════════╝');
console.log();

// Create client
const client = new DYBClient({
    host: GAME_HOST,
    port: GAME_PORT,
    autoReconnect: true,
    reconnectDelay: 5000,
});

// Event handlers
client.on('connected', () => {
    console.log('✓ Connected to game server!\n');

    // Start test sequence after 2 seconds
    setTimeout(() => {
        console.log('✓ Subscription sent! Starting test sequence...\n');
        runTestSequence();
    }, 2000);
});

client.on('disconnected', () => {
    console.log('✗ Connection closed\n');
});

client.on('error', (error: Error) => {
    console.error('✗ Error:', error.message, '\n');
});

client.on('boatProperties', (props: BoatProperties) => {
    console.log('╔════════════════════════════════════════╗');
    console.log('║        BOAT PROPERTIES RECEIVED        ║');
    console.log('╠════════════════════════════════════════╣');
    console.log(`║ Engines:      ${props.EngineCount.toString().padEnd(24)}║`);
    console.log(`║ Thrusters:    ${(props.HasThrusters ? 'Yes' : 'No').padEnd(24)}║`);
    console.log(`║ Sails:        ${(props.HasSails ? 'Yes' : 'No').padEnd(24)}║`);
    console.log(`║ Low Power:    ${(props.HasLoPowerSwitch ? 'Yes' : 'No').padEnd(24)}║`);
    console.log('╚════════════════════════════════════════╝\n');
});

client.on('gameNotification', (notification: GameNotification) => {
    console.log(`📢 [${notification.Type}] ${notification.Noti}\n`);
});

client.on('compassDisplay', (display: string) => {
    const parts = display.split('.');
    if (parts.length === 3) {
        const [heading, dir1, dir2] = parts;
        const direction = ['HDG', 'COG', 'SET'].includes(dir1) ? dir2 : dir1;
        const type = ['HDG', 'COG', 'SET'].includes(dir1) ? dir1 : dir2;
        console.log(`🧭 Compass: ${heading}° ${direction} (${type})\n`);
    }
});

// Test sequence
let testRunning = false;

async function runTestSequence() {
    if (testRunning) return;
    testRunning = true;

    console.log('╔════════════════════════════════════════╗');
    console.log('║        STARTING TEST SEQUENCE          ║');
    console.log('╚════════════════════════════════════════╝\n');

    try {
        // Test 1: Engine control
        console.log('🔧 Test 1: Engine Control');
        console.log('   → Turning engine ON');
        client.sendEngineState(true);
        await sleep(2000);

        // Test 2: Rudder control
        console.log('\n🔧 Test 2: Rudder Control');
        console.log('   → Setting rudder to 50% right (0.5)');
        client.sendRudder(0.5);
        await sleep(2000);

        console.log('   → Setting rudder to center (0.0)');
        client.sendRudder(0.0);
        await sleep(2000);

        console.log('   → Setting rudder to 50% left (-0.5)');
        client.sendRudder(-0.5);
        await sleep(2000);

        console.log('   → Centering rudder');
        client.sendRudder(0.0);
        await sleep(1000);

        // Test 3: Throttle control
        console.log('\n🔧 Test 3: Throttle Control');
        console.log('   → Setting throttle to 25% (0.25)');
        client.sendThrottle(0.25);
        await sleep(2000);

        console.log('   → Increasing throttle to 50% (0.5)');
        client.sendThrottle(0.5);
        await sleep(2000);

        console.log('   → Increasing throttle to 75% (0.75)');
        client.sendThrottle(0.75);
        await sleep(2000);

        console.log('   → Full throttle! (1.0)');
        client.sendThrottle(1.0);
        await sleep(2000);

        console.log('   → Reducing to idle (0.0)');
        client.sendThrottle(0.0);
        await sleep(2000);

        // Test 4: Reverse
        console.log('\n🔧 Test 4: Reverse Throttle');
        console.log('   → Reverse 50% (-0.5)');
        client.sendThrottle(-0.5);
        await sleep(2000);

        console.log('   → Back to idle (0.0)');
        client.sendThrottle(0.0);
        await sleep(1000);

        // Test 5: Bow thruster
        console.log('\n🔧 Test 5: Bow Thruster');
        console.log('   → Bow thruster LEFT (-1)');
        client.sendBowThruster(-1);
        await sleep(2000);

        console.log('   → Bow thruster OFF (0)');
        client.sendBowThruster(0);
        await sleep(1000);

        console.log('   → Bow thruster RIGHT (1)');
        client.sendBowThruster(1);
        await sleep(2000);

        console.log('   → Bow thruster OFF (0)');
        client.sendBowThruster(0);
        await sleep(1000);

        // Test 6: Autopilot
        console.log('\n🔧 Test 6: Autopilot');
        console.log('   → Activating autopilot');
        client.sendAutopilot(true);
        await sleep(2000);

        console.log('   → Adjusting heading +10°');
        client.sendHeadingAdjust(10);
        await sleep(2000);

        console.log('   → Adjusting heading -10°');
        client.sendHeadingAdjust(-10);
        await sleep(2000);

        console.log('   → Deactivating autopilot');
        client.sendAutopilot(false);
        await sleep(1000);

        // Test 7: Sail controls (if boat has sails)
        console.log('\n🔧 Test 7: Sail Controls');
        console.log('   → Deploying main sail to 80%');
        client.sendSailControl('Main.Size', 0.8);
        await sleep(1500);

        console.log('   → Tightening main sheet to 60%');
        client.sendSailControl('Main.Sheet', 0.6);
        await sleep(1500);

        console.log('   → Deploying genoa to 100%');
        client.sendSailControl('Genoa.Size', 1.0);
        await sleep(1500);

        console.log('   → Adjusting genoa sheets to 50%');
        client.sendSailControl('Genoa.SheetLeft', 0.5);
        client.sendSailControl('Genoa.SheetRight', 0.5);
        await sleep(2000);

        // Test 8: Turn off engine
        console.log('\n🔧 Test 8: Shutdown');
        console.log('   → Turning engine OFF');
        client.sendEngineState(false);
        await sleep(1000);

        console.log('\n╔════════════════════════════════════════╗');
        console.log('║       TEST SEQUENCE COMPLETED!         ║');
        console.log('╚════════════════════════════════════════╝\n');

        console.log('💡 Demo will continue running to receive messages.');
        console.log('   Press Ctrl+C to exit.\n');

    } catch (error) {
        console.error('Error during test sequence:', error);
    } finally {
        testRunning = false;
    }
}

// Utility function
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\nShutting down gracefully...');
    client.disconnect();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n\nShutting down gracefully...');
    client.disconnect();
    process.exit(0);
});

// Connect to game
console.log(`Connecting to game at ${GAME_HOST}:${GAME_PORT}...\n`);
client.connect();

