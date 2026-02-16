/**
 * Dock Your Boat Remote Control Client
 * TypeScript implementation of the remote control protocol
 */

import * as net from 'net';
import { EventEmitter } from 'events';
import {
    BPropType,
    BPropMessage,
    DYBMessage,
    BoatProperties,
    GameNotification,
    PlayerMessenger,
    ControlKey,
    ControlValue,
    ConnectionState,
    DYBEvents,
} from './types';

export interface DYBClientOptions {
    host: string;
    port: number;
    autoReconnect?: boolean;
    reconnectDelay?: number;
    groupId?: number;
}

export class DYBClient extends EventEmitter {
    private socket: net.Socket | null = null;
    private buffer: string = '';
    private state: ConnectionState = ConnectionState.Disconnected;
    private reconnectTimer: NodeJS.Timeout | null = null;

    private readonly options: Required<DYBClientOptions>;

    constructor(options: DYBClientOptions) {
        super();

        this.options = {
            host: options.host,
            port: options.port,
            autoReconnect: options.autoReconnect ?? true,
            reconnectDelay: options.reconnectDelay ?? 5000,
            groupId: options.groupId ?? 1,
        };
    }

    /**
     * Connect to the game server
     */
    public connect(): void {
        if (this.state === ConnectionState.Connected || this.state === ConnectionState.Connecting) {
            console.warn('Already connected or connecting');
            return;
        }

        this.state = ConnectionState.Connecting;
        console.log(`Connecting to ${this.options.host}:${this.options.port}...`);

        this.socket = new net.Socket();

        this.socket.on('connect', () => {
            this.state = ConnectionState.Connected;
            console.log('✓ Connected to game server');
            this.emit('connected');

        });

        this.socket.on('data', (data: Buffer) => {
            this.handleData(data.toString());
        });

        this.socket.on('error', (error: Error) => {
            this.state = ConnectionState.Error;
            console.error('Socket error:', error.message);
            this.emit('error', error);
        });

        this.socket.on('close', () => {
            const wasConnected = this.state === ConnectionState.Connected;
            this.state = ConnectionState.Disconnected;
            console.log('✗ Disconnected from game server');
            this.emit('disconnected');

            if (this.options.autoReconnect && wasConnected) {
                this.scheduleReconnect();
            }
        });

        this.socket.connect(this.options.port, this.options.host);
    }

    /**
     * Disconnect from the game server
     */
    public disconnect(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.socket) {
            this.socket.destroy();
            this.socket = null;
        }

