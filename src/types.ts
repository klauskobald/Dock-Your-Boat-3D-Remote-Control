/**
 * Type definitions for Dock Your Boat Remote Control Protocol
 */

/**
 * BProp type codes
 */
export type BPropType = 'F' | 'I' | 'B' | 'J' | 'S';

/**
 * Generic BProp message structure
 */
export interface BPropMessage<T = any> {
    t: BPropType;
    v: T;
}

/**
 * Complete message with property key
 */
export interface DYBMessage {
    [key: string]: BPropMessage;
}

/**
 * Boat properties received from game
 */
export interface BoatProperties {
    EngineCount: number;
    HasThrusters: boolean;
    HasLoPowerSwitch: boolean;
    HasSails: boolean;
}

/**
 * Game notification message
 */
export interface GameNotification {
    Type: string;
    Noti: string;
}

/**
 * PlayerMessenger message structure
 */
export interface PlayerMessenger {
    Props?: BoatProperties;
    Msg?: GameNotification;
}

/**
 * Control value types
 */
export type ControlValue = number | boolean | string;

/**
 * Available control keys
 */
export type ControlKey =
    | 'BoatRuder'
    | 'BoatThrottle0'
    | 'BoatThrottle1'
    | 'BoatEngineOn'
    | 'BowThruster'
    | 'LoPowerSwitch'
    | 'Sail.Main.Size'
    | 'Sail.Main.Sheet'
    | 'Sail.Genoa.Size'
    | 'Sail.Genoa.SheetLeft'
    | 'Sail.Genoa.SheetRight'
    | 'AP_active'
    | 'AP_set'
    | 'AP_display';

/**
 * Connection state
 */
export enum ConnectionState {
    Disconnected = 'DISCONNECTED',
    Connecting = 'CONNECTING',
    Connected = 'CONNECTED',
    Error = 'ERROR',
}

/**
 * Event types
 */
export interface DYBEvents {
    connected: () => void;
    disconnected: () => void;
    error: (error: Error) => void;
    message: (message: DYBMessage) => void;
    boatProperties: (props: BoatProperties) => void;
    gameNotification: (notification: GameNotification) => void;
    compassDisplay: (display: string) => void;
}

