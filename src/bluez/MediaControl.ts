import { DBus } from "dbus-native";
import { DBusProxy } from "./DBusProxy";
export class MediaControl extends DBusProxy {
    constructor(bus: DBus, adapter: string, device: string) {
        super(bus, "org.bluez", `/org/bluez/${adapter}/${device}`,
            "org.bluez.MediaControl1");
    }

    public async Play ()        { return this.invokeMethod("Play") };
    public async Pause ()       { return this.invokeMethod("Pause") };
    public async Stop ()        { return this.invokeMethod("Stop") };
    public async Next ()        { return this.invokeMethod("Next") };
    public async Previous ()    { return this.invokeMethod("Previous") };
    public async VolumeUp ()    { return this.invokeMethod("VolumeUp") };
    public async VolumeDown ()  { return this.invokeMethod("VolumeDown") };
    public async FastForward () { return this.invokeMethod("FastForward") };
    public async Rewind ()      { return this.invokeMethod("Rewind") };
}