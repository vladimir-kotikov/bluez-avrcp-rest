//  { '@': { name: 'Address', type: 's', access: 'read' } }
//  { '@': { name: 'Name', type: 's', access: 'read' } }
//  { '@': { name: 'Alias', type: 's', access: 'readwrite' } }
//  { '@': { name: 'Class', type: 'u', access: 'read' } }
//  { '@': { name: 'Powered', type: 'b', access: 'readwrite' } }
//  { '@': { name: 'Discoverable', type: 'b', access: 'readwrite' } }
//  { '@': { name: 'DiscoverableTimeout', type: 'u', access: 'readwrite' } }
//  { '@': { name: 'Pairable', type: 'b', access: 'readwrite' } }
//  { '@': { name: 'PairableTimeout', type: 'u', access: 'readwrite' } }
//  { '@': { name: 'Discovering', type: 'b', access: 'read' } }
//  { '@': { name: 'UUIDs', type: 'as', access: 'read' } }
//  { '@': { name: 'Modalias', type: 's', access: 'read' } }

import { DBus } from "dbus-native";
import { DBusProxy } from "./DBusProxy";

export class Adapter extends DBusProxy {

    constructor(bus: DBus, adapterPath: string) {
        super(bus, "org.bluez", `/org/bluez/` + adapterPath, "org.bluez.Adapter1");
    }

    public StartDiscovery() {
        return this.invokeMethod("StartDiscovery");
    }

    public SetDiscoveryFilter(properties: { [name: string]: any }[]) {
        return this.invokeMethod("SetDiscoveryFilter", {
            body: [properties],
            signature: "a{sv}",
        });
    }

    public StopDiscovery () {
        return this.invokeMethod("StopDiscovery");
    }

    public RemoveDevice(devicePath: string) {
        return this.invokeMethod("RemoveDevice", {
            body: [devicePath],
            signature: "o",
        });
    };
}
