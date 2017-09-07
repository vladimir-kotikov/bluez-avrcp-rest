
import * as dbus from "dbus-native";
import { Agent } from "./bluez/Agent";
import { MediaControl } from "./bluez/MediaControl";

const TAG = "[BLTH]"
const ADAPTER = "hci0";

export class BluetoothService {
    mediaControl: any;
    private bus: dbus.DBus;

    constructor() {
        this.bus = dbus.systemBus();
    }

    public async registerAgent() {
        try {
            await Agent.register(this.bus)
        } catch (err) {
            // Non-critical error - just log it
            console.error(TAG, `Failed to register agent: ${err}`);
        }
    }

    private async getPeripherals(): Promise<string[] | undefined> {
        return new Promise<string[]>((resolve, reject) => {
            this.bus.invoke({
                destination: "org.bluez",
                path: `/org/bluez/` + ADAPTER,
                interface: "org.freedesktop.DBus.Introspectable",
                member: "Introspect",
            }, (err: any, obj: { nodes?: string[] }) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(obj.nodes);
            });
        })
    }

    private async getMediaControl(): Promise<MediaControl | undefined> {
        if (!this.mediaControl) {
            const peripherals = await this.getPeripherals();
            if (!peripherals || peripherals.length === 0) {
                console.log(TAG, `Can't fing any connected peripherals`);
                return;
            }

            const peripheral = peripherals[0];
            this.mediaControl = new MediaControl(this.bus, ADAPTER, peripheral);
        }

        return this.mediaControl;
    }

    public async next() {
        const control = await this.getMediaControl();
        if (control) {
            control.Next();
        }
    }

    public async prev() {
        const control = await this.getMediaControl();
        if (control) {
            control.Previous();
        }
    }

    public async fastFwd() {
        const control = await this.getMediaControl();
        if (control) {
            control.FastForward();
        }
    }

    public async rewind() {
        const control = await this.getMediaControl();
        if (control) {
            control.Rewind();
        }
    }
}


