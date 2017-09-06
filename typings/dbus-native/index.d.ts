declare module 'dbus-native' {
    export function systemBus(): DBus;

    interface DBusMessage {
        type?: number;
        serial?: number;
        destination: string;
        path: string;
        interface: string;
        body ?: any;
        signature ?: string
    }

    type MethodSignature = [string, string, string[], string[]];

    interface InterfaceDefinition {
        name: string;
        methods?: { [methodName: string]: MethodSignature }
    }

    interface DBus {
        // TODO: strict type for 'message', 'err' and 'result'
        invoke(message: DBusMessage, callback: (err?: any, result?: any) => void): void;
        // TODO: refine signature
        requestName(agentName: string, flags: number, callback: (err?: any) => void): void
        // TODO: refine signature
        exportInterface(implementation: {}, interfacePath: string, definition: InterfaceDefinition): void
    }
}