        this.state = ConnectionState.Disconnected;
    }

    /**
     * Get current connection state
     */
    public getState(): ConnectionState {
        return this.state;
    }

    /**
     * Check if connected
     */
    public isConnected(): boolean {
        return this.state === ConnectionState.Connected;
    }

    /**
     * Send a control value to the game
     */
    public sendControl(key: ControlKey, value: ControlValue): void {
        const type = this.getTypeCode(value);
        const message: DYBMessage = {
            [key]: {
                t: type,
                v: value,
            },
        };

        this.sendMessage(message);
    }

    /**
     * Send rudder control (-1.0 to 1.0)
     */
    public sendRudder(value: number): void {
        this.sendControl('BoatRuder', this.clamp(value, -1, 1));
    }

    /**
     * Send throttle control (-1.0 to 1.0)
     */
    public sendThrottle(value: number, engine: number = 0): void {
        const key = `BoatThrottle${engine}` as ControlKey;
        this.sendControl(key, this.clamp(value, -1, 1));
    }

    /**
     * Send engine on/off
     */
    public sendEngineState(on: boolean): void {
        this.sendControl('BoatEngineOn', on);
    }

    /**
     * Send bow thruster control (-1, 0, 1)
     */
    public sendBowThruster(value: number): void {
        this.sendControl('BowThruster', Math.max(-1, Math.min(1, Math.round(value))));
    }

    /**
     * Send autopilot state
     */
    public sendAutopilot(active: boolean): void {
        this.sendControl('AP_active', active);
    }

    /**
     * Send autopilot heading adjustment
     */
    public sendHeadingAdjust(degrees: number): void {
        this.sendControl('AP_set', degrees);
    }

    /**
     * Send sail control (0.0 to 1.0)
     */
    public sendSailControl(sail: 'Main.Size' | 'Main.Sheet' | 'Genoa.Size' | 'Genoa.SheetLeft' | 'Genoa.SheetRight', value: number): void {
        const key = `Sail.${sail}` as ControlKey;
        this.sendControl(key, this.clamp(value, 0, 1));
    }





    /**
     * Send a raw message to the game
     */
    private sendMessage(message: DYBMessage): void {
        if (!this.isConnected() || !this.socket) {
            console.warn('Cannot send message: not connected');
            return;
        }

        try {
            const json = JSON.stringify(message);
            const data = `${this.options.groupId}${json}\0`;
            this.socket.write(data);

            console.log(`→ SENT: ${json}`);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    /**
     * Handle incoming data
     */
    private handleData(data: string): void {
        this.buffer += data;

        // Process complete lines
        while (this.buffer.includes('\n')) {
            const lineEnd = this.buffer.indexOf('\n');
            const line = this.buffer.substring(0, lineEnd);
            this.buffer = this.buffer.substring(lineEnd + 1);

            if (line.length > 0) {
                this.processMessage(line);
            }
        }
    }

    /**
     * Process a complete message line
     */
    private processMessage(line: string): void {
        try {
            // Remove GroupId prefix (first character)
            if (line.length < 2) {
                return;
            }

            const groupId = line[0];
            const jsonStr = line.substring(1);

            console.log(`← RECV [Group ${groupId}]: ${jsonStr}`);

            const message: DYBMessage = JSON.parse(jsonStr);
            this.emit('message', message);

            // Parse specific message types
            this.parseSpecialMessages(message);
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    }

    /**
     * Parse and emit specific message types
     */
    private parseSpecialMessages(message: DYBMessage): void {
        // PlayerMessenger (game to remote)
        if (message.PlayerMessenger && message.PlayerMessenger.t === 'J') {
            const messenger = message.PlayerMessenger.v as PlayerMessenger;

            if (messenger.Props) {
                console.log('📋 Boat Properties:', messenger.Props);
                this.emit('boatProperties', messenger.Props);
            }

            if (messenger.Msg) {
                console.log(`📢 Game Event: ${messenger.Msg.Type}.${messenger.Msg.Noti}`);
                this.emit('gameNotification', messenger.Msg);
            }
        }

        // Autopilot display
        if (message.AP_display && message.AP_display.t === 'S') {
            const display = message.AP_display.v as string;
            console.log(`🧭 Compass: ${display}`);
            this.emit('compassDisplay', display);
        }

        // Autopilot active state
        if (message.AP_active && message.AP_active.t === 'B') {
            console.log(`🤖 Autopilot: ${message.AP_active.v ? 'ON' : 'OFF'}`);
        }
    }

    /**
     * Schedule reconnection attempt
     */
    private scheduleReconnect(): void {
        if (this.reconnectTimer) {
            return;
        }

        console.log(`Reconnecting in ${this.options.reconnectDelay / 1000} seconds...`);

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect();
        }, this.options.reconnectDelay);
    }

    /**
     * Get BProp type code for a value
     */
    private getTypeCode(value: ControlValue): BPropType {
        if (typeof value === 'number') {
            return Number.isInteger(value) ? 'I' : 'F';
        } else if (typeof value === 'boolean') {
            return 'B';
        } else if (typeof value === 'string') {
            return 'S';
        } else if (typeof value === 'object') {
            return 'J';
        }
        return 'S';
    }

    /**
     * Clamp a number between min and max
     */
    private clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * Type-safe event emitter methods
     */
    public on<K extends keyof DYBEvents>(event: K, listener: DYBEvents[K]): this {
        return super.on(event, listener);
    }

    public emit<K extends keyof DYBEvents>(event: K, ...args: Parameters<DYBEvents[K]>): boolean {
        return super.emit(event, ...args);
    }
}

